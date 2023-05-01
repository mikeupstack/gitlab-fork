import { GlAlert, GlFormInput, GlForm, GlLink } from '@gitlab/ui';
import { shallowMount } from '@vue/test-utils';
import Vue, { nextTick } from 'vue';
import VueApollo from 'vue-apollo';
import createMockApollo from 'helpers/mock_apollo_helper';
import waitForPromises from 'helpers/wait_for_promises';
import BoardEditableItem from '~/boards/components/sidebar/board_editable_item.vue';
import BoardSidebarTitle from '~/boards/components/sidebar/board_sidebar_title.vue';
import { createStore } from '~/boards/stores';
import issueSetTitleMutation from '~/boards/graphql/issue_set_title.mutation.graphql';
import updateEpicTitleMutation from '~/sidebar/queries/update_epic_title.mutation.graphql';
import { updateIssueTitleResponse, updateEpicTitleResponse } from '../../mock_data';

Vue.use(VueApollo);

const TEST_TITLE = 'New item title';
const TEST_ISSUE_A = {
  id: 'gid://gitlab/Issue/1',
  iid: 8,
  title: 'Issue 1',
  referencePath: 'h/b#1',
  webUrl: 'webUrl',
};
const TEST_ISSUE_B = {
  id: 'gid://gitlab/Issue/2',
  iid: 9,
  title: 'Issue 2',
  referencePath: 'h/b#2',
  webUrl: 'webUrl',
};

