# frozen_string_literal: true

require_relative 'db_cleaner'

RSpec.configure do |config|
  include DbCleaner

  # Ensure the database is empty at the start of the suite run with :deletion strategy
  # neither the sequence is reset nor the tables are vacuum, but this provides
  # better I/O performance on machines with slower storage
  config.before(:suite) do
    setup_database_cleaner
    DatabaseCleaner.clean_with(:deletion)
  end

  config.around(:each, :delete) do |example|
    self.class.use_transactional_tests = false

    example.run

    delete_from_all_tables!(except: deletion_except_tables)

    self.class.use_transactional_tests = true
  end
end
