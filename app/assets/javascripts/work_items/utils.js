import { WIDGET_TYPE_HIERARCHY } from '~/work_items/constants';
import workItemQuery from './graphql/work_item.query.graphql';
import workItemByIidQuery from './graphql/work_item_by_iid.query.graphql';
import workItemNotesIdQuery from './graphql/notes/work_item_notes.query.graphql';
import workItemNotesByIidQuery from './graphql/notes/work_item_notes_by_iid.query.graphql';

export function getWorkItemQuery(isFetchedByIid) {
  return isFetchedByIid ? workItemByIidQuery : workItemQuery;
}

export function getWorkItemNotesQuery(isFetchedByIid) {
  return isFetchedByIid ? workItemNotesByIidQuery : workItemNotesIdQuery;
}

export const findHierarchyWidgetChildren = (workItem) =>
  workItem.widgets.find((widget) => widget.type === WIDGET_TYPE_HIERARCHY).children.nodes;

const autocompleteSourcesPath = (autocompleteType, fullPath, workItemIid) => {
  return `${
    gon.relative_url_root || ''
  }/${fullPath}/-/autocomplete_sources/${autocompleteType}?type=WorkItem&type_id=${workItemIid}`;
};

export const autocompleteDataSources = (fullPath, iid) => ({
  labels: autocompleteSourcesPath('labels', fullPath, iid),
  members: autocompleteSourcesPath('members', fullPath, iid),
  commands: autocompleteSourcesPath('commands', fullPath, iid),
});

export const markdownPreviewPath = (fullPath, iid) =>
  `${
    gon.relative_url_root || ''
  }/${fullPath}/preview_markdown?target_type=WorkItem&target_id=${iid}`;
