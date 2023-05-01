# frozen_string_literal: true

# rubocop:disable Style/Documentation
module Gitlab
  module BackgroundMigration
    class MigrateVulnerabilitiesFeedbackToVulnerabilitiesStateTransition < BatchedMigrationJob
      feature_category :database

      def perform; end
    end
  end
end

Gitlab::BackgroundMigration::MigrateVulnerabilitiesFeedbackToVulnerabilitiesStateTransition.prepend_mod
# rubocop:enable Style/Documentation
