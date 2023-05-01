---
stage: Verify
group: Pipeline Execution
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Add new tables to the CI database

The [pipeline data partitioning](../../architecture/blueprints/ci_data_decay/pipeline_partitioning.md)
design blueprint describes how to partition existing tables in the CI domain. However,
you still need to add tables for new features. Sometimes these tables hold
references to larger tables that need to be partitioned. To reduce future
work, all tables that use a `belongs_to` association to partitionable tables
should be partitioned from the start.

## Create a new routing table

The database helpers for creating tables do not accept partitioning options,
so the best solution is to create the tables using raw SQL:

```ruby
  enable_lock_retries!

  def up
    execute(<<~SQL)
      CREATE TABLE p_ci_examples (
        id bigint NOT NULL,
        partition_id bigint NOT NULL,
        build_id bigint NOT NULL,
        PRIMARY KEY (id, partition_id),
        CONSTRAINT fk_bb490f12fe_p FOREIGN KEY (partition_id, build_id)
           REFERENCES ci_builds(partition_id, id)
           ON UPDATE CASCADE ON DELETE CASCADE
      )
      PARTITION BY LIST (partition_id);
    SQL
  end

  def down
    drop_table :p_ci_examples
  end
```

This table is called a routing table and it does not hold any data. The
data is stored in partitions.

When creating the routing table:

- The table name must start with the `p_` prefix. There are analyzers in place to ensure that all queries go
  through the routing tables and do not access the partitions directly.
- Each new table needs a `partition_id` column and its value must equal
  the value from the related association. In this example, that is `ci_builds`. All resources
  belonging to a pipeline share the same `partition_id` value.
- The primary key must have the columns ordered this way to allow efficient
  search only by `id`.
- The foreign key constraint must include the `ON UPDATE CASCADE` option because
  the `partition_id` value should be able to update it for re-balancing the
  partitions.

## Create the first partition

Usually, you rely on the application to create the initial partition at boot time.
However, due to the high traffic on the CI tables and the large number of nodes,
it can be difficult to acquire a lock on the referenced table.
Consequently, during deployment, a node may fail to start.
To prevent this failure, you must ensure that the partition is already in place before
the application runs:

```ruby
  disable_ddl_transaction!

  def up
    with_lock_retries do
      connection.execute(<<~SQL)
        LOCK TABLE ci_builds IN SHARE UPDATE EXCLUSIVE MODE;
        LOCK TABLE ONLY p_ci_examples IN ACCESS EXCLUSIVE MODE;
      SQL

      connection.execute(<<~SQL)
        CREATE TABLE IF NOT EXISTS gitlab_partitions_dynamic.ci_examples_100
          PARTITION OF p_ci_examples
          FOR VALUES IN (100);
      SQL
    end
  end
```

Partitions are created in `gitlab_partitions_dynamic` schema.

When creating a partition, remember:

- Partition names do not use the `p_` prefix.
- The default value for `partition_id` is `100`.

## Cascade the partition value

To cascade the partition value, the module should use the `Ci::Partitionable` module:

```ruby
class Ci::Example < Ci::ApplicationRecord
  include Ci::Partitionable

  self.table_name = :p_ci_examples
  self.primary_key = :id

  belongs_to :build, class_name: 'Ci::Build'
  partitionable scope: :build, partitioned: true
end
```

## Manage partitions

The model must be included in the [`PARTITIONABLE_MODELS`](https://gitlab.com/gitlab-org/gitlab/-/blob/920147293ae304639915f66b260dc14e4f629850/app/models/concerns/ci/partitionable.rb#L25-44)
list because it is used to test that the `partition_id` is
propagated correctly.

If it's missing, specifying `partitioned: true` creates the first partition. The model also needs to be registered in the
[`postgres_partitioning.rb`](https://gitlab.com/gitlab-org/gitlab/-/blob/920147293ae304639915f66b260dc14e4f629850/config/initializers/postgres_partitioning.rb)
initializer.
