# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Gitlab::NotifyUponDeath, feature_category: :shared do
  let(:worker_class) do
    Class.new do
      include Sidekiq::Worker
      include Gitlab::NotifyUponDeath
    end
  end

  describe '.sidekiq_retries_exhausted' do
    it 'notifies the JobWaiter when 3 arguments are given and the last is a String' do
      job = { 'args' => [12, {}, '123abc'], 'jid' => '123' }

      expect(Gitlab::JobWaiter)
        .to receive(:notify)
        .with('123abc', '123')

      worker_class.sidekiq_retries_exhausted_block.call(job)
    end

    it 'does not notify the JobWaiter when only 2 arguments are given' do
      job = { 'args' => [12, {}], 'jid' => '123' }

      expect(Gitlab::JobWaiter)
        .not_to receive(:notify)

      worker_class.sidekiq_retries_exhausted_block.call(job)
    end

    it 'does not notify the JobWaiter when only 1 argument is given' do
      job = { 'args' => [12], 'jid' => '123' }

      expect(Gitlab::JobWaiter)
        .not_to receive(:notify)

      worker_class.sidekiq_retries_exhausted_block.call(job)
    end

    it 'does not notify the JobWaiter when the last argument is not a String' do
      job = { 'args' => [12, {}, 40], 'jid' => '123' }

      expect(Gitlab::JobWaiter)
        .not_to receive(:notify)

      worker_class.sidekiq_retries_exhausted_block.call(job)
    end
  end
end
