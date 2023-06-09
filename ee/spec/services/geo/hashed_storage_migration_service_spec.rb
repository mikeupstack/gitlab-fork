# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Geo::HashedStorageMigrationService, feature_category: :geo_replication do
  let!(:project) { create(:project, :repository, :legacy_storage) }
  let(:old_path) { project.full_path }
  let(:new_path) { "#{old_path}+renamed" }

  subject(:service) { described_class.new(project.id, old_disk_path: old_path, new_disk_path: new_path, old_storage_version: nil) }

  describe '#execute' do
    context 'project backed by legacy storage' do
      before do
        project.update_attribute(:storage_version, Project::HASHED_STORAGE_FEATURES[:repository])
      end

      it 'moves the project repositories' do
        expect_any_instance_of(Geo::MoveRepositoryService).to receive(:execute)
          .once.and_return(true)

        service.execute
      end

      it 'raises an error when project repository can not be moved' do
        allow_any_instance_of(Gitlab::Shell).to receive(:mv_repository)
          .with(project.repository_storage, old_path, new_path)
          .and_return(false)

        expect { service.execute }.to raise_error(Geo::RepositoryCannotBeRenamed, "Repository #{old_path} could not be renamed to #{new_path}")
      end

      it 'raises an error when wiki repository can not be moved' do
        allow_any_instance_of(Gitlab::Shell).to receive(:mv_repository)
          .with(project.repository_storage, old_path, new_path)
          .and_return(true)

        allow_any_instance_of(Gitlab::Shell).to receive(:mv_repository)
          .with(project.repository_storage, "#{old_path}.wiki", "#{new_path}.wiki")
          .and_return(false)

        expect { service.execute }.to raise_error(Geo::RepositoryCannotBeRenamed, "Repository #{old_path} could not be renamed to #{new_path}")
      end
    end

    it 'does not move project backed by hashed storage' do
      project = create(:project, :repository)

      service = described_class.new(
        project.id,
        old_disk_path: project.full_path,
        new_disk_path: "#{project.full_path}+renamed",
        old_storage_version: project.storage_version
      )

      expect_any_instance_of(Geo::MoveRepositoryService).not_to receive(:execute).once

      service.execute
    end
  end

  describe '#async_execute' do
    it 'starts the worker' do
      expect(Geo::HashedStorageMigrationWorker).to receive(:perform_async)

      service.async_execute
    end

    it 'returns job id' do
      allow(Geo::HashedStorageMigrationWorker).to receive(:perform_async).and_return('foo')

      expect(service.async_execute).to eq('foo')
    end
  end
end
