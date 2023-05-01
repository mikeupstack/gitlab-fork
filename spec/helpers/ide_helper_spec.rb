# frozen_string_literal: true

require 'spec_helper'

RSpec.describe IdeHelper, feature_category: :web_ide do
  describe '#ide_data' do
    let_it_be(:project) { create(:project) }
    let_it_be(:user) { project.creator }
    let_it_be(:fork_info) { { ide_path: '/test/ide/path' } }

    let_it_be(:params) do
      {
        branch: 'master',
        path: 'foo/bar',
        merge_request_id: '1'
      }
    end

    let(:base_data) do
      {
        'can-use-new-web-ide' => 'false',
        'use-new-web-ide' => 'false',
        'user-preferences-path' => profile_preferences_path,
        'sign-in-path' => 'test-sign-in-path',
        'project' => nil,
        'preview-markdown-path' => nil
      }
    end

    before do
      allow(helper).to receive(:current_user).and_return(user)
      allow(helper).to receive(:content_security_policy_nonce).and_return('test-csp-nonce')
      allow(helper).to receive(:new_session_path).and_return('test-sign-in-path')
    end

    it 'returns hash' do
      expect(helper.ide_data(project: nil, fork_info: fork_info, params: params))
        .to include(base_data)
    end

    context 'with project' do
      it 'returns hash with parameters' do
        serialized_project = API::Entities::Project.represent(project, current_user: user).to_json

        expect(
          helper.ide_data(project: project, fork_info: nil, params: params)
        ).to include(base_data.merge(
          'fork-info' => nil,
          'branch-name' => params[:branch],
          'file-path' => params[:path],
          'merge-request' => params[:merge_request_id],
          'project' => serialized_project,
          'preview-markdown-path' => Gitlab::Routing.url_helpers.preview_markdown_project_path(project)
        ))
      end

      context 'with fork info' do
        it 'returns hash with fork info' do
          expect(helper.ide_data(project: project, fork_info: fork_info, params: params))
            .to include('fork-info' => fork_info.to_json)
        end
      end
    end

    context 'with environments guidance experiment', :experiment do
      before do
        stub_experiments(in_product_guidance_environments_webide: :candidate)
      end

      context 'when project has no enviornments' do
        it 'enables environment guidance' do
          expect(helper.ide_data(project: project, fork_info: fork_info, params: params))
            .to include('enable-environments-guidance' => 'true')
        end

        context 'and the callout has been dismissed' do
          it 'disables environment guidance' do
            callout = create(:callout, feature_name: :web_ide_ci_environments_guidance, user: user)
            callout.update!(dismissed_at: Time.now - 1.week)
            allow(helper).to receive(:current_user).and_return(User.find(user.id))

            expect(helper.ide_data(project: project, fork_info: fork_info, params: params))
              .to include('enable-environments-guidance' => 'false')
          end
        end
      end

      context 'when the project has environments' do
        it 'disables environment guidance' do
          create(:environment, project: project)

          expect(helper.ide_data(project: project, fork_info: fork_info, params: params))
            .to include('enable-environments-guidance' => 'false')
        end
      end
    end

    context 'with vscode_web_ide=true' do
      let(:base_data) do
        {
          'can-use-new-web-ide' => 'true',
          'use-new-web-ide' => 'true',
          'user-preferences-path' => profile_preferences_path,
          'sign-in-path' => 'test-sign-in-path',
          'new-web-ide-help-page-path' =>
            help_page_path('user/project/web_ide/index.md', anchor: 'vscode-reimplementation'),
          'csp-nonce' => 'test-csp-nonce',
          'ide-remote-path' => ide_remote_path(remote_host: ':remote_host', remote_path: ':remote_path'),
          'editor-font-family' => 'JetBrains Mono',
          'editor-font-format' => 'woff2',
          'editor-font-src-url' => a_string_matching(%r{jetbrains-mono/JetBrainsMono})
        }
      end

      before do
        stub_feature_flags(vscode_web_ide: true)
      end

      it 'returns hash' do
        expect(helper.ide_data(project: nil, fork_info: fork_info, params: params))
          .to include(base_data)
      end

      it 'does not use new web ide if user.use_legacy_web_ide' do
        allow(user).to receive(:use_legacy_web_ide).and_return(true)

        expect(helper.ide_data(project: nil, fork_info: fork_info, params: params))
          .to include('use-new-web-ide' => 'false')
      end

      context 'with project' do
        it 'returns hash with parameters' do
          expect(
            helper.ide_data(project: project, fork_info: nil, params: params)
          ).to include(base_data.merge(
            'branch-name' => params[:branch],
            'file-path' => params[:path],
            'merge-request' => params[:merge_request_id],
            'fork-info' => nil
          ))
        end
      end
    end
  end
end
