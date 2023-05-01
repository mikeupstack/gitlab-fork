---
stage: Package
group: Package Registry
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Terraform Module Registry **(FREE)**

> - [Introduced](https://gitlab.com/groups/gitlab-org/-/epics/3221) in GitLab 14.0.
> - Infrastructure registry and Terraform Module Registry [merged](https://gitlab.com/gitlab-org/gitlab/-/issues/404075) into a single Terraform Module Registry feature in GitLab 15.11.

With the Terraform Module Registry, you can use GitLab projects as a
private registry for terraform modules. You can create and publish
modules with GitLab CI/CD, which can then be consumed from other private
projects.

## View Terraform modules

To view Terraform modules in your project:

1. Go to the project.
1. On the left sidebar, select **Packages and registries > Terraform modules**.

You can search, sort, and filter modules on this page.

For information on how to create and upload a package, view the GitLab
documentation for your package type:

- [Terraform modules](../terraform_module_registry/index.md)

## Authenticate to the Terraform Module Registry

To authenticate to the Terraform Module Registry, you need either:

- A [personal access token](../../../api/rest/index.md#personalprojectgroup-access-tokens) with at least `read_api` rights.
- A [CI/CD job token](../../../ci/jobs/ci_job_token.md).

Do not use authentication methods other than the methods documented here. Undocumented authentication methods might be removed in the future.

## Publish a Terraform module

When you publish a Terraform module, if it does not exist, it is created.

### Using the API

You can publish Terraform modules by using the [Terraform Module Registry API](../../../api/packages/terraform-modules.md).

Prerequisites:

- The package name and version [must be unique in the top-level namespace](#how-module-resolution-works).
- Your project and group names must not include a dot (`.`). For example, `source = "gitlab.example.com/my.group/project.name"`.
- You must [authenticate with the API](../../../api/rest/index.md#authentication). If authenticating with a deploy token, it must be configured with the `write_package_registry` scope.
- The name of a module [must be unique in the scope of its group](#how-module-resolution-works), otherwise an
  [error occurs](#troubleshooting).

```plaintext
PUT /projects/:id/packages/terraform/modules/:module-name/:module-system/:module-version/file
```

| Attribute          | Type            | Required | Description                                                                                                                      |
| -------------------| --------------- | ---------| -------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | integer/string  | yes      | The ID or [URL-encoded path of the project](../../../api/rest/index.md#namespaced-path-encoding).                                    |
| `module-name`      | string          | yes      | The module name. **Supported syntax**: One to 64 ASCII characters, including lowercase letters (a-z) and digits (0-9). The module name can't exceed 64 characters.
| `module-system`    | string          | yes      | The module system. **Supported syntax**: One to 64 ASCII characters, including lowercase letters (a-z) and digits (0-9). The module system can't exceed 64 characters. More information can be found in the [Terraform Module Registry protocol documentation](https://www.terraform.io/internals/module-registry-protocol).
| `module-version`   | string          | yes      | The module version. It must be valid according to the [semantic versioning specification](https://semver.org/).

Provide the file content in the request body.

As the following example shows, requests must end with `/file`.
If you send a request ending with something else, it results in a 404
error `{"error":"404 Not Found"}`.

Example request using a personal access token:

```shell
curl --fail-with-body --header "PRIVATE-TOKEN: <your_access_token>" \
     --upload-file path/to/file.tgz \
     "https://gitlab.example.com/api/v4/projects/<your_project_id>/packages/terraform/modules/my-module/my-system/0.0.1/file"
```

Example request using a deploy token:

```shell
curl --fail-with-body --header "DEPLOY-TOKEN: <deploy_token>" \
     --upload-file path/to/file.tgz \
     "https://gitlab.example.com/api/v4/projects/<your_project_id>/packages/terraform/modules/my-module/my-system/0.0.1/file"
```

Example response:

```json
{
  "message":"201 Created"
}
```

### Using a CI/CD template (recommended)

> [Introduced](https://gitlab.com/gitlab-org/gitlab/-/merge_requests/110493) in GitLab 15.9.

You can use the [`Terraform-Module.gitlab-ci.yml`](https://gitlab.com/gitlab-org/gitlab/-/blob/master/lib/gitlab/ci/templates/Terraform-Module.gitlab-ci.yml)
or the advanced [`Terraform/Module-Base.gitlab-ci.yml`](https://gitlab.com/gitlab-org/gitlab/-/blob/master/lib/gitlab/ci/templates/Terraform/Module-Base.gitlab-ci.yml)
CI/CD template to publish a Terraform module to the GitLab terraform registry:

```yaml
include:
  template: Terraform-Module.gitlab-ci.yml
```

The pipeline contains the following jobs:

- `fmt` - Validate the formatting of the Terraform module.
- `kics-iac-sast` - Test the Terraform module for security issues.
- `deploy` - For tag pipelines only. Deploy the Terraform module to the Terraform Module Registry.

#### Pipeline variables

You can configure the pipeline with the following variables:

| Variable                   | Default              | Description                                                                                     |
|----------------------------|----------------------|-------------------------------------------------------------------------------------------------|
| `TERRAFORM_MODULE_DIR`     | `${CI_PROJECT_DIR}`  | The relative path to the root directory of the Terraform project.                               |
| `TERRAFORM_MODULE_NAME`    | `${CI_PROJECT_NAME}` | The name of your Terraform module. Must not contain any spaces or underscores.                  |
| `TERRAFORM_MODULE_SYSTEM`  | `local`              | The system or provider of your Terraform module targets. For example, `local`, `aws`, `google`. |
| `TERRAFORM_MODULE_VERSION` | `${CI_COMMIT_TAG}`   | The Terraform module version. You should follow the semantic versioning specification.          |

### Using CI/CD manually

To work with Terraform modules in [GitLab CI/CD](../../../ci/index.md), you can use
`CI_JOB_TOKEN` in place of the personal access token in your commands.

For example, this job uploads a new module for the `local` [system provider](https://registry.terraform.io/browse/providers) and uses the module version from the Git commit tag:

```yaml
stages:
  - deploy

upload:
  stage: deploy
  image: curlimages/curl:latest
  variables:
    TERRAFORM_MODULE_DIR: ${CI_PROJECT_DIR}    # The relative path to the root directory of the Terraform project.
    TERRAFORM_MODULE_NAME: ${CI_PROJECT_NAME}  # The name of your Terraform module, must not have any spaces or underscores (will be translated to hyphens).
    TERRAFORM_MODULE_SYSTEM: local             # The system or provider your Terraform module targets (ex. local, aws, google).
    TERRAFORM_MODULE_VERSION: ${CI_COMMIT_TAG} # The version - it's recommended to follow SemVer for Terraform Module Versioning.
  script:
    - TERRAFORM_MODULE_NAME=$(echo "${TERRAFORM_MODULE_NAME}" | tr " _" -) # module-name must not have spaces or underscores, so translate them to hyphens
    - tar -vczf /tmp/${TERRAFORM_MODULE_NAME}-${TERRAFORM_MODULE_SYSTEM}-${TERRAFORM_MODULE_VERSION}.tgz -C ${TERRAFORM_MODULE_DIR} --exclude=./.git .
    - 'curl --fail-with-body --location --header "JOB-TOKEN: ${CI_JOB_TOKEN}"
         --upload-file /tmp/${TERRAFORM_MODULE_NAME}-${TERRAFORM_MODULE_SYSTEM}-${TERRAFORM_MODULE_VERSION}.tgz
         ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/terraform/modules/${TERRAFORM_MODULE_NAME}/${TERRAFORM_MODULE_SYSTEM}/${TERRAFORM_MODULE_VERSION}/file'
  rules:
    - if: $CI_COMMIT_TAG
```

To trigger this upload job, add a Git tag to your commit. Ensure the tag follows the [Semantic versioning specification](https://semver.org/) that Terraform requires. The `rules:if: $CI_COMMIT_TAG` ensures that only tagged commits to your repository trigger the module upload job.
For other ways to control jobs in your CI/CD pipeline, refer to the [`.gitlab-ci.yml`](../../../ci/yaml/index.md) keyword reference.

## Reference a Terraform module

Prerequisites:

- You need to [authenticate with the API](../../../api/rest/index.md#authentication). If authenticating with a personal access token, it must be configured with the `read_api` scope.

Authentication tokens (Job Token or Personal Access Token) can be provided for `terraform` in your `~/.terraformrc` file:

```terraform
credentials "gitlab.com" {
  token = "<TOKEN>"
}
```

Where `gitlab.com` can be replaced with the hostname of your self-managed GitLab instance.

You can then refer to your Terraform module from a downstream Terraform project:

```terraform
module "<module>" {
  source = "gitlab.com/<namespace>/<module-name>/<module-system>"
}
```

Where `<namespace>` is the [namespace](../../../user/namespace/index.md) of the Terraform Module Registry.

## Download a Terraform module

To download a Terraform module:

1. On the left sidebar, select **Packages and registries > Terraform modules**.
1. Select the name of the module you want to download.
1. In the **Activity** section, select the name of the module you want to download.

## How module resolution works

When you upload a new module, GitLab generates a path for the module, for example, `https://gitlab.example.com/parent-group/my-infra-package`.

- This path conforms with [the Terraform spec](https://www.terraform.io/internals/module-registry-protocol).
- The name of the path must be unique in the namespace.

For projects in subgroups, GitLab checks that the module name does not already exist anywhere in the namespace, including all subgroups and the parent group.

For example, if:

- The project is `gitlab.example.com/parent-group/sub-group/my-project`.
- The Terraform module is `my-infra-package`.

The project name must be unique in all projects in all groups under `parent-group`.

## Delete a Terraform module

You cannot edit a Terraform module after you publish it in the Terraform Module Registry. Instead, you
must delete and recreate it.

To delete a module, you must have suitable [permissions](../../permissions.md).

You can delete modules by using [the packages API](../../../api/packages.md#delete-a-project-package) or the UI.

To delete a module in the UI, from your project:

1. On the left sidebar, select **Packages and registries > Terraform modules**.
1. Find the name of the package you want to delete.
1. Select **Delete**.

The package is permanently deleted.

## Disable the Terraform Module Registry

The Terraform Module Registry is automatically enabled.

For self-managed instances, a GitLab administrator can
[disable](../../../administration/packages/index.md) **Packages and registries**,
which removes this menu item from the sidebar.

You can also remove the Terraform Module Registry for a specific project:

1. In your project, go to **Settings > General**.
1. Expand the **Visibility, project features, permissions** section and toggle **Packages** off (in gray).
1. Select **Save changes**.

To enable it back, follow the same steps above and toggle it on (in blue).

## Example projects

For examples of the Terraform Module Registry, check the projects below:

- The [_GitLab local file_ project](https://gitlab.com/mattkasa/gitlab-local-file) creates a minimal Terraform module and uploads it into the Terraform Module Registry using GitLab CI/CD.
- The [_Terraform module test_ project](https://gitlab.com/mattkasa/terraform-module-test) uses the module from the previous example.

## Troubleshooting

- Publishing a module with a duplicate name results in a `{"message":"Access Denied"}` error. There's an ongoing discussion about allowing duplicate module names [in this issue](https://gitlab.com/gitlab-org/gitlab/-/issues/368040).
