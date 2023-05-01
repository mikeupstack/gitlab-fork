import addExtraTokensForMergeRequests from 'ee_else_ce/filtered_search/add_extra_tokens_for_merge_requests';
import ShortcutsNavigation from '~/behaviors/shortcuts/shortcuts_navigation';
import IssuableFilteredSearchTokenKeys from '~/filtered_search/issuable_filtered_search_token_keys';
import { FILTERED_SEARCH } from '~/filtered_search/constants';
import { initBulkUpdateSidebar, initCsvImportExportButtons, initIssuableByEmail } from '~/issuable';
import initFilteredSearch from '~/pages/search/init_filtered_search';

initBulkUpdateSidebar('merge_request_');

addExtraTokensForMergeRequests(IssuableFilteredSearchTokenKeys);
IssuableFilteredSearchTokenKeys.removeTokensForKeys('iteration');

initFilteredSearch({
  page: FILTERED_SEARCH.MERGE_REQUESTS,
  filteredSearchTokenKeys: IssuableFilteredSearchTokenKeys,
  useDefaultState: true,
});

new ShortcutsNavigation(); // eslint-disable-line no-new

initIssuableByEmail();
initCsvImportExportButtons();
