<template>
  <section class="help-wanted" @click="$emit(`update:helpWantedContext`, context)">
    <app-svg name="comment-question-outline" title="Help wanted!" />
    <span v-html="text" />
  </section>
</template>

<style lang="scss" scoped>
@import '~assets/styles/vars.scss';

.help-wanted {
  position: relative;
  margin: 1ex 0;
  padding: 0.4em 0.5em 0.4em calc(1.4em + 2*0.5em);
  background: $yellow-300;
  border-radius: 2px;
  min-height: 32px;
  cursor: pointer;

  .icon {
    margin-left: calc(-1.4em - 0.5em);
    margin-right: 0.5em;
  }
}
</style>


<script>
import svg from '~/components/svg.vue';

import Fixture from '~~/lib/model/Fixture.mjs';
import Capability from '~~/lib/model/Capability.mjs';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    context: {
      type: [Fixture, Capability],
      required: true
    }
  },
  computed: {
    text() {
      if (this.context instanceof Capability) {
        return this.context.helpWanted;
      }

      let text = `<strong>You can help to improve this fixture definition!</strong> `;
      text += this.context.helpWanted !== null ? this.context.helpWanted : `Specific questions are included in the capabilities below.`;
      return text;
    }
  }
};
</script>
