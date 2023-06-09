# frozen_string_literal: true

module QA
  module Page
    module Project
      module SubMenus
        module Monitor
          extend QA::Page::PageConcern

          def self.included(base)
            super

            base.class_eval do
              include QA::Page::Project::SubMenus::Common
            end
          end

          def go_to_monitor_incidents
            hover_monitor do
              within_submenu do
                click_element(:sidebar_menu_item_link, menu_item: 'Incidents')
              end
            end
          end

          def go_to_monitor_alerts
            hover_monitor do
              within_submenu do
                click_element(:sidebar_menu_item_link, menu_item: 'Alerts')
              end
            end
          end

          def go_to_monitor_on_call_schedules
            hover_monitor do
              within_submenu do
                click_element(:sidebar_menu_item_link, menu_item: 'On-call Schedules')
              end
            end
          end

          def go_to_monitor_escalation_policies
            hover_monitor do
              within_submenu do
                click_element(:sidebar_menu_item_link, menu_item: 'Escalation Policies')
              end
            end
          end

          private

          def hover_monitor
            within_sidebar do
              scroll_to_element(:sidebar_menu_link, menu_item: 'Monitor')
              find_element(:sidebar_menu_link, menu_item: 'Monitor').hover

              yield
            end
          end
        end
      end
    end
  end
end
