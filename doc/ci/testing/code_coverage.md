---
stage: Verify
group: Pipeline Execution
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Code coverage **(FREE)**

Use code coverage to provide insights on what source code is being validated by a test suite. Code coverage is one of many test metrics that can determine software performance and quality.

## View Code Coverage results

Code Coverage results are shown in:

- Merge request widget
- Project repository analytics
- Group repository analytics
- Repository badge

For more information on test coverage visualization in the file diff of the MR, see [Test Coverage Visualization](test_coverage_visualization.md).

### View code coverage results in the MR

If you use test coverage in your code, you can use a regular expression to
find coverage results in the job log. You can then include these results
in the merge request in GitLab.

If the pipeline succeeds, the coverage is shown in the merge request widget and
in the jobs table. If multiple jobs in the pipeline have coverage reports, they are
averaged.

![MR widget coverage](img/pipelines_test_coverage_mr_widget.png)

![Build status coverage](img/pipelines_test_coverage_build.png)

#### Add test coverage results using `coverage` keyword

To add test coverage results to a merge request using the project's `.gitlab-ci.yml` file, provide a regular expression
using the [`coverage`](../yaml/index.md#coverage) keyword.

#### Test coverage examples

Use this regex for commonly used test tools.

<!-- vale gitlab.Spelling = NO -->

- Simplecov (Ruby). Example: `/\(\d+.\d+\%\) covered/`.
- pytest-cov (Python). Example: `/(?i)total.*? (100(?:\.0+)?\%|[1-9]?\d(?:\.\d+)?\%)$/`.
- Scoverage (Scala). Example: `/Statement coverage[A-Za-z\.*]\s*:\s*([^%]+)/`.
- `pest --coverage --colors=never` (PHP). Example: `/^\s*Cov:\s*\d+\.\d+?%$/`.
- `phpunit --coverage-text --colors=never` (PHP). Example: `/^\s*Lines:\s*\d+.\d+\%/`.
- gcovr (C/C++). Example: `/^TOTAL.*\s+(\d+\%)$/`.
- `tap --coverage-report=text-summary` (NodeJS). Example: `/^Statements\s*:\s*([^%]+)/`.
- `nyc npm test` (NodeJS). Example: `/All files[^|]*\|[^|]*\s+([\d\.]+)/`.
- `jest --ci --coverage` (NodeJS). Example: `/All files[^|]*\|[^|]*\s+([\d\.]+)/`.
- excoveralls (Elixir). Example: `/\[TOTAL\]\s+(\d+\.\d+)%/`.
- `mix test --cover` (Elixir). Example: `/\d+.\d+\%\s+\|\s+Total/`.
- JaCoCo (Java/Kotlin). Example: `/Total.*?([0-9]{1,3})%/`.
- `go test -cover` (Go). Example: `/coverage: \d+.\d+% of statements/`.
- .NET (OpenCover). Example: `/(Visited Points).*\((.*)\)/`.
- .NET (`dotnet test` line coverage). Example: `/Total\s*\|\s*(\d+(?:\.\d+)?)/`.
- tarpaulin (Rust). Example: `/^\d+.\d+% coverage/`.
- Pester (PowerShell). Example: `/Covered (\d+\.\d+%)/`.

<!-- vale gitlab.Spelling = YES -->

### View history of project code coverage

> - [Introduced](https://gitlab.com/gitlab-org/gitlab/-/issues/209121) the ability to download a `.csv` in GitLab 12.10.
> - Graph [introduced](https://gitlab.com/gitlab-org/gitlab/-/issues/33743) in GitLab 13.1.

To see the evolution of your project code coverage over time,
you can view a graph or download a CSV file with this data.

1. On the top bar, select **Main menu > Projects** and find your project.
1. On the left sidebar, select **Analytics > Repository**.

The historic data for each job is listed in the dropdown list above the graph.

To view a CSV file of the data, select **Download raw data (`.csv`)**.

![Code coverage graph of a project over time](img/code_coverage_graph_v13_1.png)

### View history of group code coverage **(PREMIUM)**

To see the all the project's code coverage under a group over time, you can find view [group repository analytics](../../user/group/repositories_analytics/index.md).

![Code coverage graph of a group over time](img/code_coverage_group_report.png)

### Pipeline badges

You can use [pipeline badges](../../user/project/badges.md#test-coverage-report-badges) to indicate the pipeline status and
test coverage of your projects. These badges are determined by the latest successful pipeline.

## Coverage check approval rule **(PREMIUM)**

> - [Introduced](https://gitlab.com/gitlab-org/gitlab/-/issues/15765) in GitLab 14.0.
> - [Made configurable in Project Settings](https://gitlab.com/gitlab-org/gitlab/-/issues/331001) in GitLab 14.1.

When merging a request that would cause the project's test coverage to decline, you can stipulate that such merge requests require approval by selected users or a group.

Follow these steps to enable the `Coverage-Check` MR approval rule:

1. Set up a [`coverage`](../yaml/index.md#coverage) regular expression for all jobs you want to include in the overall coverage value.
1. Go to your project and select **Settings > Merge requests**.
1. Under **Merge request approvals**, select **Enable** next to the `Coverage-Check` approval rule.
1. Select the **Target branch**.
1. Set the number of **Approvals required** to greater than zero.
1. Select the users or groups to provide approval.
1. Select **Add approval rule**.

![Coverage-Check approval rule](img/coverage_check_approval_rule_14_1.png)

## Troubleshooting

### Remove color codes from code coverage

Some test coverage tools output with ANSI color codes that aren't
parsed correctly by the regular expression. This causes coverage
parsing to fail.

Some coverage tools do not provide an option to disable color
codes in the output. If so, pipe the output of the coverage tool through a one-line script that strips the color codes.

For example:

```shell
lein cloverage | perl -pe 's/\e\[?.*?[\@-~]//g'
```
