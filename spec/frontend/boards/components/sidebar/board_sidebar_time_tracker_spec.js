/*
    To avoid duplicating tests in time_tracker.spec,
    this spec only contains a simple test to check rendering.

    A detailed feature spec is used to test time tracking feature
    in swimlanes sidebar.
*/

import { shallowMount } from '@vue/test-utils';
import BoardSidebarTimeTracker from '~/boards/components/sidebar/board_sidebar_time_tracker.vue';
import { createStore } from '~/boards/stores';
import IssuableTimeTracker from '~/sidebar/components/time_tracking/time_tracker.vue';

describe('BoardSidebarTimeTracker', () => {
  let wrapper;
  let store;

  const createComponent = (options) => {
    wrapper = shallowMount(BoardSidebarTimeTracker, {
      store,
      ...options,
    });
  };

  beforeEach(() => {
    store = createStore();
    store.state.boardItems = {
      1: {
        id: 1,
        iid: 1,
        timeEstimate: 3600,
        totalTimeSpent: 1800,
        humanTimeEstimate: '1h',
        humanTotalTimeSpent: '30min',
      },
    };
    store.state.activeId = '1';
  });

  it.each`
    timeTrackingLimitToHours | canUpdate
    ${true}                  | ${false}
    ${true}                  | ${true}
    ${false}                 | ${false}
    ${false}                 | ${true}
  `(
    'renders IssuableTimeTracker with correct spent and estimated time (timeTrackingLimitToHours=$timeTrackingLimitToHours, canUpdate=$canUpdate)',
    ({ timeTrackingLimitToHours, canUpdate }) => {
      createComponent({ provide: { timeTrackingLimitToHours, canUpdate } });

      expect(wrapper.findComponent(IssuableTimeTracker).props()).toEqual({
        limitToHours: timeTrackingLimitToHours,
        canAddTimeEntries: canUpdate,
        showCollapsed: false,
        issuableId: '1',
        issuableIid: '1',
        fullPath: '',
        initialTimeTracking: {
          timeEstimate: 3600,
          totalTimeSpent: 1800,
          humanTimeEstimate: '1h',
          humanTotalTimeSpent: '30min',
        },
      });
    },
  );
});
