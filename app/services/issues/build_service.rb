# frozen_string_literal: true

module Issues
  class BuildService < Issues::BaseService
    include ResolveDiscussions

    def execute(initialize_callbacks: true)
      filter_resolve_discussion_params

      container_param = case container
                        when Project
                          { project: project }
                        when Namespaces::ProjectNamespace
                          { project: container.project }
                        else
                          { namespace: container }
                        end

      @issue = model_klass.new(issue_params.merge(container_param)).tap do |issue|
        set_work_item_type(issue)
        initialize_callbacks!(issue) if initialize_callbacks
      end
    end

    def issue_params_with_info_from_discussions
      return {} unless merge_request_to_resolve_discussions_of

      { title: title_from_merge_request, description: description_for_discussions }
    end

    def title_from_merge_request
      "Follow-up from \"#{merge_request_to_resolve_discussions_of.title}\""
    end

    def description_for_discussions
      if discussions_to_resolve.empty?
        return "There are no unresolved discussions. "\
               "Review the conversation in #{merge_request_to_resolve_discussions_of.to_reference}"
      end

      description = "The following #{'discussion'.pluralize(discussions_to_resolve.size)} "\
                    "from #{merge_request_to_resolve_discussions_of.to_reference} "\
                    "should be addressed:"

      [description, *items_for_discussions].join("\n\n")
    end

    def items_for_discussions
      discussions_to_resolve.map { |discussion| item_for_discussion(discussion) }
    end

    def item_for_discussion(discussion)
      first_note_to_resolve = discussion.first_note_to_resolve || discussion.first_note

      is_very_first_note = first_note_to_resolve == discussion.first_note
      action = is_very_first_note ? "started" : "commented on"

      note_url = Gitlab::UrlBuilder.build(first_note_to_resolve)

      other_note_count = discussion.notes.size - 1

      discussion_info = ["- [ ] #{first_note_to_resolve.author.to_reference} #{action} a [discussion](#{note_url}): "]
      discussion_info << "(+#{other_note_count} #{'comment'.pluralize(other_note_count)})" if other_note_count > 0

      note_without_block_quotes = Banzai::Filter::BlockquoteFenceFilter.new(first_note_to_resolve.note).call
      spaces = ' ' * 4
      quote = note_without_block_quotes.lines.map { |line| "#{spaces}> #{line}" }.join

      [discussion_info.join(' '), quote].join("\n\n")
    end

    def issue_params
      @issue_params ||= build_issue_params
    end

    private

    def set_work_item_type(issue)
      work_item_type = if params[:work_item_type_id].present?
                         params.delete(:work_item_type)
                         WorkItems::Type.find_by(id: params.delete(:work_item_type_id)) # rubocop: disable CodeReuse/ActiveRecord
                       else
                         params.delete(:work_item_type)
                       end

      base_type = work_item_type&.base_type
      if create_issue_type_allowed?(container, base_type)
        issue.work_item_type = work_item_type
        # Up to this point issue_type might be set to the default, so we need to sync if a work item type is provided
        issue.issue_type = work_item_type.base_type
      end

      # If no work item type was provided, we need to set it to whatever issue_type was up to this point,
      # and that includes the column default
      issue.work_item_type = WorkItems::Type.default_by_type(issue.issue_type)
    end

    def model_klass
      ::Issue
    end

    def public_params
      # Additional params may be assigned later (in a CreateService for example)
      public_issue_params = [
        :title,
        :description,
        :confidential
      ]

      public_issue_params << :issue_type if create_issue_type_allowed?(container, params[:issue_type])

      params.slice(*public_issue_params)
    end

    def build_issue_params
      { author: current_user }
        .merge(issue_params_with_info_from_discussions)
        .merge(public_params)
        .with_indifferent_access
    end
  end
end

Issues::BuildService.prepend_mod_with('Issues::BuildService')
