# frozen_string_literal: true

# See https://docs.gitlab.com/ee/development/migration_style_guide.html
# for more information on how to write migrations for GitLab.

class BackfillNamespaceLdapSettings < Gitlab::Database::Migration[2.1]
  restrict_gitlab_migration gitlab_schema: :gitlab_main
  disable_ddl_transaction!

  DOWNTIME = false
  MIGRATION = 'BackfillNamespaceLdapSettings'
  TABLE_NAME = 'namespaces'
  PRIMARY_KEY = :id
  INTERVAL = 2.minutes

  def up
    queue_batched_background_migration(
      MIGRATION,
      TABLE_NAME,
      PRIMARY_KEY,
      job_interval: INTERVAL
    )
  end

  def down
    delete_batched_background_migration(
      MIGRATION,
      TABLE_NAME,
      PRIMARY_KEY,
      []
    )
  end
end
