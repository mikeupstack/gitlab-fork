# frozen_string_literal: true

module Gitlab
  module CircuitBreaker
    class Notifier
      CircuitBreakerError = Class.new(RuntimeError)

      def notify(service_name, event)
        exception = CircuitBreakerError.new("Service #{service_name}: #{event}")
        exception.set_backtrace(Gitlab::BacktraceCleaner.clean_backtrace(caller))

        Gitlab::ErrorTracking.track_exception(exception)
      end

      def notify_warning(service_name, message)
        # no-op
      end

      def notify_run(service_name, &block)
        # no-op
      end
    end
  end
end
