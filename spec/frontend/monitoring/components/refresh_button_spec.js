import { GlDropdown, GlDropdownItem, GlButton } from '@gitlab/ui';
import { shallowMount } from '@vue/test-utils';
import Visibility from 'visibilityjs';
import { nextTick } from 'vue';
import RefreshButton from '~/monitoring/components/refresh_button.vue';
import { createStore } from '~/monitoring/stores';

describe('RefreshButton', () => {
  let wrapper;
  let store;
  let dispatch;
  let documentHidden;

  const createWrapper = (options = {}) => {
    wrapper = shallowMount(RefreshButton, { store, ...options });
  };

  const findRefreshBtn = () => wrapper.findComponent(GlButton);
  const findDropdown = () => wrapper.findComponent(GlDropdown);
  const findOptions = () => findDropdown().findAllComponents(GlDropdownItem);
  const findOptionAt = (index) => findOptions().at(index);

  const expectFetchDataToHaveBeenCalledTimes = (times) => {
    const refreshCalls = dispatch.mock.calls.filter(([action, payload]) => {
      return action === 'monitoringDashboard/fetchDashboardData' && payload === undefined;
    });
    expect(refreshCalls).toHaveLength(times);
  };

  beforeEach(() => {
    store = createStore();
    jest.spyOn(store, 'dispatch').mockResolvedValue();
    dispatch = store.dispatch;

    documentHidden = false;
    jest.spyOn(Visibility, 'hidden').mockImplementation(() => documentHidden);

    createWrapper();
  });

  afterEach(() => {
    dispatch.mockReset();
    // eslint-disable-next-line @gitlab/vtu-no-explicit-wrapper-destroy
    wrapper.destroy();
  });

  it('refreshes data when "refresh" is clicked', () => {
    findRefreshBtn().vm.$emit('click');
    expectFetchDataToHaveBeenCalledTimes(1);
  });

  it('refresh rate is "Off" in the dropdown', () => {
    expect(findDropdown().props('text')).toBe('Off');
  });

  describe('refresh rate options', () => {
    it('presents multiple options', () => {
      expect(findOptions().length).toBeGreaterThan(1);
    });

    it('presents an "Off" option as the default option', () => {
      expect(findOptionAt(0).text()).toBe('Off');
      expect(findOptionAt(0).props('isChecked')).toBe(true);
    });
  });

  describe('when a refresh rate is chosen', () => {
    const optIndex = 2; // Other option than "Off"

    beforeEach(async () => {
      findOptionAt(optIndex).vm.$emit('click');
      await nextTick();
    });

    it('refresh rate appears in the dropdown', () => {
      expect(findDropdown().props('text')).toBe('10s');
    });

    it('refresh rate option is checked', () => {
      expect(findOptionAt(0).props('isChecked')).toBe(false);
      expect(findOptionAt(optIndex).props('isChecked')).toBe(true);
    });

    it('refreshes data when a new refresh rate is chosen', () => {
      expectFetchDataToHaveBeenCalledTimes(1);
    });

    it('refreshes data after two intervals of time have passed', async () => {
      jest.runOnlyPendingTimers();
      expectFetchDataToHaveBeenCalledTimes(2);

      await nextTick();

      jest.runOnlyPendingTimers();
      expectFetchDataToHaveBeenCalledTimes(3);
    });

    it('does not refresh data if the document is hidden', async () => {
      documentHidden = true;

      jest.runOnlyPendingTimers();
      expectFetchDataToHaveBeenCalledTimes(1);

      await nextTick();

      jest.runOnlyPendingTimers();
      expectFetchDataToHaveBeenCalledTimes(1);
    });

    it('data is not refreshed anymore after component is destroyed', () => {
      expect(jest.getTimerCount()).toBe(1);

      wrapper.destroy();

      expect(jest.getTimerCount()).toBe(0);
    });

    describe('when "Off" refresh rate is chosen', () => {
      beforeEach(async () => {
        findOptionAt(0).vm.$emit('click');
        await nextTick();
      });

      it('refresh rate is "Off" in the dropdown', () => {
        expect(findDropdown().props('text')).toBe('Off');
      });

      it('refresh rate option is appears selected', () => {
        expect(findOptionAt(0).props('isChecked')).toBe(true);
        expect(findOptionAt(optIndex).props('isChecked')).toBe(false);
      });

      it('stops refreshing data', () => {
        jest.runOnlyPendingTimers();
        expectFetchDataToHaveBeenCalledTimes(1);
      });
    });
  });
});
