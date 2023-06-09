<script>
import { GlButton, GlForm, GlFormGroup, GlFormInput, GlLink, GlSprintf } from '@gitlab/ui';
import { debounce } from 'lodash';

import { helpPagePath } from '~/helpers/help_page_helper';
import { validateHexColor } from '~/lib/utils/color_utils';
import { s__ } from '~/locale';
import ColorPicker from '~/vue_shared/components/color_picker/color_picker.vue';
import { DEBOUNCE_DELAY } from '../constants';
import {
  fetchPipelineConfigurationFileExists,
  isModalsRefactorEnabled,
  validatePipelineConfirmationFormat,
} from '../utils';

export default {
  components: {
    ColorPicker,
    GlButton,
    GlForm,
    GlFormGroup,
    GlFormInput,
    GlLink,
    GlSprintf,
  },
  inject: ['groupEditPath', 'pipelineConfigurationFullPathEnabled'],
  props: {
    color: {
      type: String,
      required: false,
      default: null,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    name: {
      type: String,
      required: false,
      default: null,
    },
    pipelineConfigurationFullPath: {
      type: String,
      required: false,
      default: null,
    },
    submitButtonText: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      pipelineConfigurationFileExists: true,
    };
  },
  computed: {
    isValidColor() {
      return validateHexColor(this.color);
    },
    isValidName() {
      if (this.name === null) {
        return null;
      }

      return Boolean(this.name);
    },
    isValidDescription() {
      if (this.description === null) {
        return null;
      }

      return Boolean(this.description);
    },
    isValidPipelineConfiguration() {
      if (!this.pipelineConfigurationFullPath) {
        return null;
      }

      return this.isValidPipelineConfigurationFormat && this.pipelineConfigurationFileExists;
    },
    isValidPipelineConfigurationFormat() {
      return validatePipelineConfirmationFormat(this.pipelineConfigurationFullPath);
    },
    disableSubmitBtn() {
      return (
        !this.isValidName ||
        !this.isValidDescription ||
        !this.isValidColor ||
        this.isValidPipelineConfiguration === false
      );
    },
    pipelineConfigurationFeedbackMessage() {
      if (!this.isValidPipelineConfigurationFormat) {
        return this.$options.i18n.pipelineConfigurationInputInvalidFormat;
      }

      return this.$options.i18n.pipelineConfigurationInputUnknownFile;
    },
    compliancePipelineConfigurationHelpPath() {
      return helpPagePath('user/group/compliance_frameworks.md', {
        anchor: 'example-configuration',
      });
    },
    isModalsRefactor() {
      return isModalsRefactorEnabled();
    },
  },
  async created() {
    if (this.pipelineConfigurationFullPath) {
      this.validatePipelineConfigurationPath(this.pipelineConfigurationFullPath);
    }
  },
  methods: {
    onSubmit() {
      this.$emit('submit');
    },
    onPipelineInput(path) {
      this.$emit('update:pipelineConfigurationFullPath', path);
      this.validatePipelineInput(path);
    },
    async validatePipelineConfigurationPath(path) {
      this.pipelineConfigurationFileExists = await fetchPipelineConfigurationFileExists(path);
    },
    validatePipelineInput: debounce(function debounceValidation(path) {
      this.validatePipelineConfigurationPath(path);
    }, DEBOUNCE_DELAY),
    onCancel(event) {
      if (!isModalsRefactorEnabled()) {
        return;
      }

      event.preventDefault();
      this.$emit('cancel');
    },
  },
  i18n: {
    titleInputLabel: s__('ComplianceFrameworks|Name'),
    titleInputInvalid: s__('ComplianceFrameworks|Name is required'),
    descriptionInputLabel: s__('ComplianceFrameworks|Description'),
    descriptionInputInvalid: s__('ComplianceFrameworks|Description is required'),
    pipelineConfigurationInputLabel: s__(
      'ComplianceFrameworks|Compliance pipeline configuration (optional)',
    ),
    pipelineConfigurationInputDescription: s__(
      'ComplianceFrameworks|Required format: %{codeStart}path/file.y[a]ml@group-name/project-name%{codeEnd}. %{linkStart}See some examples%{linkEnd}.',
    ),
    pipelineConfigurationInputInvalidFormat: s__('ComplianceFrameworks|Invalid format'),
    pipelineConfigurationInputUnknownFile: s__('ComplianceFrameworks|Configuration not found'),
    colorInputLabel: s__('ComplianceFrameworks|Background color'),
    cancelBtnText: s__('ComplianceFrameworks|Cancel'),
  },
};
</script>
<template>
  <gl-form @submit.prevent="onSubmit">
    <gl-form-group
      :label="$options.i18n.titleInputLabel"
      :invalid-feedback="$options.i18n.titleInputInvalid"
      :state="isValidName"
      data-testid="name-input-group"
    >
      <gl-form-input
        :value="name"
        :state="isValidName"
        data-testid="name-input"
        @input="$emit('update:name', $event)"
      />
    </gl-form-group>

    <gl-form-group
      :label="$options.i18n.descriptionInputLabel"
      :invalid-feedback="$options.i18n.descriptionInputInvalid"
      :state="isValidDescription"
      data-testid="description-input-group"
    >
      <gl-form-input
        :value="description"
        :state="isValidDescription"
        data-testid="description-input"
        @input="$emit('update:description', $event)"
      />
    </gl-form-group>

    <gl-form-group
      v-if="pipelineConfigurationFullPathEnabled"
      :label="$options.i18n.pipelineConfigurationInputLabel"
      :invalid-feedback="pipelineConfigurationFeedbackMessage"
      :state="isValidPipelineConfiguration"
      data-testid="pipeline-configuration-input-group"
    >
      <template #description>
        <gl-sprintf :message="$options.i18n.pipelineConfigurationInputDescription">
          <template #code="{ content }">
            <code>{{ content }}</code>
          </template>

          <template #link="{ content }">
            <gl-link :href="compliancePipelineConfigurationHelpPath" target="_blank">{{
              content
            }}</gl-link>
          </template>
        </gl-sprintf>
      </template>

      <gl-form-input
        :value="pipelineConfigurationFullPath"
        :state="isValidPipelineConfiguration"
        data-testid="pipeline-configuration-input"
        @input="onPipelineInput"
      />
    </gl-form-group>

    <color-picker
      :value="color"
      :label="$options.i18n.colorInputLabel"
      :state="isValidColor"
      @input="$emit('update:color', $event)"
    />

    <div
      class="gl-display-flex gl-pt-5 gl-border-t-1 gl-border-t-solid gl-border-t-gray-100"
      :class="{
        'gl-justify-content-end gl-gap-3': isModalsRefactor,
        'gl-justify-content-space-between gl-flex-direction-row-reverse': !isModalsRefactor,
      }"
    >
      <gl-button :href="groupEditPath" data-testid="cancel-btn" @click="onCancel">{{
        $options.i18n.cancelBtnText
      }}</gl-button>
      <gl-button
        type="submit"
        variant="confirm"
        class="js-no-auto-disable"
        data-testid="submit-btn"
        :disabled="disableSubmitBtn"
        >{{ submitButtonText }}</gl-button
      >
    </div>
  </gl-form>
</template>
