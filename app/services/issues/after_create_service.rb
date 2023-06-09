# frozen_string_literal: true

module Issues
  class AfterCreateService < Issues::BaseService
    def execute(issue)
      todo_service.new_issue(issue, current_user)
      track_incident_action(current_user, issue, :incident_created)
    end
  end
end

Issues::AfterCreateService.prepend_mod
