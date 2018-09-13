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
import {
  getEmptyFixture,
  getEmptyLink,
  getEmptyPhysical,
  getEmptyMode,
  getEmptyChannel,
  getEmptyFineChannel,
  getEmptyCapability,
  getSanitizedChannel
} from '~/assets/scripts/editor-utils.mjs';

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
      // closes dialog
      this.$emit(`input`, null);

      // restoring could open another dialog -> wait for DOM being up-to-date
      this.$nextTick(() => {
        this.$parent.fixture = getRestoredFixture(this.restoredData);
        this.$parent.channel = getRestoredChannel(this.restoredData, true);

        this.$nextTick(() => {
          this.$emit(`restore-complete`);
        });
      });
    }
  }
};

/**
 * @param {object} restoredData The saved user data.
 * @returns {object} A fixture editor fixture object with all required properties.
 */
function getRestoredFixture(restoredData) {
  const fixture = Object.assign(getEmptyFixture(), restoredData.fixture);

  fixture.links.forEach((link, index) => {
    fixture.links[index] = Object.assign(getEmptyLink(), link);
  });

  fixture.physical = Object.assign(getEmptyPhysical(), fixture.physical);

  fixture.modes.forEach((mode, index) => {
    fixture.modes[index] = Object.assign(getEmptyMode(), mode);
    fixture.modes[index].physical = Object.assign(getEmptyPhysical(), mode.physical);
  });

  Object.keys(fixture.availableChannels).forEach(chKey => {
    fixture.availableChannels[chKey] = getRestoredChannel(fixture.availableChannels[chKey], false);
  });

  return fixture;
}

/**
 * @param {object} restoredData The saved user data.
 * @param {booelan} isChannelDialog True if the channel object is used in the channel dialog and should therefore not be sanitized.
 * @returns {object} A fixture editor channel object with all required properties.
 */
function getRestoredChannel(restoredData, isChannelDialog) {
  if (`coarseChannelId` in restoredData.channel) {
    return Object.assign(getEmptyFineChannel(), restoredData.channel);
  }

  let emptyChannel = getEmptyChannel();
  if (!isChannelDialog) {
    emptyChannel = getSanitizedChannel(emptyChannel);
  }

  const restoredChannel = Object.assign(emptyChannel, restoredData.channel);

  restoredChannel.capabilities.forEach((cap, index) => {
    restoredChannel.capabilities[index] = Object.assign(
      getEmptyCapability(),
      cap
    );
  });

  if (isChannelDialog) {
    restoredChannel.wizard.templateCapability = Object.assign(
      getEmptyCapability(),
      restoredChannel.wizard.templateCapability
    );
  }

  return restoredChannel;
}
</script>
