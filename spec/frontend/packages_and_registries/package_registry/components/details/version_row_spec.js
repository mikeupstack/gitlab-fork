import { GlDropdownItem, GlFormCheckbox, GlIcon, GlLink, GlSprintf, GlTruncate } from '@gitlab/ui';
import { shallowMountExtended } from 'helpers/vue_test_utils_helper';
import { getIdFromGraphQLId } from '~/graphql_shared/utils';
import ListItem from '~/vue_shared/components/registry/list_item.vue';
import PackageTags from '~/packages_and_registries/shared/components/package_tags.vue';
import PublishMethod from '~/packages_and_registries/shared/components/publish_method.vue';
import VersionRow from '~/packages_and_registries/package_registry/components/details/version_row.vue';
import TimeAgoTooltip from '~/vue_shared/components/time_ago_tooltip.vue';
import { PACKAGE_ERROR_STATUS } from '~/packages_and_registries/package_registry/constants';
import { createMockDirective, getBinding } from 'helpers/vue_mock_directive';

import { packageVersions } from '../../mock_data';

const packageVersion = packageVersions()[0];

describe('VersionRow', () => {
  let wrapper;

  const findListItem = () => wrapper.findComponent(ListItem);
  const findLink = () => wrapper.findComponent(GlLink);
  const findPackageTags = () => wrapper.findComponent(PackageTags);
  const findPublishMethod = () => wrapper.findComponent(PublishMethod);
  const findTimeAgoTooltip = () => wrapper.findComponent(TimeAgoTooltip);
  const findPackageName = () => wrapper.findComponent(GlTruncate);
  const findWarningIcon = () => wrapper.findComponent(GlIcon);
  const findBulkDeleteAction = () => wrapper.findComponent(GlFormCheckbox);
  const findDeleteDropdownItem = () => wrapper.findComponent(GlDropdownItem);

  function createComponent({ packageEntity = packageVersion, selected = false } = {}) {
    wrapper = shallowMountExtended(VersionRow, {
      propsData: {
        packageEntity,
        selected,
      },
      stubs: {
        GlSprintf,
        GlTruncate,
      },
      directives: {
        GlTooltip: createMockDirective('gl-tooltip'),
      },
    });
  }

  it('has a link to the version detail', () => {
    createComponent();

    expect(findLink().attributes('href')).toBe(`${getIdFromGraphQLId(packageVersion.id)}`);
  });

  it('lists the package name', () => {
    createComponent();

    expect(findLink().text()).toBe(packageVersion.name);
  });

  it('has the version of the package', () => {
    createComponent();

    expect(wrapper.text()).toContain(packageVersion.version);
  });

  it('has a package tags component', () => {
    createComponent();

    expect(findPackageTags().props('tags')).toBe(packageVersion.tags.nodes);
  });

  it('has a publish method component', () => {
    createComponent();

    expect(findPublishMethod().props('packageEntity')).toBe(packageVersion);
  });
  it('has a time-ago tooltip', () => {
    createComponent();

    expect(findTimeAgoTooltip().props('time')).toBe(packageVersion.createdAt);
  });

  describe('left action template', () => {
    it('does not render checkbox if not permitted', () => {
      createComponent({ packageEntity: { ...packageVersion, canDestroy: false } });

      expect(findBulkDeleteAction().exists()).toBe(false);
    });

    it('renders checkbox', () => {
      createComponent();

      expect(findBulkDeleteAction().exists()).toBe(true);
      expect(findBulkDeleteAction().attributes('checked')).toBeUndefined();
    });

    it('emits select when checked', () => {
      createComponent();

      findBulkDeleteAction().vm.$emit('change');

      expect(wrapper.emitted('select')).toHaveLength(1);
    });

    it('renders checkbox in selected state if selected', () => {
      createComponent({
        selected: true,
      });

      expect(findBulkDeleteAction().attributes('checked')).toBe('true');
      expect(findListItem().props('selected')).toBe(true);
    });
  });

  describe('delete button', () => {
    it('does not exist when package cannot be destroyed', () => {
      createComponent({ packageEntity: { ...packageVersion, canDestroy: false } });

      expect(findDeleteDropdownItem().exists()).toBe(false);
    });

    it('exists and has the correct props', () => {
      createComponent();

      expect(findDeleteDropdownItem().exists()).toBe(true);
      expect(findDeleteDropdownItem().attributes()).toMatchObject({
        variant: 'danger',
      });
    });

    it('emits the delete event when the delete button is clicked', () => {
      createComponent();

      findDeleteDropdownItem().vm.$emit('click');

      expect(wrapper.emitted('delete')).toHaveLength(1);
    });
  });

  describe(`when the package is in ${PACKAGE_ERROR_STATUS} status`, () => {
    beforeEach(() => {
      createComponent({
        packageEntity: {
          ...packageVersion,
          status: PACKAGE_ERROR_STATUS,
          _links: {
            webPath: null,
          },
        },
      });
    });

    it('lists the package name', () => {
      expect(findPackageName().props('text')).toBe('@gitlab-org/package-15');
    });

    it('does not have a link to navigate to the details page', () => {
      expect(findLink().exists()).toBe(false);
    });

    it('has a warning icon', () => {
      const icon = findWarningIcon();
      const tooltip = getBinding(icon.element, 'gl-tooltip');
      expect(icon.props('name')).toBe('warning');
      expect(icon.props('ariaLabel')).toBe('Warning');
      expect(tooltip.value).toMatchObject({
        title: 'Invalid Package: failed metadata extraction',
      });
    });
  });

  describe('disabled status', () => {
    beforeEach(() => {
      createComponent({
        packageEntity: {
          ...packageVersion,
          status: 'something',
          _links: {
            webPath: null,
          },
        },
      });
    });

    it('lists the package name', () => {
      expect(findPackageName().props('text')).toBe('@gitlab-org/package-15');
    });

    it('does not have a link to navigate to the details page', () => {
      expect(findLink().exists()).toBe(false);
    });
  });
});