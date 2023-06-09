# frozen_string_literal: true

require 'spec_helper'

RSpec.describe 'Admin Jobs', feature_category: :continuous_integration do
  before do
    stub_feature_flags(admin_jobs_vue: false)
    admin = create(:admin)
    sign_in(admin)
    gitlab_enable_admin_mode_sign_in(admin)
  end

  describe 'GET /admin/jobs' do
    let(:pipeline) { create(:ci_pipeline) }

    context 'All tab' do
      context 'when have jobs' do
        it 'shows all jobs', :js do
          create(:ci_build, pipeline: pipeline, status: :pending)
          create(:ci_build, pipeline: pipeline, status: :running)
          create(:ci_build, pipeline: pipeline, status: :success)
          create(:ci_build, pipeline: pipeline, status: :failed)

          visit admin_jobs_path

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'All')
          expect(page).to have_selector('.row-content-block', text: 'All jobs')
          expect(page.all('.build-link').size).to eq(4)
          expect(page).to have_button 'Stop all jobs'

          click_button 'Stop all jobs'
          expect(page).to have_button 'Yes, proceed'
          expect(page).to have_content 'Are you sure?'
        end
      end

      context 'when have no jobs' do
        it 'shows a message' do
          visit admin_jobs_path

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'All')
          expect(page).to have_content 'No jobs to show'
          expect(page).not_to have_button 'Stop all jobs'
        end
      end
    end

    context 'Pending tab' do
      context 'when have pending jobs' do
        it 'shows pending jobs' do
          build1 = create(:ci_build, pipeline: pipeline, status: :pending)
          build2 = create(:ci_build, pipeline: pipeline, status: :running)
          build3 = create(:ci_build, pipeline: pipeline, status: :success)
          build4 = create(:ci_build, pipeline: pipeline, status: :failed)

          visit admin_jobs_path(scope: :pending)

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'Pending')
          expect(page.find('.build-link')).to have_content(build1.id)
          expect(page.find('.build-link')).not_to have_content(build2.id)
          expect(page.find('.build-link')).not_to have_content(build3.id)
          expect(page.find('.build-link')).not_to have_content(build4.id)
          expect(page).to have_button 'Stop all jobs'
        end
      end

      context 'when have no jobs pending' do
        it 'shows a message' do
          create(:ci_build, pipeline: pipeline, status: :success)

          visit admin_jobs_path(scope: :pending)

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'Pending')
          expect(page).to have_content 'No jobs to show'
          expect(page).not_to have_button 'Stop all jobs'
        end
      end
    end

    context 'Running tab' do
      context 'when have running jobs' do
        it 'shows running jobs' do
          build1 = create(:ci_build, pipeline: pipeline, status: :running)
          build2 = create(:ci_build, pipeline: pipeline, status: :success)
          build3 = create(:ci_build, pipeline: pipeline, status: :failed)
          build4 = create(:ci_build, pipeline: pipeline, status: :pending)

          visit admin_jobs_path(scope: :running)

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'Running')
          expect(page.find('.build-link')).to have_content(build1.id)
          expect(page.find('.build-link')).not_to have_content(build2.id)
          expect(page.find('.build-link')).not_to have_content(build3.id)
          expect(page.find('.build-link')).not_to have_content(build4.id)
          expect(page).to have_button 'Stop all jobs'
        end
      end

      context 'when have no jobs running' do
        it 'shows a message' do
          create(:ci_build, pipeline: pipeline, status: :success)

          visit admin_jobs_path(scope: :running)

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'Running')
          expect(page).to have_content 'No jobs to show'
          expect(page).not_to have_button 'Stop all jobs'
        end
      end
    end

    context 'Finished tab' do
      context 'when have finished jobs' do
        it 'shows finished jobs' do
          build1 = create(:ci_build, pipeline: pipeline, status: :pending)
          build2 = create(:ci_build, pipeline: pipeline, status: :running)
          build3 = create(:ci_build, pipeline: pipeline, status: :success)

          visit admin_jobs_path(scope: :finished)

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'Finished')
          expect(page.find('.build-link')).not_to have_content(build1.id)
          expect(page.find('.build-link')).not_to have_content(build2.id)
          expect(page.find('.build-link')).to have_content(build3.id)
          expect(page).to have_button 'Stop all jobs'
        end
      end

      context 'when have no jobs finished' do
        it 'shows a message' do
          create(:ci_build, pipeline: pipeline, status: :running)

          visit admin_jobs_path(scope: :finished)

          expect(page).to have_selector('[data-testid="jobs-tabs"] a.active', text: 'Finished')
          expect(page).to have_content 'No jobs to show'
          expect(page).to have_button 'Stop all jobs'
        end
      end
    end
  end
end
