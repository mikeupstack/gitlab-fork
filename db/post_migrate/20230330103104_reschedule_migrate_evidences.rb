# frozen_string_literal: true

# rubocop:disable BackgroundMigration/MissingDictionaryFile

class RescheduleMigrateEvidences < Gitlab::Database::Migration[2.1]
  restrict_gitlab_migration gitlab_schema: :gitlab_main

  MIGRATION = 'MigrateEvidencesForVulnerabilityFindings'
  DELAY_INTERVAL = 2.minutes
  SUB_BATCH_SIZE = 500
  BATCH_SIZE = 10000

  def up
    delete_batched_background_migration(MIGRATION, :vulnerability_occurrences, :id, [])

    queue_batched_background_migration(
      MIGRATION,
      :vulnerability_occurrences,
      :id,
      job_interval: DELAY_INTERVAL,
      batch_size: BATCH_SIZE,
      sub_batch_size: SUB_BATCH_SIZE
    )
  end

  def down
    delete_batched_background_migration(MIGRATION, :vulnerability_occurrences, :id, [])
  end
end
# rubocop:enable BackgroundMigration/MissingDictionaryFile
