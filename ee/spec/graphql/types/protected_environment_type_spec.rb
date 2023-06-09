# frozen_string_literal: true

require 'spec_helper'

RSpec.describe GitlabSchema.types['ProtectedEnvironment'] do
  specify { expect(described_class.graphql_name).to eq('ProtectedEnvironment') }

  it 'includes the expected fields' do
    expected_fields = %w[
      name project group deployAccessLevels approvalRules required_approval_count
    ]

    expect(described_class).to include_graphql_fields(*expected_fields)
  end
end
