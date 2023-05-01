# frozen_string_literal: true

require 'spec_helper'

RSpec.describe 'getting push access levels for a branch protection', feature_category: :source_code_management do
  it_behaves_like 'a GraphQL query for access levels', :push
end
