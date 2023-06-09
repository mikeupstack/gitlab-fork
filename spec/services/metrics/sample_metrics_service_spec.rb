# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Metrics::SampleMetricsService, feature_category: :metrics do
  describe 'query' do
    let(:range_start) { '2019-12-02T23:31:45.000Z' }
    let(:range_end) { '2019-12-03T00:01:45.000Z' }

    subject { described_class.new(identifier, range_start: range_start, range_end: range_end).query }

    context 'when the file is not found' do
      let(:identifier) { nil }

      it { is_expected.to be_nil }
    end

    context 'when the file is found' do
      let(:identifier) { 'sample_metric_query_result' }
      let(:source) { File.join(Rails.root, 'spec/fixtures/gitlab/sample_metrics', "#{identifier}.yml") }
      let(:destination) { File.join(Rails.root, Metrics::SampleMetricsService::DIRECTORY, "#{identifier}.yml") }

      around do |example|
        FileUtils.mkdir_p(Metrics::SampleMetricsService::DIRECTORY)
        FileUtils.cp(source, destination)

        example.run
      ensure
        FileUtils.rm(destination)
      end

      subject { described_class.new(identifier, range_start: range_start, range_end: range_end).query }

      it 'loads data from the sample file correctly' do
        expect(subject).to eq(YAML.load_file(source)[30])
      end
    end

    context 'when the identifier is for a path outside of sample_metrics' do
      let(:identifier) { '../config/secrets' }

      it { is_expected.to be_nil }
    end
  end
end
