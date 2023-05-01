# frozen_string_literal: true

RSpec.shared_examples 'work item supports assignee widget updates via quick actions' do
  let_it_be(:developer) { create(:user).tap { |user| project.add_developer(user) } }

  context 'when assigning a user' do
    let(:body) { "/assign @#{developer.username}" }

    it 'updates the work item assignee' do
      expect do
        post_graphql_mutation(mutation, current_user: current_user)
        noteable.reload
      end.to change { noteable.assignee_ids }.from([]).to([developer.id])

      expect(response).to have_gitlab_http_status(:success)
    end
  end

  context 'when unassigning a user' do
    let(:body) { "/unassign @#{developer.username}" }

    before do
      noteable.update!(assignee_ids: [developer.id])
    end

    it 'updates the work item assignee' do
      expect do
        post_graphql_mutation(mutation, current_user: current_user)
        noteable.reload
      end.to change { noteable.assignee_ids }.from([developer.id]).to([])

      expect(response).to have_gitlab_http_status(:success)
    end
  end
end

RSpec.shared_examples 'work item does not support assignee widget updates via quick actions' do
  let(:developer) { create(:user).tap { |user| project.add_developer(user) } }
  let(:body) { "Updating assignee.\n/assign @#{developer.username}" }

  before do
    WorkItems::Type.default_by_type(:task).widget_definitions
      .find_by_widget_type(:assignees).update!(disabled: true)
  end

  it 'ignores the quick action' do
    expect do
      post_graphql_mutation(mutation, current_user: current_user)
      noteable.reload
    end.not_to change { noteable.assignee_ids }
  end
end

RSpec.shared_examples 'work item supports labels widget updates via quick actions' do
  shared_examples 'work item labels are updated' do
    it do
      expect do
        post_graphql_mutation(mutation, current_user: current_user)
        noteable.reload
      end.to change { noteable.labels.count }.to(expected_labels.count)

      expect(noteable.labels).to match_array(expected_labels)
    end
  end

  let_it_be(:existing_label) { create(:label, project: project) }
  let_it_be(:label1) { create(:label, project: project) }
  let_it_be(:label2) { create(:label, project: project) }

  let(:add_label_ids) { [] }
  let(:remove_label_ids) { [] }

  before_all do
    noteable.update!(labels: [existing_label])
  end

  context 'when only removing labels' do
    let(:remove_label_ids) { [existing_label.to_gid.to_s] }
    let(:expected_labels) { [] }
    let(:body) { "/remove_label ~\"#{existing_label.name}\"" }

    it_behaves_like 'work item labels are updated'
  end

  context 'when only adding labels' do
    let(:add_label_ids) { [label1.to_gid.to_s, label2.to_gid.to_s] }
    let(:expected_labels) { [label1, label2, existing_label] }
    let(:body) { "/labels ~\"#{label1.name}\" ~\"#{label2.name}\"" }

    it_behaves_like 'work item labels are updated'
  end

  context 'when adding and removing labels' do
    let(:remove_label_ids) { [existing_label.to_gid.to_s] }
    let(:add_label_ids) { [label1.to_gid.to_s, label2.to_gid.to_s] }
    let(:expected_labels) { [label1, label2] }
    let(:body) { "/label ~\"#{label1.name}\" ~\"#{label2.name}\"\n/remove_label ~\"#{existing_label.name}\"" }

    it_behaves_like 'work item labels are updated'
  end
end

RSpec.shared_examples 'work item does not support labels widget updates via quick actions' do
  let(:label1) { create(:label, project: project) }
  let(:body) { "Updating labels.\n/labels ~\"#{label1.name}\"" }

  before do
    WorkItems::Type.default_by_type(:task).widget_definitions
      .find_by_widget_type(:labels).update!(disabled: true)
  end

  it 'ignores the quick action' do
    expect do
      post_graphql_mutation(mutation, current_user: current_user)
      noteable.reload
    end.not_to change { noteable.labels.count }

    expect(noteable.labels).to be_empty
  end
end

RSpec.shared_examples 'work item supports start and due date widget updates via quick actions' do
  let(:due_date) { Date.today }
  let(:body) { "/remove_due_date" }

  before do
    noteable.update!(due_date: due_date)
  end

  it 'updates start and due date' do
    expect do
      post_graphql_mutation(mutation, current_user: current_user)
      noteable.reload
    end.to not_change(noteable, :start_date).and(
      change { noteable.due_date }.from(due_date).to(nil)
    )
  end
end

RSpec.shared_examples 'work item does not support start and due date widget updates via quick actions' do
  let(:body) { "Updating due date.\n/due today" }

  before do
    WorkItems::Type.default_by_type(:task).widget_definitions
      .find_by_widget_type(:start_and_due_date).update!(disabled: true)
  end

  it 'ignores the quick action' do
    expect do
      post_graphql_mutation(mutation, current_user: current_user)
      noteable.reload
    end.not_to change { noteable.due_date }
  end
end
