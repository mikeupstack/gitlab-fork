# frozen_string_literal: true

require 'spec_helper'

RSpec.describe "Admin::AbuseReports", :js, feature_category: :shared do
  let_it_be(:user) { create(:user) }
  let_it_be(:admin) { create(:admin) }

  context 'as an admin' do
    describe 'displayed reports' do
      include FilteredSearchHelpers

      let_it_be(:open_report) { create(:abuse_report, created_at: 5.days.ago, updated_at: 2.days.ago) }
      let_it_be(:open_report2) { create(:abuse_report, created_at: 4.days.ago, updated_at: 3.days.ago, category: 'phishing') }
      let_it_be(:closed_report) { create(:abuse_report, :closed) }

      let(:abuse_report_row_selector) { '[data-testid="abuse-report-row"]' }

      before do
        sign_in(admin)
        gitlab_enable_admin_mode_sign_in(admin)

        visit admin_abuse_reports_path
      end

      it 'only includes open reports by default' do
        expect_displayed_reports_count(2)

        expect_report_shown(open_report, open_report2)

        within '[data-testid="abuse-reports-filtered-search-bar"]' do
          expect(page).to have_content 'Status = Open'
        end
      end

      it 'can be filtered by status, user, reporter, and category', :aggregate_failures do
        # filter by status
        filter %w[Status Closed]
        expect_displayed_reports_count(1)
        expect_report_shown(closed_report)
        expect_report_not_shown(open_report, open_report2)

        filter %w[Status Open]
        expect_displayed_reports_count(2)
        expect_report_shown(open_report, open_report2)
        expect_report_not_shown(closed_report)

        # filter by user
        filter(['User', open_report2.user.username])

        expect_displayed_reports_count(1)
        expect_report_shown(open_report2)
        expect_report_not_shown(open_report, closed_report)

        # filter by reporter
        filter(['Reporter', open_report.reporter.username])

        expect_displayed_reports_count(1)
        expect_report_shown(open_report)
        expect_report_not_shown(open_report2, closed_report)

        # filter by category
        filter(['Category', open_report2.category])

        expect_displayed_reports_count(1)
        expect_report_shown(open_report2)
        expect_report_not_shown(open_report, closed_report)
      end

      it 'can be sorted by created_at and updated_at in desc and asc order', :aggregate_failures do
        # created_at desc (default)
        expect(report_rows[0].text).to include(report_text(open_report2))
        expect(report_rows[1].text).to include(report_text(open_report))

        # created_at asc
        toggle_sort_direction

        expect(report_rows[0].text).to include(report_text(open_report))
        expect(report_rows[1].text).to include(report_text(open_report2))

        # updated_at ascending
        sort_by 'Updated date'

        expect(report_rows[0].text).to include(report_text(open_report2))
        expect(report_rows[1].text).to include(report_text(open_report))

        # updated_at descending
        toggle_sort_direction

        expect(report_rows[0].text).to include(report_text(open_report))
        expect(report_rows[1].text).to include(report_text(open_report2))
      end

      it 'can be actioned on' do
        open_actions_dropdown(report_rows[0])

        expect(page).to have_content('Remove user & report')
        expect(page).to have_content('Block user')
        expect(page).to have_content('Remove report')

        # Remove a report
        click_button('Remove report')
        wait_for_requests

        expect_displayed_reports_count(1)
        expect_report_shown(open_report)

        # Block reported user
        open_actions_dropdown(report_rows[0])

        click_button('Block user')
        expect(page).to have_content('USER WILL BE BLOCKED! Are you sure?')

        click_button('OK')
        wait_for_requests

        expect(page).to have_content('Successfully blocked')
        expect(open_report.user.reload.blocked?).to eq true

        open_actions_dropdown(report_rows[0])

        expect(page).to have_content('Already blocked')
        expect(page).not_to have_content('Block user')

        # Remove user & report
        click_button('Remove user & report')
        expect(page).to have_content("USER #{open_report.user.name} WILL BE REMOVED! Are you sure?")

        click_button('OK')
        expect_displayed_reports_count(0)
      end

      def open_actions_dropdown(report_row)
        within(report_row) do
          find('[data-testid="base-dropdown-toggle"]').click
        end
      end

      def report_rows
        page.all(abuse_report_row_selector)
      end

      def report_text(report)
        "#{report.user.name} reported for #{report.category}"
      end

      def expect_report_shown(*reports)
        reports.each do |r|
          expect(page).to have_content(report_text(r))
        end
      end

      def expect_report_not_shown(*reports)
        reports.each do |r|
          expect(page).not_to have_content(report_text(r))
        end
      end

      def expect_displayed_reports_count(count)
        expect(page).to have_css(abuse_report_row_selector, count: count)
      end

      def filter(tokens)
        # remove all existing filters first
        page.find_all('.gl-token-close').each(&:click)

        select_tokens(*tokens, submit: true, input_text: 'Filter reports')
      end

      def sort_by(sort)
        page.within('.vue-filtered-search-bar-container .sort-dropdown-container') do
          page.find('.gl-dropdown-toggle').click

          page.within('.dropdown-menu') do
            click_button sort
            wait_for_requests
          end
        end
      end
    end

    context 'when abuse_reports_list feature flag is disabled' do
      before do
        stub_feature_flags(abuse_reports_list: false)

        sign_in(admin)
        gitlab_enable_admin_mode_sign_in(admin)
      end

      describe 'if a user has been reported for abuse' do
        let!(:abuse_report) { create(:abuse_report, user: user) }

        describe 'in the abuse report view' do
          it 'presents information about abuse report' do
            visit admin_abuse_reports_path

            expect(page).to have_content('Abuse Reports')
            expect(page).to have_content(abuse_report.message)
            expect(page).to have_link(user.name, href: user_path(user))
            expect(page).to have_link('Remove user')
          end
        end

        describe 'in the profile page of the user' do
          it 'shows a link to the admin view of the user' do
            visit user_path(user)

            expect(page).to have_link '', href: admin_user_path(user)
          end
        end
      end

      describe 'if a many users have been reported for abuse' do
        let(:report_count) { AbuseReport.default_per_page + 3 }

        before do
          report_count.times do
            create(:abuse_report, user: create(:user))
          end
        end

        describe 'in the abuse report view' do
          it 'presents information about abuse report' do
            visit admin_abuse_reports_path

            expect(page).to have_selector('.pagination')
            expect(page).to have_selector('.pagination .js-pagination-page', count: (report_count.to_f / AbuseReport.default_per_page).ceil)
          end
        end
      end

      describe 'filtering by user' do
        let!(:user2) { create(:user) }
        let!(:abuse_report) { create(:abuse_report, user: user) }
        let!(:abuse_report_2) { create(:abuse_report, user: user2) }

        it 'shows only single user report' do
          visit admin_abuse_reports_path

          page.within '.filter-form' do
            click_button 'User'
            wait_for_requests

            page.within '.dropdown-menu-user' do
              click_link user2.name
            end

            wait_for_requests
          end

          expect(page).to have_content(user2.name)
          expect(page).not_to have_content(user.name)
        end
      end
    end
  end
end
