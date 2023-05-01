require 'spec_helper'
require 'fetch_shared_examples'
require 'sidekiq/base_reliable_fetch'
require 'sidekiq/semi_reliable_fetch'

describe Sidekiq::SemiReliableFetch do
  include_examples 'a Sidekiq fetcher'

  describe '#retrieve_work' do
    context 'timeout config' do
      let(:queues) { ['stuff_to_do'] }
      let(:fetcher) { described_class.new(queues: queues) }

      before do
        stub_env('SIDEKIQ_SEMI_RELIABLE_FETCH_TIMEOUT', timeout)
      end

      context 'when the timeout is not configured' do
        let(:timeout) { nil }

        it 'brpops with the default timeout timeout' do
          Sidekiq.redis do |connection|
            expect(connection).to receive(:brpop).with("queue:stuff_to_do", { timeout: 2 }).once.and_call_original

            fetcher.retrieve_work
          end
        end
      end

      context 'when the timeout is set in the env' do
        let(:timeout) { '5' }

        it 'brpops with the default timeout timeout' do
          Sidekiq.redis do |connection|
            expect(connection).to receive(:brpop).with("queue:stuff_to_do", { timeout: 5 }).once.and_call_original

            fetcher.retrieve_work
          end
        end
      end
    end
  end
end
