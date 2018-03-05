<template>
  <section :class="name">
    <template v-if="formstate">
      <validate tag="label" :state="formstate">
        <div class="label" v-html="label" />
        <div class="value">

          <slot />

          <div
            v-show="fieldState.$touched || fieldState.$submitted"
            class="error-message">
            <div v-if="fieldErrors.required">Please fill out this field.</div>
            <div v-else-if="fieldErrors.number">Please enter a number.</div>
            <div v-else-if="fieldErrors.max">Too big.</div>
            <div v-else-if="fieldErrors.min">Too small.</div>
            <div v-else-if="fieldErrors.email">Please enter an email address.</div>
            <div v-else-if="fieldErrors.url">Please enter a URL.</div>

            <!-- custom validators -->
            <div v-else-if="fieldErrors[`complete-range`]">Please fill out both start and end of the range.</div>
            <div v-else-if="fieldErrors[`valid-range`]">The start value of a range must not be greater than its end.</div>
            <div v-else-if="fieldErrors[`categories-not-empty`]">Please select at least one category.</div>
            <div v-else-if="fieldErrors[`complete-dimensions`]">Please fill out all dimensions.</div>
            <div v-else-if="fieldErrors[`start-with-uppercase-or-number`]">Please start with an uppercase letter or a number.</div>
            <div v-else-if="fieldErrors[`no-fine-channel-name`]">Don't create fine channels manually, set the channel resolution below instead.</div>
          </div>

          <div v-if="hint" class="hint">{{ hint }}</div>

        </div>
      </validate>
    </template>
    <template v-else>
      <label>
        <div class="label" v-html="label" />
        <div class="value">
          <slot />
          <div v-if="hint" class="hint">{{ hint }}</div>
        </div>
      </label>
    </template>
  </section>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: false, // TODO: make this required
      default: null
    },
    label: {
      type: String,
      required: true
    },
    hint: {
      type: String,
      required: false,
      default: ``
    },
    formstate: {
      type: Object,
      required: false, // TODO: make this required
      default: null
    }
  },
  computed: {
    errorFieldName() {
      if (!this.formstate) {
        return null;
      }

      if (this.formstate.$error[this.name]) {
        return this.name;
      }

      // TODO: make use of these sub-fields (in range / dimensions / etc. input components)
      const subFieldNames = Object.keys(this.formstate).filter(
        name => name.startsWith(this.name)
      );

      for (const name of subFieldNames) {
        if (this.formstate.$error[name]) {
          return name;
        }
      }

      return this.name;
    },
    fieldState() {
      if (!this.formstate || !this.formstate[this.errorFieldName]) {
        return {};
      }

      return this.formstate[this.errorFieldName];
    },
    fieldErrors() {
      if (!(`$valid` in this.fieldState) || this.fieldState.$valid) {
        return {};
      }

      return this.fieldState.$error;
    }
  }
};
</script>

