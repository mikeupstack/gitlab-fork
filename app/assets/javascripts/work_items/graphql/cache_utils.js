import { produce } from 'immer';
import { WIDGET_TYPE_NOTES } from '~/work_items/constants';

const isNotesWidget = (widget) => widget.type === WIDGET_TYPE_NOTES;

const getNotesWidgetFromSourceData = (draftData, fetchByIid) => {
  return fetchByIid
    ? draftData.workspace.workItems.nodes[0].widgets.find(isNotesWidget)
    : draftData.workItem.widgets.find(isNotesWidget);
};

const updateNotesWidgetDataInDraftData = (draftData, notesWidget, fetchByIid) => {
  const noteWidgetIndex = fetchByIid
    ? draftData.workspace.workItems.nodes[0].widgets.findIndex(isNotesWidget)
    : draftData.workItem.widgets.findIndex(isNotesWidget);

  if (fetchByIid) {
    draftData.workspace.workItems.nodes[0].widgets[noteWidgetIndex] = notesWidget;
  } else {
    draftData.workItem.widgets[noteWidgetIndex] = notesWidget;
  }
};

/**
 * Work Item note create subscription update query callback
 *
 * @param currentNotes
 * @param subscriptionData
 * @param fetchByIid
 */

export const updateCacheAfterCreatingNote = (currentNotes, subscriptionData, fetchByIid) => {
  if (!subscriptionData.data?.workItemNoteCreated) {
    return currentNotes;
  }
  const newNote = subscriptionData.data.workItemNoteCreated;

  return produce(currentNotes, (draftData) => {
    const notesWidget = getNotesWidgetFromSourceData(draftData, fetchByIid);

    if (!notesWidget.discussions) {
      return;
    }

    const discussion = notesWidget.discussions.nodes.find((d) => d.id === newNote.discussion.id);

    // handle the case where discussion already exists - we don't need to do anything, update will happen automatically
    if (discussion) {
      return;
    }

    notesWidget.discussions.nodes.push(newNote.discussion);
    updateNotesWidgetDataInDraftData(draftData, notesWidget, fetchByIid);
  });
};

/**
 * Work Item note delete subscription update query callback
 *
 * @param currentNotes
 * @param subscriptionData
 * @param fetchByIid
 */

export const updateCacheAfterDeletingNote = (currentNotes, subscriptionData, fetchByIid) => {
  if (!subscriptionData.data?.workItemNoteDeleted) {
    return currentNotes;
  }
  const deletedNote = subscriptionData.data.workItemNoteDeleted;
  const { id, discussionId, lastDiscussionNote } = deletedNote;

  return produce(currentNotes, (draftData) => {
    const notesWidget = getNotesWidgetFromSourceData(draftData, fetchByIid);

    if (!notesWidget.discussions) {
      return;
    }

    const discussionIndex = notesWidget.discussions.nodes.findIndex(
      (discussion) => discussion.id === discussionId,
    );

    if (discussionIndex === -1) {
      return;
    }

    if (lastDiscussionNote) {
      notesWidget.discussions.nodes.splice(discussionIndex, 1);
    } else {
      const deletedThreadDiscussion = notesWidget.discussions.nodes[discussionIndex];
      const deletedThreadIndex = deletedThreadDiscussion.notes.nodes.findIndex(
        (note) => note.id === id,
      );
      deletedThreadDiscussion.notes.nodes.splice(deletedThreadIndex, 1);
      notesWidget.discussions.nodes[discussionIndex] = deletedThreadDiscussion;
    }

    updateNotesWidgetDataInDraftData(draftData, notesWidget, fetchByIid);
  });
};
