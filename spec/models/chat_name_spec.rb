# frozen_string_literal: true

require 'spec_helper'

RSpec.describe ChatName, feature_category: :integrations do
  let_it_be(:chat_name) { create(:chat_name) }

  subject { chat_name }

  it { is_expected.to belong_to(:user) }

  it { is_expected.to validate_presence_of(:user) }
  it { is_expected.to validate_presence_of(:team_id) }
  it { is_expected.to validate_presence_of(:chat_id) }

  it { is_expected.to validate_uniqueness_of(:chat_id).scoped_to(:team_id) }

  describe '#update_last_used_at', :clean_gitlab_redis_shared_state do
    it 'updates the last_used_at timestamp' do
      expect(subject.last_used_at).to be_nil

      subject.update_last_used_at

      expect(subject.last_used_at).to be_present
    end

    it 'does not update last_used_at if it was recently updated' do
      subject.update_last_used_at

      time = subject.last_used_at

      subject.update_last_used_at

      expect(subject.last_used_at).to eq(time)
    end
  end

  it_behaves_like 'it has loose foreign keys' do
    let(:factory_name) { :chat_name }
  end
end
