# frozen_string_literal: true

module Ci
  module Components
    class FetchService
      include Gitlab::Utils::StrongMemoize

      TEMPLATE_FILE = 'template.yml'

      COMPONENT_PATHS = [
        ::Gitlab::Ci::Components::InstancePath
      ].freeze

      def initialize(address:, current_user:)
        @address = address
        @current_user = current_user
      end

      def execute
        unless component_path_class
          return ServiceResponse.error(
            message: "#{error_prefix} the component path is not supported",
            reason: :unsupported_path)
        end

        component_path = component_path_class.new(address: address, content_filename: TEMPLATE_FILE)
        content = component_path.fetch_content!(current_user: current_user)

        if content.present?
          ServiceResponse.success(payload: { content: content, path: component_path })
        else
          ServiceResponse.error(message: "#{error_prefix} content not found", reason: :content_not_found)
        end
      rescue Gitlab::Access::AccessDeniedError
        ServiceResponse.error(
          message: "#{error_prefix} project does not exist or you don't have sufficient permissions",
          reason: :not_allowed)
      end

      private

      attr_reader :current_user, :address

      def component_path_class
        COMPONENT_PATHS.find { |klass| klass.match?(address) }
      end
      strong_memoize_attr :component_path_class

      def error_prefix
        "component '#{address}' -"
      end
    end
  end
end
