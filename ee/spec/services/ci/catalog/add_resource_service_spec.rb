# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Ci::Catalog::AddResourceService, feature_category: :pipeline_composition do
  let_it_be(:project) { create(:project, :repository, description: 'Our components') }
  let_it_be(:user) { create(:user) }

  let(:service) { described_class.new(project, user) }

  before do
    stub_licensed_features(ci_namespace_catalog: true)
  end

  describe '#execute' do
    context 'with an unauthorized user' do
      it 'raises an AccessDeniedError' do
        expect { service.execute }.to raise_error(Gitlab::Access::AccessDeniedError)
      end
    end

    context 'with an authorized user' do
      before do
        project.add_owner(user)
      end

      context 'and a valid project' do
        it 'creates a catalog resource' do
          response = service.execute

          expect(response.payload.project).to eq(project)
        end
      end

      context 'with an invalid project' do
        let_it_be(:project) { create(:project, :repository) }

        it 'does not create a catalog resource' do
          response = service.execute

          expect(response.message).to eq('Project must have a description')
        end
      end

      context 'with an invalid catalog resource' do
        it 'does not save the catalog resource' do
          catalog_resource = instance_double(::Ci::Catalog::Resource,
            valid?: false,
            errors: instance_double(ActiveModel::Errors, full_messages: ['not valid']))
          allow(::Ci::Catalog::Resource).to receive(:new).and_return(catalog_resource)

          response = service.execute

          expect(response.message).to eq('not valid')
        end
      end
    end
  end
end
