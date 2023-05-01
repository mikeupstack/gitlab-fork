# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Gitlab::Utils::UsernameAndEmailGenerator, feature_category: :system_access do
  let(:username_prefix) { 'username_prefix' }
  let(:email_domain) { 'example.com' }

  subject { described_class.new(username_prefix: username_prefix, email_domain: email_domain) }

  describe 'email domain' do
    it 'defaults to `Gitlab.config.gitlab.host`' do
      expect(described_class.new(username_prefix: username_prefix).email).to end_with("@#{Gitlab.config.gitlab.host}")
    end

    context 'when specified' do
      it 'uses the specified email domain' do
        expect(subject.email).to end_with("@#{email_domain}")
      end
    end
  end

  include_examples 'username and email pair is generated by Gitlab::Utils::UsernameAndEmailGenerator'
end