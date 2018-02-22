<template>
  <section :class="name">
    <template v-if="formstate">
      <validate tag="label" :state="formstate">
        <div class="label" v-html="label" />
        <div class="value">

          <slot />

          <field-messages
            :name="name"
            :state="formstate"
            show="$touched || $submitted"
            class="error-message">
            <div slot="required">Please fill out this field.</div>
            <div slot="number">Please enter a number.</div>
            <div slot="email">Please enter an email address.</div>
            <div slot="url">Please enter a URL.</div>

            <!-- custom validators -->
            <div slot="complete-range">Please fill out both start and end of the range.</div>
            <div slot="valid-range">The start value of a range must not be greater than its end.</div>
            <div slot="categories-not-empty">Please select at least one category.</div>
          </field-messages>

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
  }
};
</script>

