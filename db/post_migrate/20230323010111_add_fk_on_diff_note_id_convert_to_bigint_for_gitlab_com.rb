# frozen_string_literal: true

class AddFkOnDiffNoteIdConvertToBigintForGitlabCom < Gitlab::Database::Migration[2.1]
  include Gitlab::Database::MigrationHelpers::ConvertToBigint

  disable_ddl_transaction!

  SOURCE_TABLE_NAME = :note_diff_files
  TARGET_TABLE_NAME = :notes
  FK_NAME = :fk_note_diff_files_diff_note_id_convert_to_bigint

  def up
    return unless should_run?

    # This will replace the existing fk_rails_3d66047aeb
    # when we swap the integer and bigint columns
    add_concurrent_foreign_key SOURCE_TABLE_NAME, TARGET_TABLE_NAME,
      column: :diff_note_id_convert_to_bigint,
      name: FK_NAME,
      on_delete: :cascade,
      reverse_lock_order: true,
      validate: false
  end

  def down
    return unless should_run?

    with_lock_retries do
      remove_foreign_key_if_exists(
        SOURCE_TABLE_NAME,
        TARGET_TABLE_NAME,
        name: FK_NAME,
        reverse_lock_order: true
      )
    end
  end

  private

  def should_run?
    com_or_dev_or_test_but_not_jh?
  end
end
