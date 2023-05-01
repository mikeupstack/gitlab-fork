---
type: reference, dev
stage: none
group: Development
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Issues workflow

**Before you submit an issue, [search the issue tracker](https://gitlab.com/gitlab-org/gitlab/-/issues)**
for similar entries. Someone else might have already had the same bug or feature proposal.
If you find an existing issue, show your support with an award emoji and add your notes to the discussion.

To submit a bug:

- Use the ['Bug' issue template](https://gitlab.com/gitlab-org/gitlab/-/blob/master/.gitlab/issue_templates/Bug.md).
  The text in the comments (`<!-- ... -->`) should help you with which information to include.
- To report a suspected security vulnerability, follow the
  [disclosure process on the GitLab.com website](https://about.gitlab.com/security/disclosure/).

WARNING:
Do **not** create publicly viewable issues for suspected security vulnerabilities.

## Issue triaging

Our issue triage policies are [described in our handbook](https://about.gitlab.com/handbook/engineering/quality/issue-triage/).
You are very welcome to help the GitLab team triage issues.
We also organize [issue bash events](https://gitlab.com/gitlab-org/gitlab-foss/-/issues/17815)
once every quarter.

The most important thing is making sure valid issues receive feedback from the
development team. Therefore the priority is mentioning developers that can help
on those issues. Please select someone with relevant experience from the
[GitLab team](https://about.gitlab.com/company/team/).
If there is nobody mentioned with that expertise, look in the commit history for
the affected files to find someone.

We also have triage automation in place, described [in our handbook](https://about.gitlab.com/handbook/engineering/quality/triage-operations/).

For information about which labels to apply to issues, see [Labels](../labels/index.md).

## Feature proposals

To create a feature proposal, open an issue on the
[issue tracker](https://gitlab.com/gitlab-org/gitlab/-/issues).

In order to help track the feature proposals, we have created a
[`~"type::feature"`](https://gitlab.com/gitlab-org/gitlab/-/issues?label_name=type::feature) label.
For the time being, users that are not members of the project cannot add labels.
You can instead ask one of the [core team](https://about.gitlab.com/community/core-team/)
members to add the label `~"type::feature"` to the issue or add the following
code snippet right after your description in a new line: `~"type::feature"`.

Please keep feature proposals as small and simple as possible, complex ones
might be edited to make them small and simple.

Please submit feature proposals using the ['Feature Proposal' issue template](https://gitlab.com/gitlab-org/gitlab/-/blob/master/.gitlab/issue_templates/Feature%20proposal%20-%20detailed.md) provided on the issue tracker.

For changes to the user interface (UI), follow our [design and UI guidelines](design.md),
and include a visual example (screenshot, wireframe, or mockup). Such issues should
be given the `~UX"` label for the Product Design team to provide input and guidance.
You may need to ask one of the [core team](https://about.gitlab.com/community/core-team/)
members to add the label, if you do not have permissions to do it by yourself.

If you want to create something yourself, consider opening an issue first to
discuss whether it is interesting to include this in GitLab.

## Issue weight

Issue weight allows us to get an idea of the amount of work required to solve
one or multiple issues. This makes it possible to schedule work more accurately.

You are encouraged to set the weight of any issue. Following the guidelines
below will make it easy to manage this, without unnecessary overhead.

1. Set weight for any issue at the earliest possible convenience
1. If you don't agree with a set weight, discuss with other developers until
   consensus is reached about the weight
1. Issue weights are an abstract measurement of complexity of the issue. Do not
   relate issue weight directly to time. This is called [anchoring](https://en.wikipedia.org/wiki/Anchoring_(cognitive_bias))
   and something you want to avoid.
1. Something that has a weight of 1 (or no weight) is really small and simple.
   Something that is 9 is rewriting a large fundamental part of GitLab,
   which might lead to many hard problems to solve. Changing some text in GitLab
   is probably 1, adding a new Git Hook maybe 4 or 5, big features 7-9.
1. If something is very large, it should probably be split up in multiple
   issues or chunks. You can not set the weight of a parent issue and set
   weights to children issues.

## Regression issues

Every monthly release has a corresponding issue on the CE issue tracker to keep
track of functionality broken by that release and any fixes that need to be
included in a patch release (see
[8.3 Regressions](https://gitlab.com/gitlab-org/gitlab-foss/-/issues/4127) as an example).

As outlined in the issue description, the intended workflow is to post one note
with a reference to an issue describing the regression, and then to update that
note with a reference to the merge request that fixes it as it becomes available.

If you're a contributor who doesn't have the required permissions to update
other users' notes, please post a new note with a reference to both the issue
and the merge request.

The release manager will
[update the notes](https://gitlab.com/gitlab-org/release-tools/blob/master/doc/pro-tips.md#update-the-regression-issue)
in the regression issue as fixes are addressed.

## Technical debt in follow-up issues

It's common to discover technical debt during development of a new feature. In
the spirit of "minimum viable change", resolution is often deferred to a
follow-up issue. However, this cannot be used as an excuse to merge poor-quality
code that would otherwise not pass review, or to overlook trivial matters that
don't deserve to be scheduled independently, and would be best resolved in the
original merge request - or not tracked at all!

The overheads of scheduling, and rate of change in the GitLab codebase, mean
that the cost of a trivial technical debt issue can quickly exceed the value of
tracking it. This generally means we should resolve these in the original merge
request - or not create a follow-up issue at all.

For example, a typo in a comment that is being copied between files is worth
fixing in the same MR, but not worth creating a follow-up issue for. Renaming a
method that is used in many places to make its intent slightly clearer may be
worth fixing, but it should not happen in the same MR, and is generally not
worth the overhead of having an issue of its own. These issues would invariably
be labeled `~P4 ~S4` if we were to create them.

More severe technical debt can have implications for development velocity. If
it isn't addressed in a timely manner, the codebase becomes needlessly difficult
to change, new features become difficult to add, and regressions abound.

Discoveries of this kind of technical debt should be treated seriously, and
while resolution in a follow-up issue may be appropriate, maintainers should
generally obtain a scheduling commitment from the author of the original MR, or
the engineering or product manager for the relevant area. This may take the form
of appropriate Priority / Severity labels on the issue, or an explicit milestone
and assignee.

The maintainer must always agree before an outstanding discussion is resolved in
this manner, and will be the one to create the issue. The title and description
should be of the same quality as those created
[in the usual manner](../labels/index.md#technical-and-ux-debt) - in particular, the issue title
**must not** begin with `Follow-up`! The creating maintainer should also expect
to be involved in some capacity when work begins on the follow-up issue.
