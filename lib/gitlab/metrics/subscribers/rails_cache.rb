# frozen_string_literal: true

module Gitlab
  module Metrics
    module Subscribers
      # Class for tracking the total time spent in Rails cache calls
      # http://guides.rubyonrails.org/active_support_instrumentation.html
      class RailsCache < ActiveSupport::Subscriber
        attach_to :active_support

        def cache_read_multi(event)
          observe(:read_multi, event)

          return unless current_transaction

          current_transaction.observe(:gitlab_cache_read_multikey_count, event.payload[:key].size) do
            buckets [10, 50, 100, 1000]
            docstring 'Number of keys for mget in read_multi/fetch_multi'
          end
        end

        def cache_read(event)
          observe(:read, event)

          return unless current_transaction
          return if event.payload[:super_operation] == :fetch

          unless event.payload[:hit]
            current_transaction.increment(:gitlab_cache_misses_total, 1) do
              docstring 'Cache read miss'
            end
          end
        end

        def cache_write(event)
          observe(:write, event)
        end

        def cache_delete(event)
          observe(:delete, event)
        end

        def cache_exist?(event)
          observe(:exists, event)
        end

        def cache_fetch_hit(event)
          return unless current_transaction

          current_transaction.increment(:gitlab_transaction_cache_read_hit_count_total, 1)
        end

        def cache_generate(event)
          return unless current_transaction

          current_transaction.increment(:gitlab_cache_misses_total, 1) do
            docstring 'Cache read miss'
          end

          current_transaction.increment(:gitlab_transaction_cache_read_miss_count_total, 1)
        end

        def observe(key, event)
          return unless current_transaction

          labels = { operation: key, store: event.payload[:store].split('::').last }

          current_transaction.increment(:gitlab_cache_operations_total, 1, labels) do
            docstring 'Cache operations'
            label_keys labels.keys
          end

          metric_cache_operation_duration_seconds.observe(labels, event.duration / 1000.0)
        end

        private

        def current_transaction
          ::Gitlab::Metrics::WebTransaction.current
        end

        def metric_cache_operation_duration_seconds
          @metric_cache_operation_duration_seconds ||= ::Gitlab::Metrics.histogram(
            :gitlab_cache_operation_duration_seconds,
            'Cache access time',
            {},
            Gitlab::Instrumentation::Redis::QUERY_TIME_BUCKETS
          )
        end
      end
    end
  end
end
