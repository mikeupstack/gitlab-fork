# frozen_string_literal: true

require 'spec_helper'

RSpec.describe 'CiJobTokenScopeRemoveProject', feature_category: :continuous_integration do
  include GraphqlHelpers

  let_it_be(:project) do
    create(:project,
      ci_outbound_job_token_scope_enabled: true,
      ci_inbound_job_token_scope_enabled: true
    )
  end

  let_it_be(:target_project) { create(:project) }

  let_it_be(:link) do
    create(:ci_job_token_project_scope_link,
      source_project: project,
      target_project: target_project)
  end

  let(:variables) do
    {
      direction: 'OUTBOUND',
      project_path: project.full_path,
      target_project_path: target_project.full_path
    }
  end

  let(:mutation) do
    graphql_mutation(:ci_job_token_scope_remove_project, variables) do
      <<~QL
        errors
        ciJobTokenScope {
          projects {
            nodes {
              path
            }
          }
        }
      QL
    end
  end

  let(:mutation_response) { graphql_mutation_response(:ci_job_token_scope_remove_project) }

  context 'when unauthorized' do
    let(:current_user) { create(:user) }

    context 'when not a maintainer' do
      before do
        project.add_developer(current_user)
      end

      it 'has graphql errors' do
        post_graphql_mutation(mutation, current_user: current_user)

        expect(graphql_errors).not_to be_empty
      end
    end
  end

  context 'when authorized' do
    let_it_be(:current_user) { project.first_owner }

    before do
      target_project.add_guest(current_user)
    end

    it 'removes the target project from the job token outbound scope' do
      expect do
        post_graphql_mutation(mutation, current_user: current_user)
        expect(response).to have_gitlab_http_status(:success)
        expect(mutation_response.dig('ciJobTokenScope', 'projects', 'nodes')).not_to be_empty
      end.to change { Ci::JobToken::ProjectScopeLink.outbound.count }.by(-1)
    end

    it 'responds successfully' do
      post_graphql_mutation(mutation, current_user: current_user)

      expect(response).to have_gitlab_http_status(:ok)
      expect(graphql_errors).to be_nil
      expect(graphql_data_at(:ciJobTokenScopeRemoveProject, :ciJobTokenScope, :projects, :nodes))
        .to contain_exactly({ 'path' => project.path })
    end

    context 'when invalid target project is provided' do
      before do
        variables[:target_project_path] = 'unknown/project'
      end

      it 'has mutation errors' do
        post_graphql_mutation(mutation, current_user: current_user)

        expect(mutation_response['errors']).to contain_exactly(Ci::JobTokenScope::EditScopeValidations::TARGET_PROJECT_UNAUTHORIZED_OR_UNFOUND)
      end
    end
  end
end
