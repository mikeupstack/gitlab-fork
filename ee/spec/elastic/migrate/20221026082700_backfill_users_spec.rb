# frozen_string_literal: true

require 'spec_helper'
require File.expand_path('ee/elastic/migrate/20221026082700_backfill_users.rb')
require File.expand_path('ee/spec/elastic/migrate/migration_shared_examples.rb')

RSpec.describe BackfillUsers, feature_category: :global_search do
  it_behaves_like 'a deprecated Advanced Search migration', 20221026082700
end
