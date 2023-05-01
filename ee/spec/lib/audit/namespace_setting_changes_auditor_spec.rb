# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Audit::NamespaceSettingChangesAuditor, feature_category: :audit_events do
  using RSpec::Parameterized::TableSyntax

  describe '#execute' do
    let_it_be(:user) { create(:user) }
    let_it_be(:group) { create(:group) }
    let_it_be(:destination) { create(:external_audit_event_destination, group: group) }

    subject(:auditor) { described_class.new(user, group.namespace_settings, group) }

    before do
      stub_licensed_features(extended_audit_events: true, external_audit_events: true)
    end

    context 'when namespace setting is updated' do
      context 'when code_suggestions is changed' do
        where(:prev_value, :new_value) do
          true | false
          false | true
        end

        with_them do
          before do
            group.namespace_settings.update!(code_suggestions: prev_value)
          end

          it 'creates an audit event' do
            group.namespace_settings.update!(code_suggestions: new_value)

            expect { auditor.execute }.to change { AuditEvent.count }.by(1)
            audit_details = {
              change: :code_suggestions,
              from: prev_value,
              to: new_value,
              target_details: group.full_path
            }
            expect(AuditEvent.last.details).to include(audit_details)
          end

          it 'streams correct audit event stream' do
            group.namespace_settings.update!(code_suggestions: new_value)

            expect(AuditEvents::AuditEventStreamingWorker).to receive(:perform_async).with(
              'code_suggestions_updated', anything, anything)

            auditor.execute
          end
        end
      end

      context 'when code_suggestions is not changed' do
        before do
          group.namespace_settings.update!(code_suggestions: true)
        end

        it 'does not create an audit event' do
          group.namespace_settings.update!(code_suggestions: true)

          expect { auditor.execute }.not_to change { AuditEvent.count }
        end
      end
    end
  end
end
