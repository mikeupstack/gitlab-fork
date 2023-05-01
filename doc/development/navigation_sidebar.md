---
stage: Manage
group: Foundations
info: To determine the technical writer assigned to the Stage/Group associated with this page, see https://about.gitlab.com/handbook/product/ux/technical-writing/#assignments
---

# Navigation sidebar

Follow these guidelines when contributing additions or changes to the
[redesigned](https://gitlab.com/groups/gitlab-org/-/epics/9044) navigation
sidebar.

These guidelines reflect the current state of the navigation sidebar. However,
the sidebar is a work in progress, and so is this documentation.

## Enable the new navigation sidebar

To enable the new navigation sidebar:

- Enable the `super_sidebar_nav` feature flag.
- Select your avatar, then turn on the **New navigation** toggle.

## Adding items to the sidebar

Before adding an item to the sidebar, ensure you follow [this process](https://about.gitlab.com/handbook/product/ux/navigation/#how-to-propose-a-change-that-impacts-navigation).

## Adding page-specific Vue content

Pages can render arbitrary content into the sidebar using the `SidebarPortal`
component. Content passed to its default slot is rendered below that
page's navigation items in the sidebar.

NOTE:
Only one instance of this component on a given page is supported. This is to
avoid ordering issues and cluttering the sidebar.

NOTE:
Arbitrary content is allowed, but nav items should be implemented by
subclassing `::Sidebars::Panel`.

NOTE:
Do not use the `SidebarPortalTarget` component. It is internal to the sidebar.

## Snowplow Tracking

All clicks on the nav items should be automatically tracked in Snowplow, but may require additional input.
We use `data-tracking` attributes on all the elements in the nav to send the data up to Snowplow.
You can test that they're working by [setting up snowplow on your GDK](https://gitlab.com/gitlab-org/gitlab-development-kit/-/blob/main/doc/howto/snowplow_micro.md).

| Field | Data attribute | Notes | Example |
| -- | -- | -- | -- |
| Category | `data-tracking-category` | The page that the user was on when the item was clicked. | `groups:show` |
| Action | `data-tracking-action` | The action taken. In most cases this is `click_link` or `click_menu_item` | `click_link` |
| Label | `data-tracking-label` | A descriptor for what was clicked on. This is inferred by the ID of the item in most cases, but falls back to `item_without_id`. This is one to look out for. | `group_issue_list` |
| Property | `data-tracking-property` | This describes where in the nav the link was clicked. If it's in the main nav panel, then it needs to describe which panel. | `nav_panel_group` |
