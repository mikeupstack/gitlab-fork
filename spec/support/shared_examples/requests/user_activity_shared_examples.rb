# frozen_string_literal: true

RSpec.shared_examples 'updating of user activity' do |paths_to_visit|
  let(:user) { create(:user, last_activity_on: nil) }

  before do
    group = create(:group, name: 'group')
    project = create(:project, :public, namespace: group, path: 'project')

    create(:issue, project: project, iid: 10)
    create(:merge_request, source_project: project, iid: 15)

    project.add_maintainer(user)
  end

  context 'without an authenticated user' do
    it 'does not set the last activity cookie' do
      get "/group/project"

      expect(response.cookies['user_last_activity_on']).to be_nil
    end
  end

  context 'with an authenticated user' do
    before do
      login_as(user)
    end

    context 'with a POST request' do
      it 'does not set the last activity cookie' do
        post "/group/project/archive"

        expect(response.cookies['user_last_activity_on']).to be_nil
      end
    end

    paths_to_visit.each do |path|
      context "on GET to #{path}" do
        it 'updates the last activity date' do
          expect(Users::ActivityService).to receive(:new).and_call_original

          get path

          expect(user.last_activity_on).to eq(Date.today)
        end

        context 'when calling it twice' do
          it 'updates last_activity_on just once' do
            expect(Users::ActivityService).to receive(:new).once.and_call_original

            2.times do
              get path
            end
          end
        end

        context 'when last_activity_on is nil' do
          before do
            user.update_attribute(:last_activity_on, nil)
          end

          it 'updates the last activity date' do
            expect(user.last_activity_on).to be_nil

            get path

            expect(user.last_activity_on).to eq(Date.today)
          end
        end

        context 'when last_activity_on is stale' do
          before do
            user.update_attribute(:last_activity_on, 2.days.ago.to_date)
          end

          it 'updates the last activity date' do
            get path

            expect(user.last_activity_on).to eq(Date.today)
          end
        end

        context 'when last_activity_on is up to date' do
          before do
            user.update_attribute(:last_activity_on, Date.today)
          end

          it 'does not try to update it' do
            expect(Users::ActivityService).not_to receive(:new)

            get path
          end
        end
      end
    end
  end
end
