# frozen_string_literal: true

class AddUniqueIndexIssueUserMentionsNoteIdConvertToBigintForGitlabCom < Gitlab::Database::Migration[2.1]
  include Gitlab::Database::MigrationHelpers::ConvertToBigint

  disable_ddl_transaction!

  TABLE_NAME = :issue_user_mentions
  INDEX_NAME = :index_issue_user_mentions_on_note_id_convert_to_bigint

  def up
    return unless should_run?

    # This will replace the existing index_issue_user_mentions_on_note_id
    add_concurrent_index TABLE_NAME, :note_id_convert_to_bigint, unique: true,
      name: INDEX_NAME,
      where: 'note_id_convert_to_bigint IS NOT NULL'
  end

  def down
    return unless should_run?

    remove_concurrent_index_by_name(TABLE_NAME, INDEX_NAME)
  end

  private

  def should_run?
    com_or_dev_or_test_but_not_jh?
  end
end
