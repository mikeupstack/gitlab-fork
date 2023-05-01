---
stage: Verify
group: Pipeline Security
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Troubleshooting job artifacts

When working with [job artifacts](job_artifacts.md), you might encounter the following issues.

## Job does not retrieve certain artifacts

By default, jobs fetch all artifacts from previous stages, but jobs using `dependencies`
or `needs` do not fetch artifacts from all jobs by default.

If you use these keywords, artifacts are fetched from only a subset of jobs. Review
the keyword reference for information on how to fetch artifacts with these keywords:

- [`dependencies`](../yaml/index.md#dependencies)
- [`needs`](../yaml/index.md#needs)
- [`needs:artifacts`](../yaml/index.md#needsartifacts)

## Job artifacts use too much disk space

If job artifacts are using too much disk space, see the
[job artifacts administration documentation](../../administration/job_artifacts.md#job-artifacts-using-too-much-disk-space).

## Error message `No files to upload`

This message appears in job logs when a the runner can't find the file to upload. Either
the path to the file is incorrect, or the file was not created. You can check the job
log for other errors or warnings that specify the filename and why it wasn't
generated.

For more detailed job logs, you can [enable CI/CD debug logging](../variables/index.md#enable-debug-logging)
and try the job again. This logging might provide more information about why the file
wasn't created.

## Error message `Missing /usr/bin/gitlab-runner-helper. Uploading artifacts is disabled.`

> [Introduced](https://gitlab.com/gitlab-org/gitlab-runner/-/issues/3068) in GitLab 15.2, GitLab Runner uses `RUNNER_DEBUG` instead of `DEBUG`, fixing this issue.

In GitLab 15.1 and earlier, setting a CI/CD variable named `DEBUG` can cause artifact uploads to fail.

To work around this, you can:

- Update to GitLab and GitLab Runner 15.2
- Use a different variable name
- Set it as an environment variable in a `script` command:

  ```yaml
  failing_test_job:  # This job might fail due to issue gitlab-org/gitlab-runner#3068
    variables:
      DEBUG: true
    script: bin/mycommand
    artifacts:
      paths:
        - bin/results

  successful_test_job:  # This job does not define a CI/CD variable named `DEBUG` and is not affected by the issue
    script: DEBUG=true bin/mycommand
    artifacts:
      paths:
        - bin/results
  ```

## Error message `FATAL: invalid argument` when uploading a dotenv artifact on a Windows runner

The PowerShell `echo` command writes files with UCS-2 LE BOM (Byte Order Mark) encoding,
but only UTF-8 is supported. If you try to create a [`dotenv`](../yaml/artifacts_reports.md)
artifact with `echo`, it causes a `FATAL: invalid argument` error.

Use PowerShell `Add-Content` instead, which uses UTF-8:

```yaml
test-job:
  stage: test
  tags:
    - windows
  script:
    - echo "test job"
    - Add-Content -Path build.env -Value "MY_ENV_VAR=true"
  artifacts:
    reports:
      dotenv: build.env
```

## Job artifacts do not expire

If some job artifacts are not expiring as expected, check if the
[**Keep artifacts from most recent successful jobs**](job_artifacts.md#keep-artifacts-from-most-recent-successful-jobs)
setting is enabled.

When this setting is enabled, job artifacts from the latest successful pipeline
of each ref do not expire and are not deleted.

## Error message `This job could not start because it could not retrieve the needed artifacts.`

A job configured with the [`needs:artifacts`](../yaml/index.md#needsartifacts) keyword
fails to start and returns this error message if:

- The job's dependencies cannot be found.
- The job cannot access the relevant resources due to insufficient permissions.

The troubleshooting steps to follow differ based on the syntax the job uses:

- [`needs:project`](#for-a-job-configured-with-needsproject)
- [`needs:pipeline:job`](#for-a-job-configured-with-needspipelinejob)

### For a job configured with `needs:project`

The `could not retrieve the needed artifacts.` error can happen for a job using
[`needs:project`](../yaml/index.md#needsproject) with a configuration similar to:

```yaml
rspec:
  needs:
    - project: my-group/my-project
      job: dependency-job
      ref: master
      artifacts: true
```

To troubleshoot this error, verify that:

- Project `my-group/my-project` is in a group with a Premium subscription plan.
- The user running the job can access resources in `my-group/my-project`.
- The `project`, `job`, and `ref` combination exists and results in the desired dependency.
- Any variables in use evaluate to the correct values.

### For a job configured with `needs:pipeline:job`

The `could not retrieve the needed artifacts.` error can happen for a job using
[`needs:pipeline:job`](../yaml/index.md#needspipelinejob) with a configuration similar to:

```yaml
rspec:
  needs:
    - pipeline: $UPSTREAM_PIPELINE_ID
      job: dependency-job
      artifacts: true
```

To troubleshoot this error, verify that:

- The `$UPSTREAM_PIPELINE_ID` CI/CD variable is available in the current pipeline's
  parent-child pipeline hierarchy.
- The `pipeline` and `job` combination exists and resolves to an existing pipeline.
- `dependency-job` has run and finished successfully.
