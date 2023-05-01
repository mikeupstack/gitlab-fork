# frozen_string_literal: true

module QA
  module Page
    module Project
      module Monitor
        module Incidents
          class Index < Page::Base
            view 'app/assets/javascripts/incidents/components/incidents_list.vue' do
              element :create_incident_button
              element :incident_link
            end

            def create_incident
              click_element :create_incident_button
            end

            def has_incident?(wait: Support::Repeater::DEFAULT_MAX_WAIT_TIME, title: nil)
              wait_until(max_duration: wait) { has_element?(:incident_link, text: title) }
            end

            def has_no_incident?(title: nil)
              has_no_element?(:incident_link, text: title)
            end

            def go_to_tab(tab)
              click_link_with_text(tab)
            end
          end
        end
      end
    end
  end
end
