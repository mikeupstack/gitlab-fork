import { shallowMountExtended } from 'helpers/vue_test_utils_helper';
import WorkItemNotesActivityHeader from '~/work_items/components/notes/work_item_notes_activity_header.vue';
import { ASC } from '~/notes/constants';
import {
  WORK_ITEM_NOTES_FILTER_ALL_NOTES,
  WORK_ITEM_NOTES_FILTER_ONLY_HISTORY,
} from '~/work_items/constants';

describe('Work Item Note Activity Header', () => {
  let wrapper;

  const findActivityLabelHeading = () => wrapper.find('h3');
  const findActivityFilterDropdown = () => wrapper.findByTestId('work-item-filter');
  const findActivitySortDropdown = () => wrapper.findByTestId('work-item-sort');

  const createComponent = ({
    disableActivityFilterSort = false,
    sortOrder = ASC,
    workItemType = 'Task',
    discussionFilter = WORK_ITEM_NOTES_FILTER_ALL_NOTES,
  } = {}) => {
    wrapper = shallowMountExtended(WorkItemNotesActivityHeader, {
      propsData: {
        disableActivityFilterSort,
        sortOrder,
        workItemType,
        discussionFilter,
      },
    });
  };

  beforeEach(() => {
    createComponent();
  });

  it('Should have the Activity label', () => {
    expect(findActivityLabelHeading().text()).toBe(WorkItemNotesActivityHeader.i18n.activityLabel);
  });

  it('Should have Activity filtering dropdown', () => {
    expect(findActivityFilterDropdown().exists()).toBe(true);
  });

  it('Should have Activity sorting dropdown', () => {
    expect(findActivitySortDropdown().exists()).toBe(true);
  });

  describe('Activity Filter', () => {
    it('emits `changeFilter` when filtering discussions', () => {
      findActivityFilterDropdown().vm.$emit('changeFilter', WORK_ITEM_NOTES_FILTER_ONLY_HISTORY);

      expect(wrapper.emitted('changeFilter')).toEqual([[WORK_ITEM_NOTES_FILTER_ONLY_HISTORY]]);
    });
  });

  describe('Activity Sorting', () => {
    it('emits `changeSort` when sorting discussions/activity', () => {
      findActivitySortDropdown().vm.$emit('changeSort', ASC);

      expect(wrapper.emitted('changeSort')).toEqual([[ASC]]);
    });
  });
});
