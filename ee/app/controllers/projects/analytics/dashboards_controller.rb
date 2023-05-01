# frozen_string_literal: true

module Projects
  module Analytics
    class DashboardsController < Projects::ApplicationController
      include ProductAnalyticsTracking

      feature_category :product_analytics

      before_action :dashboards_enabled!, only: [:index]
      before_action :authorize_read_combined_project_analytics_dashboards!

      def index; end

      private

      def dashboards_enabled!
        render_404 unless ::Feature.enabled?(:combined_analytics_dashboards, project) &&
          project.licensed_feature_available?(:combined_project_analytics_dashboards)
      end
    end
  end
end
