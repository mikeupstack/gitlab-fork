import { GlCard, GlForm, GlFormTextarea, GlAlert } from '@gitlab/ui';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import DashboardPanel from '~/monitoring/components/dashboard_panel.vue';
import DashboardPanelBuilder from '~/monitoring/components/dashboard_panel_builder.vue';
import { createStore } from '~/monitoring/stores';
import * as types from '~/monitoring/stores/mutation_types';
import DateTimePicker from '~/vue_shared/components/date_time_picker/date_time_picker.vue';
import { metricsDashboardResponse } from '../fixture_data';
import { mockTimeRange } from '../mock_data';

const mockPanel = metricsDashboardResponse.dashboard.panel_groups[0].panels[0];

describe('dashboard invalid url parameters', () => {
  let store;
  let wrapper;
  let mockShowToast;

  const createComponent = (props = {}, options = {}) => {
    wrapper = shallowMount(DashboardPanelBuilder, {
      propsData: { ...props },
      store,
      stubs: {
        GlCard,
      },
      mocks: {
        $toast: {
          show: mockShowToast,
        },
      },
      options,
    });
  };

  const findForm = () => wrapper.findComponent(GlForm);
  const findTxtArea = () => findForm().findComponent(GlFormTextarea);
  const findSubmitBtn = () => findForm().find('[type="submit"]');
  const findClipboardCopyBtn = () => wrapper.findComponent({ ref: 'clipboardCopyBtn' });
  const findViewDocumentationBtn = () => wrapper.findComponent({ ref: 'viewDocumentationBtn' });
  const findOpenRepositoryBtn = () => wrapper.findComponent({ ref: 'openRepositoryBtn' });
  const findPanel = () => wrapper.findComponent(DashboardPanel);
  const findTimeRangePicker = () => wrapper.findComponent(DateTimePicker);
  const findRefreshButton = () => wrapper.find('[data-testid="previewRefreshButton"]');

  beforeEach(() => {
    mockShowToast = jest.fn();
    store = createStore();
    createComponent();
    jest.spyOn(store, 'dispatch').mockResolvedValue();
  });

  it('is mounted', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('displays an empty dashboard panel', () => {
    expect(findPanel().exists()).toBe(true);
    expect(findPanel().props('graphData')).toBe(null);
  });

  it('does not fetch initial data by default', () => {
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  describe('yml form', () => {
    it('form exists and can be submitted', () => {
      expect(findForm().exists()).toBe(true);
      expect(findSubmitBtn().exists()).toBe(true);
      expect(findSubmitBtn().props('disabled')).toBe(false);
    });

    it('form has a text area with a default value', () => {
      expect(findTxtArea().exists()).toBe(true);

      const value = findTxtArea().attributes('value');

      // Panel definition should contain a title and a type
      expect(value).toContain('title:');
      expect(value).toContain('type:');
    });

    it('"copy to clipboard" button works', () => {
      findClipboardCopyBtn().vm.$emit('click');
      const clipboardText = findClipboardCopyBtn().attributes('data-clipboard-text');

      expect(clipboardText).toContain('title:');
      expect(clipboardText).toContain('type:');

      expect(mockShowToast).toHaveBeenCalledTimes(1);
    });

    it('on submit fetches a panel preview', async () => {
      findForm().vm.$emit('submit', new Event('submit'));

      await nextTick();
      expect(store.dispatch).toHaveBeenCalledWith(
        'monitoringDashboard/fetchPanelPreview',
        expect.stringContaining('title:'),
      );
    });

    describe('when form is submitted', () => {
      beforeEach(async () => {
        store.commit(`monitoringDashboard/${types.REQUEST_PANEL_PREVIEW}`, 'mock yml content');
        await nextTick();
      });

      it('submit button is disabled', () => {
        expect(findSubmitBtn().props('disabled')).toBe(true);
      });
    });
  });

  describe('time range picker', () => {
    it('is visible by default', () => {
      expect(findTimeRangePicker().exists()).toBe(true);
    });

    it('when changed does not trigger data fetch unless preview panel button is clicked', async () => {
      // mimic initial state where SET_PANEL_PREVIEW_IS_SHOWN is set to false
      store.commit(`monitoringDashboard/${types.SET_PANEL_PREVIEW_IS_SHOWN}`, false);

      await nextTick();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('when changed triggers data fetch if preview panel button is clicked', async () => {
      findForm().vm.$emit('submit', new Event('submit'));

      store.commit(`monitoringDashboard/${types.SET_PANEL_PREVIEW_TIME_RANGE}`, mockTimeRange);

      await nextTick();
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('is visible by default', () => {
      expect(findRefreshButton().exists()).toBe(true);
    });

    it('when clicked does not trigger data fetch unless preview panel button is clicked', async () => {
      // mimic initial state where SET_PANEL_PREVIEW_IS_SHOWN is set to false
      store.commit(`monitoringDashboard/${types.SET_PANEL_PREVIEW_IS_SHOWN}`, false);

      await nextTick();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('when clicked triggers data fetch if preview panel button is clicked', async () => {
      // mimic state where preview is visible. SET_PANEL_PREVIEW_IS_SHOWN is set to true
      store.commit(`monitoringDashboard/${types.SET_PANEL_PREVIEW_IS_SHOWN}`, true);

      findRefreshButton().vm.$emit('click');

      await nextTick();
      expect(store.dispatch).toHaveBeenCalledWith(
        'monitoringDashboard/fetchPanelPreviewMetrics',
        undefined,
      );
    });
  });

  describe('instructions card', () => {
    const mockDocsPath = '/docs-path';
    const mockProjectPath = '/project-path';

    beforeEach(() => {
      store.state.monitoringDashboard.addDashboardDocumentationPath = mockDocsPath;
      store.state.monitoringDashboard.projectPath = mockProjectPath;

      createComponent();
    });

    it('displays next actions for the user', () => {
      expect(findViewDocumentationBtn().exists()).toBe(true);
      expect(findViewDocumentationBtn().attributes('href')).toBe(mockDocsPath);

      expect(findOpenRepositoryBtn().exists()).toBe(true);
      expect(findOpenRepositoryBtn().attributes('href')).toBe(mockProjectPath);
    });
  });

  describe('when there is an error', () => {
    const mockError = 'an error occurred!';

    beforeEach(async () => {
      store.commit(`monitoringDashboard/${types.RECEIVE_PANEL_PREVIEW_FAILURE}`, mockError);
      await nextTick();
    });

    it('displays an alert', () => {
      expect(wrapper.findComponent(GlAlert).exists()).toBe(true);
      expect(wrapper.findComponent(GlAlert).text()).toBe(mockError);
    });

    it('displays an empty dashboard panel', () => {
      expect(findPanel().props('graphData')).toBe(null);
    });

    it('changing time range should not refetch data', async () => {
      store.commit(`monitoringDashboard/${types.SET_PANEL_PREVIEW_TIME_RANGE}`, mockTimeRange);

      await nextTick();
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('when panel data is available', () => {
    beforeEach(async () => {
      store.commit(`monitoringDashboard/${types.RECEIVE_PANEL_PREVIEW_SUCCESS}`, mockPanel);
      await nextTick();
    });

    it('displays no alert', () => {
      expect(wrapper.findComponent(GlAlert).exists()).toBe(false);
    });

    it('displays panel with data', () => {
      const { title, type } = wrapper.findComponent(DashboardPanel).props('graphData');

      expect(title).toBe(mockPanel.title);
      expect(type).toBe(mockPanel.type);
    });
  });
});
