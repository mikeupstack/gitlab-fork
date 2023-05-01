# frozen_string_literal: true

module Admin
  module AbuseReportsHelper
    def abuse_reports_list_data(reports)
      {
        abuse_reports_data: {
          categories: AbuseReport.categories.keys,
          reports: Admin::AbuseReportSerializer.new.represent(reports),
          pagination: {
            current_page: reports.current_page,
            per_page: reports.limit_value,
            total_items: reports.total_count
          }
        }.to_json
      }
    end
  end
end
