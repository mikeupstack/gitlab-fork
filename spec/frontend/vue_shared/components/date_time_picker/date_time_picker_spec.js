import { mount } from '@vue/test-utils';
import timezoneMock from 'timezone-mock';
import { nextTick } from 'vue';
import DateTimePicker from '~/vue_shared/components/date_time_picker/date_time_picker.vue';
import {
  defaultTimeRanges,
  defaultTimeRange,
} from '~/vue_shared/components/date_time_picker/date_time_picker_lib';

const optionsCount = defaultTimeRanges.length;

describe('DateTimePicker', () => {
  let wrapper;

  const dropdownToggle = () => wrapper.find('.dropdown-toggle');
  const dropdownMenu = () => wrapper.find('.dropdown-menu');
  const cancelButton = () => wrapper.find('[data-testid="cancelButton"]');
  const applyButtonElement = () => wrapper.find('button.btn-confirm').element;
  const findQuickRangeItems = () => wrapper.findAll('.dropdown-item');

  const createComponent = (props) => {
    wrapper = mount(DateTimePicker, {
      propsData: {
        ...props,
      },
    });
  };

  it('renders dropdown toggle button with selected text', async () => {
    createComponent();
    await nextTick();
    expect(dropdownToggle().text()).toBe(defaultTimeRange.label);
  });

  it('renders dropdown toggle button with selected text and utc label', async () => {
    createComponent({ utc: true });
    await nextTick();
    expect(dropdownToggle().text()).toContain(defaultTimeRange.label);
    expect(dropdownToggle().text()).toContain('UTC');
  });

  it('renders dropdown with 2 custom time range inputs', async () => {
    createComponent();
    await nextTick();
    expect(wrapper.findAll('input').length).toBe(2);
  });

  describe('renders label with h/m/s truncated if possible', () => {
    [
      {
        start: '2019-10-10T00:00:00.000Z',
        end: '2019-10-10T00:00:00.000Z',
        label: '2019-10-10 to 2019-10-10',
      },
      {
        start: '2019-10-10T00:00:00.000Z',
        end: '2019-10-14T00:10:00.000Z',
        label: '2019-10-10 to 2019-10-14 00:10:00',
      },
      {
        start: '2019-10-10T00:00:00.000Z',
        end: '2019-10-10T00:00:01.000Z',
        label: '2019-10-10 to 2019-10-10 00:00:01',
      },
      {
        start: '2019-10-10T00:00:01.000Z',
        end: '2019-10-10T00:00:01.000Z',
        label: '2019-10-10 00:00:01 to 2019-10-10 00:00:01',
      },
      {
        start: '2019-10-10T00:00:01.000Z',
        end: '2019-10-10T00:00:01.000Z',
        utc: true,
        label: '2019-10-10 00:00:01 to 2019-10-10 00:00:01 UTC',
      },
    ].forEach(({ start, end, utc, label }) => {
      it(`for start ${start}, end ${end}, and utc ${utc}, label is ${label}`, async () => {
        createComponent({
          value: { start, end },
          utc,
        });
        await nextTick();
        expect(dropdownToggle().text()).toBe(label);
      });
    });
  });

  it(`renders dropdown with ${optionsCount} (default) items in quick range`, async () => {
    createComponent();
    dropdownToggle().trigger('click');
    await nextTick();
    expect(findQuickRangeItems().length).toBe(optionsCount);
  });

  it('renders dropdown with a default quick range item selected', async () => {
    createComponent();
    dropdownToggle().trigger('click');
    await nextTick();
    expect(wrapper.find('.dropdown-item.active').exists()).toBe(true);
    expect(wrapper.find('.dropdown-item.active').text()).toBe(defaultTimeRange.label);
  });

  it('renders a disabled apply button on wrong input', () => {
    createComponent({
      start: 'invalid-input-date',
    });

    expect(applyButtonElement().getAttribute('disabled')).toBe('disabled');
  });

  describe('user input', () => {
    const fillInputAndBlur = async (input, val) => {
      wrapper.find(input).setValue(val);
      await nextTick();
      wrapper.find(input).trigger('blur');
      await nextTick();
    };

    beforeEach(async () => {
      createComponent();
      await nextTick();
    });

    it('displays inline error message if custom time range inputs are invalid', async () => {
      await fillInputAndBlur('#custom-time-from', '2019-10-01abc');
      await fillInputAndBlur('#custom-time-to', '2019-10-10abc');
      expect(wrapper.findAll('.invalid-feedback').length).toBe(2);
    });

    it('keeps apply button disabled with invalid custom time range inputs', async () => {
      await fillInputAndBlur('#custom-time-from', '2019-10-01abc');
      await fillInputAndBlur('#custom-time-to', '2019-09-19');
      expect(applyButtonElement().getAttribute('disabled')).toBe('disabled');
    });

    it('enables apply button with valid custom time range inputs', async () => {
      await fillInputAndBlur('#custom-time-from', '2019-10-01');
      await fillInputAndBlur('#custom-time-to', '2019-10-19');
      expect(applyButtonElement().getAttribute('disabled')).toBeNull();
    });

    describe('when "apply" is clicked', () => {
      it('emits iso dates', async () => {
        await fillInputAndBlur('#custom-time-from', '2019-10-01 00:00:00');
        await fillInputAndBlur('#custom-time-to', '2019-10-19 00:00:00');
        applyButtonElement().click();

        expect(wrapper.emitted().input).toHaveLength(1);
        expect(wrapper.emitted().input[0]).toEqual([
          {
            end: '2019-10-19T00:00:00Z',
            start: '2019-10-01T00:00:00Z',
          },
        ]);
      });

      it('emits iso dates, for dates without time of day', async () => {
        await fillInputAndBlur('#custom-time-from', '2019-10-01');
        await fillInputAndBlur('#custom-time-to', '2019-10-19');
        applyButtonElement().click();

        expect(wrapper.emitted().input).toHaveLength(1);
        expect(wrapper.emitted().input[0]).toEqual([
          {
            end: '2019-10-19T00:00:00Z',
            start: '2019-10-01T00:00:00Z',
          },
        ]);
      });

      describe('when timezone is different', () => {
        beforeAll(() => {
          timezoneMock.register('US/Pacific');
        });
        afterAll(() => {
          timezoneMock.unregister();
        });

        it('emits iso dates', async () => {
          await fillInputAndBlur('#custom-time-from', '2019-10-01 00:00:00');
          await fillInputAndBlur('#custom-time-to', '2019-10-19 12:00:00');
          applyButtonElement().click();

          expect(wrapper.emitted().input).toHaveLength(1);
          expect(wrapper.emitted().input[0]).toEqual([
            {
              start: '2019-10-01T07:00:00Z',
              end: '2019-10-19T19:00:00Z',
            },
          ]);
        });

        it('emits iso dates with utc format', async () => {
          wrapper.setProps({ utc: true });
          await nextTick();
          await fillInputAndBlur('#custom-time-from', '2019-10-01 00:00:00');
          await fillInputAndBlur('#custom-time-to', '2019-10-19 12:00:00');
          applyButtonElement().click();

          expect(wrapper.emitted().input).toHaveLength(1);
          expect(wrapper.emitted().input[0]).toEqual([
            {
              start: '2019-10-01T00:00:00Z',
              end: '2019-10-19T12:00:00Z',
            },
          ]);
        });
      });
    });

    it('unchecks quick range when text is input is clicked', async () => {
      const findActiveItems = () =>
        findQuickRangeItems().filter((w) => w.classes().includes('active'));

      expect(findActiveItems().length).toBe(1);

      await fillInputAndBlur('#custom-time-from', '2019-10-01');
      expect(findActiveItems().length).toBe(0);
    });

    it('emits dates in an object when a  is clicked', () => {
      findQuickRangeItems()
        .at(3) // any item
        .trigger('click');

      expect(wrapper.emitted().input).toHaveLength(1);
      expect(wrapper.emitted().input[0][0]).toMatchObject({
        duration: {
          seconds: expect.any(Number),
        },
      });
    });

    it('hides the popover with cancel button', async () => {
      dropdownToggle().trigger('click');

      await nextTick();
      cancelButton().trigger('click');

      await nextTick();
      expect(dropdownMenu().classes('show')).toBe(false);
    });
  });

  describe('when using non-default time windows', () => {
    const MOCK_NOW = Date.UTC(2020, 0, 23, 20);

    const otherTimeRanges = [
      {
        label: '1 minute',
        duration: { seconds: 60 },
      },
      {
        label: '2 minutes',
        duration: { seconds: 60 * 2 },
        default: true,
      },
      {
        label: '5 minutes',
        duration: { seconds: 60 * 5 },
      },
    ];

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockImplementation(() => MOCK_NOW);
    });

    it('renders dropdown with a label in the quick range', async () => {
      createComponent({
        value: {
          duration: { seconds: 60 * 5 },
        },
        options: otherTimeRanges,
      });
      dropdownToggle().trigger('click');
      await nextTick();
      expect(dropdownToggle().text()).toBe('5 minutes');
    });

    it('renders dropdown with a label in the quick range and utc label', async () => {
      createComponent({
        value: {
          duration: { seconds: 60 * 5 },
        },
        utc: true,
        options: otherTimeRanges,
      });
      dropdownToggle().trigger('click');
      await nextTick();
      expect(dropdownToggle().text()).toBe('5 minutes UTC');
    });

    it('renders dropdown with quick range items', async () => {
      createComponent({
        value: {
          duration: { seconds: 60 * 2 },
        },
        options: otherTimeRanges,
      });
      dropdownToggle().trigger('click');
      await nextTick();
      const items = findQuickRangeItems();

      expect(items.length).toBe(Object.keys(otherTimeRanges).length);
      expect(items.at(0).text()).toBe('1 minute');
      expect(items.at(0).classes()).not.toContain('active');

      expect(items.at(1).text()).toBe('2 minutes');
      expect(items.at(1).classes()).toContain('active');

      expect(items.at(2).text()).toBe('5 minutes');
      expect(items.at(2).classes()).not.toContain('active');
    });

    it('renders dropdown with a label not in the quick range', async () => {
      createComponent({
        value: {
          duration: { seconds: 60 * 4 },
        },
      });
      dropdownToggle().trigger('click');
      await nextTick();
      expect(dropdownToggle().text()).toBe('2020-01-23 19:56:00 to 2020-01-23 20:00:00');
    });
  });
});
