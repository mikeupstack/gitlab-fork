# frozen_string_literal: true

module EE
  module Gitlab
    module GonHelper
      extend ::Gitlab::Utils::Override

      override :add_gon_variables
      def add_gon_variables
        super

        gon.roadmap_epics_limit = 1000

        if ::Gitlab.com?
          gon.subscriptions_url                = ::Gitlab::SubscriptionPortal::SUBSCRIPTIONS_URL
          gon.subscriptions_legacy_sign_in_url = ::Gitlab::SubscriptionPortal::SUBSCRIPTIONS_LEGACY_SIGN_IN_URL
          gon.payment_form_url                 = ::Gitlab::SubscriptionPortal::PAYMENT_FORM_URL
          gon.payment_validation_form_id       = ::Gitlab::SubscriptionPortal::PAYMENT_VALIDATION_FORM_ID
          gon.registration_validation_form_url = ::Gitlab::SubscriptionPortal::REGISTRATION_VALIDATION_FORM_URL
        end
      end

      # Exposes if a licensed feature is available.
      #
      # name - The name of the licensed feature
      # obj  - the object to check the licensed feature on (project, namespace)
      def push_licensed_feature(name, obj = nil)
        enabled = if obj
                    obj.feature_available?(name)
                  else
                    ::License.feature_available?(name)
                  end

        push_to_gon_attributes(:licensed_features, name, enabled)
      end
    end
  end
end
