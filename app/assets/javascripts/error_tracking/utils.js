const category = 'Error Tracking'; // eslint-disable-line @gitlab/require-i18n-strings

/**
 * Tracks snowplow event when User clicks on error link to Sentry
 * @param {String}  externalUrl that will be send as a property for the event
 */
export const trackClickErrorLinkToSentryOptions = (url) => ({
  category,
  action: 'click_error_link_to_sentry',
  label: 'Error Link', // eslint-disable-line @gitlab/require-i18n-strings
  property: url,
});

/**
 * Tracks snowplow event when user views error list
 */
export const trackErrorListViewsOptions = {
  category,
  action: 'view_errors_list',
};

/**
 * Tracks snowplow event when user views error details
 */
export const trackErrorDetailsViewsOptions = {
  category,
  action: 'view_error_details',
};

/**
 * Tracks snowplow event when error status is updated
 */
export const trackErrorStatusUpdateOptions = (status) => ({
  category,
  action: `update_${status}_status`,
});
