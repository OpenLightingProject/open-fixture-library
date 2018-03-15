<template>
  <app-a11y-dialog
    id="restore"
    :cancellable="false"
    :shown="restoredData !== null"
    title="Auto-saved fixture data found">

    Do you want to restore the data (auto-saved <time>{{ restoredDate }}</time>) to continue to create the fixture?

    <div class="button-bar right">
      <button class="discard secondary" @click.prevent="discardRestored">Discard data</button>
      <button class="restore primary" @click.prevent="applyRestored">Restore to continue work</button>
    </div>

  </app-a11y-dialog>
</template>

<script>
import a11yDialogVue from '~/components/a11y-dialog.vue';

export default {
  components: {
    'app-a11y-dialog': a11yDialogVue
  },
  model: {
    prop: `restoredData`
  },
  props: {
    restoredData: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    restoredDate() {
      if (this.restoredData === null) {
        return null;
      }
      return (new Date(this.restoredData.timestamp)).toISOString().replace(/\..*$/, ``).replace(`T`, `, `);
    }
  },
  methods: {
    discardRestored() {
      // put all items except the last one back
      localStorage.setItem(`autoSave`, JSON.stringify(JSON.parse(localStorage.getItem(`autoSave`)).slice(0, -1)));

      this.$emit(`input`, null);
      this.$emit(`restore-complete`);
    },

    applyRestored() {
      const restoredData = this.restoredData;

      // closes dialog
      this.$emit(`input`, null);

      // restoring could open another dialog -> wait for DOM being up-to-date
      this.$nextTick(() => {
        this.$parent.fixture = restoredData.fixture;
        this.$parent.channel = restoredData.channel;

        this.$nextTick(() => {
          this.$emit(`restore-complete`);
        });
      });
    }
  }
};
</script>
