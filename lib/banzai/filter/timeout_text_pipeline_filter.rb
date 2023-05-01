# frozen_string_literal: true

module Banzai
  module Filter
    # Text Filter that wraps a filter in a Gitlab::RenderTimeout.
    # This way partial results can be returned, and the entire pipeline
    # is not killed.
    #
    # This should not be used for any filter that must be allowed to complete,
    # like a `ReferenceRedactorFilter`
    #
    class TimeoutTextPipelineFilter < HTML::Pipeline::TextFilter
      RENDER_TIMEOUT = 10.seconds

      def call
        Gitlab::RenderTimeout.timeout(foreground: RENDER_TIMEOUT) { call_with_timeout }
      rescue Timeout::Error => e
        class_name = self.class.name.demodulize
        timeout_counter.increment(source: class_name)
        Gitlab::ErrorTracking.track_exception(e, project_id: context[:project]&.id, class_name: class_name)

        # we've timed out, but some work may have already been completed,
        # so go ahead and return the text
        @text
      end

      def call_with_timeout
        raise NotImplementedError
      end

      private

      def timeout_counter
        Gitlab::Metrics.counter(:banzai_filter_timeouts_total, 'Count of the Banzai filters that time out')
      end
    end
  end
end