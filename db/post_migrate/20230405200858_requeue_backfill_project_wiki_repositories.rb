# frozen_string_literal: true

# rubocop:disable BackgroundMigration/MissingDictionaryFile
class RequeueBackfillProjectWikiRepositories < Gitlab::Database::Migration[2.1]
  MIGRATION = "BackfillProjectWikiRepositories"
  DELAY_INTERVAL = 2.minutes
  BATCH_SIZE = 1000
  SUB_BATCH_SIZE = 100

  restrict_gitlab_migration gitlab_schema: :gitlab_main

  def up
    delete_batched_background_migration(MIGRATION, :projects, :id, [])

    queue_batched_background_migration(
      MIGRATION,
      :projects,
      :id,
      job_interval: DELAY_INTERVAL,
      batch_size: BATCH_SIZE,
      sub_batch_size: SUB_BATCH_SIZE
    )
  end

  def down
    delete_batched_background_migration(MIGRATION, :projects, :id, [])
  end
end
# rubocop:enable BackgroundMigration/MissingDictionaryFile
