# frozen_string_literal: true

class AddIndexOnProjectIdOnMlCandidates < Gitlab::Database::Migration[2.1]
  disable_ddl_transaction!

  INDEX_NAME = 'index_ml_candidates_on_project_id'

  def up
    add_concurrent_index :ml_candidates, :project_id, name: INDEX_NAME
  end

  def down
    remove_concurrent_index_by_name :ml_candidates, INDEX_NAME
  end
end