describe('BoardSidebarTitle', () => {
  let wrapper;
  let store;
  let mockApollo;

  const issueSetTitleMutationHandlerSuccess = jest.fn().mockResolvedValue(updateIssueTitleResponse);
  const updateEpicTitleMutationHandlerSuccess = jest
    .fn()
    .mockResolvedValue(updateEpicTitleResponse);

  afterEach(() => {
    localStorage.clear();
    store = null;
  });

  const createWrapper = ({ item = TEST_ISSUE_A, provide = {} } = {}) => {
    store = createStore();
    store.state.boardItems = { [item.id]: { ...item } };
    store.dispatch('setActiveId', { id: item.id });
    mockApollo = createMockApollo([
      [issueSetTitleMutation, issueSetTitleMutationHandlerSuccess],
      [updateEpicTitleMutation, updateEpicTitleMutationHandlerSuccess],
    ]);

    wrapper = shallowMount(BoardSidebarTitle, {
      store,
      apolloProvider: mockApollo,
      provide: {
        canUpdate: true,
        fullPath: 'gitlab-org',
        issuableType: 'issue',
        isEpicBoard: false,
        isApolloBoard: false,
        ...provide,
      },
      propsData: {
        activeItem: item,
      },
      stubs: {
        'board-editable-item': BoardEditableItem,
      },
    });
  };

  const findForm = () => wrapper.findComponent(GlForm);
  const findAlert = () => wrapper.findComponent(GlAlert);
  const findFormInput = () => wrapper.findComponent(GlFormInput);
  const findGlLink = () => wrapper.findComponent(GlLink);
  const findEditableItem = () => wrapper.findComponent(BoardEditableItem);
  const findCancelButton = () => wrapper.find('[data-testid="cancel-button"]');
  const findTitle = () => wrapper.find('[data-testid="item-title"]');
  const findCollapsed = () => wrapper.find('[data-testid="collapsed-content"]');

  it('renders title and reference', () => {
    createWrapper();

    expect(findTitle().text()).toContain(TEST_ISSUE_A.title);
    expect(findCollapsed().text()).toContain(TEST_ISSUE_A.referencePath);
  });

  it('does not render alert', () => {
    createWrapper();

    expect(findAlert().exists()).toBe(false);
  });

  it('links title to the corresponding issue', () => {
    createWrapper();

    expect(findGlLink().attributes('href')).toBe('webUrl');
  });

  describe('when new title is submitted', () => {
    beforeEach(async () => {
      createWrapper();

      jest.spyOn(wrapper.vm, 'setActiveItemTitle').mockImplementation(() => {
        store.state.boardItems[TEST_ISSUE_A.id].title = TEST_TITLE;
      });
      findFormInput().vm.$emit('input', TEST_TITLE);
      findForm().vm.$emit('submit', { preventDefault: () => {} });
      await nextTick();
    });

    it('collapses sidebar and renders new title', async () => {
      await waitForPromises();
      expect(findCollapsed().isVisible()).toBe(true);
      expect(findTitle().text()).toContain(TEST_TITLE);
    });

    it('commits change to the server', () => {
      expect(wrapper.vm.setActiveItemTitle).toHaveBeenCalledWith({
        title: TEST_TITLE,
        projectPath: 'h/b',
      });
    });
  });

  describe('when submitting and invalid title', () => {
    beforeEach(async () => {
      createWrapper();

      jest.spyOn(wrapper.vm, 'setActiveItemTitle').mockImplementation(() => {});
      findFormInput().vm.$emit('input', '');
      findForm().vm.$emit('submit', { preventDefault: () => {} });
      await nextTick();
    });

    it('commits change to the server', () => {
      expect(wrapper.vm.setActiveItemTitle).not.toHaveBeenCalled();
    });
  });

  describe('when abandoning the form without saving', () => {
    beforeEach(async () => {
      createWrapper();

      wrapper.vm.$refs.sidebarItem.expand();
      findFormInput().vm.$emit('input', TEST_TITLE);
      findEditableItem().vm.$emit('off-click');
      await nextTick();
    });

    it('does not collapses sidebar and shows alert', () => {
      expect(findCollapsed().isVisible()).toBe(false);
      expect(findAlert().exists()).toBe(true);
      expect(localStorage.getItem(`${TEST_ISSUE_A.id}/item-title-pending-changes`)).toBe(
        TEST_TITLE,
      );
    });
  });

  describe('when accessing the form with pending changes', () => {
    beforeAll(() => {
      localStorage.setItem(`${TEST_ISSUE_A.id}/item-title-pending-changes`, TEST_TITLE);

      createWrapper();
    });

    it('sets title, expands item and shows alert', () => {
      expect(wrapper.vm.title).toBe(TEST_TITLE);
      expect(findCollapsed().isVisible()).toBe(false);
      expect(findAlert().exists()).toBe(true);
    });
  });

  describe('when cancel button is clicked', () => {
    beforeEach(async () => {
      createWrapper({ item: TEST_ISSUE_B });

      jest.spyOn(wrapper.vm, 'setActiveItemTitle').mockImplementation(() => {
        store.state.boardItems[TEST_ISSUE_B.id].title = TEST_TITLE;
      });
      findFormInput().vm.$emit('input', TEST_TITLE);
      findCancelButton().vm.$emit('click');
      await nextTick();
    });

    it('collapses sidebar and render former title', () => {
      expect(wrapper.vm.setActiveItemTitle).not.toHaveBeenCalled();
      expect(findCollapsed().isVisible()).toBe(true);
      expect(findTitle().text()).toBe(TEST_ISSUE_B.title);
    });
  });

  describe('when the mutation fails', () => {
    beforeEach(async () => {
      createWrapper({ item: TEST_ISSUE_B });

      jest.spyOn(wrapper.vm, 'setActiveItemTitle').mockImplementation(() => {
        throw new Error(['failed mutation']);
      });
      jest.spyOn(wrapper.vm, 'setError').mockImplementation(() => {});
      findFormInput().vm.$emit('input', 'Invalid title');
      findForm().vm.$emit('submit', { preventDefault: () => {} });
      await nextTick();
    });

    it('collapses sidebar and renders former item title', () => {
      expect(findCollapsed().isVisible()).toBe(true);
      expect(findTitle().text()).toContain(TEST_ISSUE_B.title);
      expect(wrapper.vm.setError).toHaveBeenCalled();
    });
  });

  describe('Apollo boards', () => {
    it.each`
      issuableType | isEpicBoard | queryHandler                             | notCalledHandler
      ${'issue'}   | ${false}    | ${issueSetTitleMutationHandlerSuccess}   | ${updateEpicTitleMutationHandlerSuccess}
      ${'epic'}    | ${true}     | ${updateEpicTitleMutationHandlerSuccess} | ${issueSetTitleMutationHandlerSuccess}
    `(
      'updates $issuableType title',
      async ({ issuableType, isEpicBoard, queryHandler, notCalledHandler }) => {
        createWrapper({
          provide: {
            issuableType,
            isEpicBoard,
            isApolloBoard: true,
          },
        });

        await nextTick();

        findFormInput().vm.$emit('input', TEST_TITLE);
        findForm().vm.$emit('submit', { preventDefault: () => {} });
        await nextTick();

        expect(queryHandler).toHaveBeenCalled();
        expect(notCalledHandler).not.toHaveBeenCalled();
      },
    );
  });
});
