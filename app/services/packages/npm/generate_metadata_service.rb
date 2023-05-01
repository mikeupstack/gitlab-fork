# frozen_string_literal: true

module Packages
  module Npm
    class GenerateMetadataService
      include API::Helpers::RelatedResourcesHelpers

      # Allowed fields are those defined in the abbreviated form
      # defined here: https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-version-object
      # except: name, version, dist, dependencies and xDependencies. Those are generated by this service.
      PACKAGE_JSON_ALLOWED_FIELDS = %w[deprecated bin directories dist engines _hasShrinkwrap].freeze

      def initialize(name, packages)
        @name = name
        @packages = packages
      end

      def execute(only_dist_tags: false)
        ServiceResponse.success(payload: metadata(only_dist_tags))
      end

      private

      attr_reader :name, :packages

      def metadata(only_dist_tags)
        result = { dist_tags: dist_tags }

        unless only_dist_tags
          result[:name] = name
          result[:versions] = versions
        end

        result
      end

      def versions
        package_versions = {}

        packages.each_batch do |relation|
          batched_packages = relation.including_dependency_links
                                     .preload_files
                                     .preload_npm_metadatum

          batched_packages.each do |package|
            package_file = package.installable_package_files.last

            next unless package_file

            package_versions[package.version] = build_package_version(package, package_file)
          end
        end

        package_versions
      end

      def dist_tags
        build_package_tags.tap { |t| t['latest'] ||= sorted_versions.last }
      end

      def build_package_tags
        package_tags.to_h { |tag| [tag.name, tag.package.version] }
      end

      def build_package_version(package, package_file)
        abbreviated_package_json(package).merge(
          name: package.name,
          version: package.version,
          dist: {
            shasum: package_file.file_sha1,
            tarball: tarball_url(package, package_file)
          }
        ).tap do |package_version|
          package_version.merge!(build_package_dependencies(package))
        end
      end

      def tarball_url(package, package_file)
        expose_url api_v4_projects_packages_npm_package_name___file_name_path(
          { id: package.project_id, package_name: package.name, file_name: package_file.file_name }, true
        )
      end

      def build_package_dependencies(package)
        dependencies = Hash.new { |h, key| h[key] = {} }

        package.dependency_links.each do |dependency_link|
          dependency = dependency_link.dependency
          dependencies[dependency_link.dependency_type][dependency.name] = dependency.version_pattern
        end

        dependencies
      end

      def sorted_versions
        versions = packages.pluck_versions.compact
        VersionSorter.sort(versions)
      end

      def package_tags
        Packages::Tag.for_package_ids(packages.last_of_each_version_ids)
                     .preload_package
      end

      def abbreviated_package_json(package)
        json = package.npm_metadatum&.package_json || {}
        json.slice(*PACKAGE_JSON_ALLOWED_FIELDS)
      end
    end
  end
end