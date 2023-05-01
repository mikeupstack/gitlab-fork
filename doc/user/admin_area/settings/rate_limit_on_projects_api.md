---
type: reference
stage: Data Stores
group: Tenant Scale
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Rate limit on Projects API **(FREE SELF)**

> [Introduced](https://gitlab.com/gitlab-org/gitlab/-/merge_requests/112283) in GitLab 15.10 behind a feature flag, disabled by default.

You can configure the rate limit per IP address for unauthenticated requests to the [list all projects API](../../../api/projects.md#list-all-projects).

To change the rate limit:

1. On the top bar, select **Main menu > Admin**.
1. On the left sidebar, select **Settings > Network**.
1. Expand **Projects API rate limit**.
1. In the **Maximum requests per 10 minutes per IP address** text box, enter the new value.
1. Select **Save changes**.

The rate limit:

- Applies per IP address.
- Doesn't apply to authenticated requests.
- Can be set to 0 to disable rate limiting.

The default value of the rate limit is `400`.

Requests over the rate limit are logged into the `auth.log` file.

For example, if you set a limit of 400, unauthenticated requests to the `GET /projects` API endpoint that
exceed a rate of 400 within 10 minutes are blocked. Access to the endpoint is restored after ten minutes have elapsed.
