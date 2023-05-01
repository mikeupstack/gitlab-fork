# frozen_string_literal: true

module Sidebars
  module Search
    class Panel < ::Sidebars::Panel
      override :aria_label
      def aria_label
        _('Search')
      end

      override :super_sidebar_context_header
      def super_sidebar_context_header
        @super_sidebar_context_header ||= {
          title: aria_label,
          icon: 'search'
        }
      end
    end
  end
end
