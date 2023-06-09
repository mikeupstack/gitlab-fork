# frozen_string_literal: true

module Resolvers
  module Ci
    class RunnerResolver < BaseResolver
      include LooksAhead

      type Types::Ci::RunnerType, null: true
      extras [:lookahead]
      description 'Runner information.'

      argument :id,
               type: ::Types::GlobalIDType[::Ci::Runner],
               required: true,
               description: 'Runner ID.'

      def resolve_with_lookahead(id:)
        find_runner(id: id)
      end

      private

      def find_runner(id:)
        runner_id = GitlabSchema.parse_gid(id, expected_type: ::Ci::Runner).model_id.to_i
        key = {
          preload_tag_list: lookahead.selects?(:tag_list),
          preload_creator: lookahead.selects?(:created_by)
        }

        BatchLoader::GraphQL.for(runner_id).batch(key: key) do |ids, loader, batch|
          results = ::Ci::Runner.id_in(ids)
          results = results.with_tags if batch[:key][:preload_tag_list]
          results = results.with_creator if batch[:key][:preload_creator]

          results.each { |record| loader.call(record.id, record) }
        end
      end
    end
  end
end
