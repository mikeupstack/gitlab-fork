# frozen_string_literal: true

module QA
  module Page
    module Project
      module SubMenus
        module SuperSidebar
          module Plan
            def self.included(base)
              super

              base.class_eval do
                include QA::Page::SubMenus::SuperSidebar::Plan
              end
            end

            def go_to_requirements
              open_plan_submenu("Requirements")
            end
          end
        end
      end
    end
  end
end
