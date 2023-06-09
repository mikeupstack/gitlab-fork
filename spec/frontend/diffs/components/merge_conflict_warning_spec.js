import { shallowMount, mount } from '@vue/test-utils';
import MergeConflictWarning from '~/diffs/components/merge_conflict_warning.vue';

const propsData = {
  limited: true,
  mergeable: true,
  resolutionPath: 'a-path',
};

function findResolveButton(wrapper) {
  return wrapper.find('.gl-alert-actions a.gl-button:first-child');
}
function findLocalMergeButton(wrapper) {
  return wrapper.find('.gl-alert-actions button.gl-button:last-child');
}

describe('MergeConflictWarning', () => {
  let wrapper;

  const createComponent = (props = {}, { full } = { full: false }) => {
    const mounter = full ? mount : shallowMount;

    wrapper = mounter(MergeConflictWarning, {
      propsData: { ...propsData, ...props },
    });
  };

  it.each`
    present  | resolutionPath
    ${false} | ${''}
    ${true}  | ${'some-path'}
  `(
    'toggles the resolve conflicts button based on the provided resolutionPath "$resolutionPath"',
    ({ present, resolutionPath }) => {
      createComponent({ resolutionPath }, { full: true });
      const resolveButton = findResolveButton(wrapper);

      expect(resolveButton.exists()).toBe(present);
      if (present) {
        expect(resolveButton.attributes('href')).toBe(resolutionPath);
      }
    },
  );

  it.each`
    present  | mergeable
    ${false} | ${false}
    ${true}  | ${true}
  `(
    'toggles the local merge button based on the provided mergeable property "$mergable"',
    ({ present, mergeable }) => {
      createComponent({ mergeable }, { full: true });
      const localMerge = findLocalMergeButton(wrapper);

      expect(localMerge.exists()).toBe(present);
    },
  );
});
