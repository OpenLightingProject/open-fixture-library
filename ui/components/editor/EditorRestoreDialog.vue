<template>
  <A11yDialog
    id="restore"
    :cancellable="false"
    :shown="restoredData !== null"
    title="Auto-saved fixture data found">

    Do you want to restore the data (auto-saved <time>{{ restoredDate }}</time>) to continue to create the fixture?

    <div class="button-bar right">
      <button
        type="submit"
        class="discard secondary"
        @click.prevent="discardRestored()">
        Discard data
      </button>
      <button
        type="submit"
        class="restore primary"
        @click.prevent="applyRestored()">
        Restore to continue work
      </button>
    </div>

  </A11yDialog>
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
  getSanitizedChannel,
  clone,
} from '../../assets/scripts/editor-utils.js';

import A11yDialog from '../A11yDialog.vue';

export default {
  components: {
    A11yDialog,
  },
  model: {
    prop: `restoredData`,
  },
  props: {
    restoredData: {
      type: Object,
      required: false,
      default: null,
    },
  },
  computed: {
    restoredDate() {
      if (this.restoredData === null) {
        return null;
      }
      return (new Date(this.restoredData.timestamp)).toISOString().replace(/\..*$/, ``).replace(`T`, `, `);
    },
  },
  methods: {
    discardRestored() {
      // put all items except the last one back
      localStorage.setItem(`autoSave`, JSON.stringify(JSON.parse(localStorage.getItem(`autoSave`)).slice(0, -1)));

      this.$emit(`input`, null);
      this.$emit(`restore-complete`);
    },

    async applyRestored() {
      const restoredData = clone(this.restoredData);

      // closes dialog
      this.$emit(`input`, null);

      // restoring could open another dialog -> wait for DOM being up-to-date
      await this.$nextTick();

      this.$parent.fixture = getRestoredFixture(restoredData.fixture);
      this.$parent.channel = getRestoredChannel(restoredData.channel, true);

      await this.$nextTick();
      this.$emit(`restore-complete`);
    },
  },
};

/**
 * @param {Object} fixture The fixture object from the saved user data.
 * @returns {Object} A fixture editor fixture object with all required properties.
 */
function getRestoredFixture(fixture) {
  const restoredFixture = Object.assign(getEmptyFixture(), fixture);

  for (const [index, link] of restoredFixture.links.entries()) {
    restoredFixture.links[index] = Object.assign(getEmptyLink(), link);
  }

  restoredFixture.physical = Object.assign(getEmptyPhysical(), restoredFixture.physical);

  for (const [index, mode] of restoredFixture.modes.entries()) {
    restoredFixture.modes[index] = Object.assign(getEmptyMode(), mode);
    restoredFixture.modes[index].physical = Object.assign(getEmptyPhysical(), mode.physical);
  }

  for (const channelKey of Object.keys(restoredFixture.availableChannels)) {
    restoredFixture.availableChannels[channelKey] = getRestoredChannel(restoredFixture.availableChannels[channelKey], false);
  }

  return restoredFixture;
}

/**
 * @param {Object} channel The channel object from the saved user data.
 * @param {booelan} isChannelDialog True if the channel object is used in the channel dialog and should therefore not be sanitized.
 * @returns {Object} A fixture editor channel object with all required properties.
 */
function getRestoredChannel(channel, isChannelDialog) {
  if (`coarseChannelId` in channel) {
    return Object.assign(getEmptyFineChannel(), channel);
  }

  let emptyChannel = getEmptyChannel();
  if (!isChannelDialog) {
    emptyChannel = getSanitizedChannel(emptyChannel);
  }

  const restoredChannel = Object.assign(emptyChannel, channel);

  for (const [index, capability] of restoredChannel.capabilities.entries()) {
    restoredChannel.capabilities[index] = Object.assign(
      getEmptyCapability(),
      capability,
    );
  }

  if (isChannelDialog) {
    restoredChannel.wizard.templateCapability = Object.assign(
      getEmptyCapability(),
      restoredChannel.wizard.templateCapability,
    );
  }

  return restoredChannel;
}
</script>
