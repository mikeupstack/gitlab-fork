<script>
import { GlSprintf, GlModal } from '@gitlab/ui';
import { mapState, mapActions } from 'vuex';
import { createAlert, VARIANT_INFO } from '~/alert';
import { __, s__ } from '~/locale';
import Badge from './badge.vue';
import BadgeForm from './badge_form.vue';
import BadgeList from './badge_list.vue';

export default {
  name: 'BadgeSettings',
  components: {
    Badge,
    BadgeForm,
    BadgeList,
    GlModal,
    GlSprintf,
  },
  i18n: {
    deleteModalText: s__(
      'Badges|You are going to delete this badge. Deleted badges %{strongStart}cannot%{strongEnd} be restored.',
    ),
  },
  computed: {
    ...mapState(['badgeInModal', 'isEditing']),
    primaryProps() {
      return {
        text: __('Delete badge'),
        attributes: { category: 'primary', variant: 'danger' },
      };
    },
    cancelProps() {
      return {
        text: __('Cancel'),
      };
    },
  },
  methods: {
    ...mapActions(['deleteBadge']),
    onSubmitModal() {
      this.deleteBadge(this.badgeInModal)
        .then(() => {
          createAlert({
            message: s__('Badges|The badge was deleted.'),
            variant: VARIANT_INFO,
          });
        })
        .catch((error) => {
          createAlert({
            message: s__('Badges|Deleting the badge failed, please try again.'),
          });
          throw error;
        });
    },
  },
};
</script>

<template>
  <div class="badge-settings">
    <gl-modal
      modal-id="delete-badge-modal"
      :title="s__('Badges|Delete badge?')"
      :action-primary="primaryProps"
      :action-cancel="cancelProps"
      @primary="onSubmitModal"
    >
      <div class="well">
        <badge
          :image-url="badgeInModal ? badgeInModal.renderedImageUrl : ''"
          :link-url="badgeInModal ? badgeInModal.renderedLinkUrl : ''"
        />
      </div>
      <p>
        <gl-sprintf :message="$options.i18n.deleteModalText">
          <template #strong="{ content }">
            <strong>{{ content }}</strong>
          </template>
        </gl-sprintf>
      </p>
    </gl-modal>

    <badge-form v-show="isEditing" :is-editing="true" data-testid="edit-badge" />

    <badge-form v-show="!isEditing" :is-editing="false" data-testid="add-new-badge" />
    <badge-list v-show="!isEditing" />
  </div>
</template>
