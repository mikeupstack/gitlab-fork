<script>
import { GlFormRadio } from '@gitlab/ui';

export default {
  components: {
    GlFormRadio,
  },
  model: {
    event: 'input',
    prop: 'checked',
  },
  props: {
    image: {
      type: String,
      required: false,
      default: null,
    },
    checked: {
      type: String,
      required: false,
      default: null,
    },
    value: {
      type: String,
      required: false,
      default: null,
    },
  },
  computed: {
    isChecked() {
      return this.value && this.value === this.checked;
    },
  },
  methods: {
    onInput($event) {
      if (!$event) {
        return;
      }
      this.$emit('input', $event);
    },
    onChange($event) {
      this.$emit('change', $event);
    },
  },
};
</script>

<template>
  <div
    class="runner-platforms-radio gl-display-flex gl-border gl-rounded-base gl-px-5 gl-py-6"
    :class="{ 'gl-bg-blue-50 gl-border-blue-500': isChecked, 'gl-cursor-pointer': value }"
    @click="onInput(value)"
  >
    <gl-form-radio
      v-if="value"
      class="gl-min-h-5"
      :checked="checked"
      :value="value"
      @input="onInput($event)"
      @change="onChange($event)"
    >
      <img v-if="image" :src="image" aria-hidden="true" class="gl-h-5 gl-mr-2" />
      <span class="gl-font-weight-bold"><slot></slot></span>
    </gl-form-radio>
    <div v-else class="gl-h-5">
      <img v-if="image" :src="image" aria-hidden="true" class="gl-h-5 gl-mr-2" />
      <span class="gl-font-weight-bold"><slot></slot></span>
    </div>
  </div>
</template>

<style>
.runner-platforms-radio {
  min-width: 173px;
}
</style>
