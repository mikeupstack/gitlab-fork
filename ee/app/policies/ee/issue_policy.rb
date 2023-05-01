# frozen_string_literal: true

module EE
  module IssuePolicy
    extend ActiveSupport::Concern

    prepended do
      with_scope :subject
      condition(:ai_available) do
        ::Feature.enabled?(:openai_experimentation) && @subject.send_to_ai?
      end

      with_scope :subject
      condition(:summarize_notes_enabled) do
        ::Feature.enabled?(:summarize_comments, subject_container) &&
          subject_container.licensed_feature_available?(:summarize_notes)
      end

      rule { can_be_promoted_to_epic }.policy do
        enable :promote_to_epic
      end

      rule do
        ai_available & summarize_notes_enabled & is_project_member & can?(:read_issue) & ~confidential
      end.enable :summarize_notes
    end
  end
end
