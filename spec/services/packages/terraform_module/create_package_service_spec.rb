# frozen_string_literal: true
require 'spec_helper'

RSpec.describe Packages::TerraformModule::CreatePackageService, feature_category: :package_registry do
  let_it_be(:namespace) { create(:namespace) }
  let_it_be(:project) { create(:project, namespace: namespace) }
  let_it_be(:user) { create(:user) }
  let_it_be(:sha256) { '440e5e148a25331bbd7991575f7d54933c0ebf6cc735a18ee5066ac1381bb590' }

  let(:overrides) { {} }

  let(:params) do
    {
      module_name: 'foo',
      module_system: 'bar',
      module_version: '1.0.1',
      file: UploadedFile.new(Tempfile.new('test').path, sha256: sha256),
      file_name: 'foo-bar-1.0.1.tgz'
    }.merge(overrides)
  end

  subject { described_class.new(project, user, params).execute }

  describe '#execute' do
    shared_examples 'creating a package' do
      it 'creates a package' do
        expect { subject }
          .to change { ::Packages::Package.count }.by(1)
          .and change { ::Packages::Package.terraform_module.count }.by(1)
      end
    end

    context 'valid package' do
      it_behaves_like 'creating a package'
    end

    context 'package already exists elsewhere' do
      let(:project2) { create(:project, namespace: namespace) }
      let!(:existing_package) { create(:terraform_module_package, project: project2, name: 'foo/bar', version: '1.0.0') }

      it { expect(subject[:http_status]).to eq 403 }
      it { expect(subject[:message]).to be 'Access Denied' }

      context 'marked as pending_destruction' do
        before do
          existing_package.pending_destruction!
        end

        it_behaves_like 'creating a package'
      end
    end

    context 'version already exists' do
      let!(:existing_version) { create(:terraform_module_package, project: project, name: 'foo/bar', version: '1.0.1') }

      it { expect(subject[:http_status]).to eq 403 }
      it { expect(subject[:message]).to be 'Package version already exists.' }

      context 'marked as pending_destruction' do
        before do
          existing_version.pending_destruction!
        end

        it_behaves_like 'creating a package'
      end
    end

    context 'with empty version' do
      let(:overrides) { { module_version: '' } }

      it { expect(subject[:http_status]).to eq 400 }
      it { expect(subject[:message]).to eq 'Version is empty.' }
    end
  end
end
