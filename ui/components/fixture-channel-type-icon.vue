<script>
import svg from '~/components/svg.vue';

import AbstractChannel from '~~/lib/model/AbstractChannel.mjs';
import FineChannel from '~~/lib/model/FineChannel.mjs';
import NullChannel from '~~/lib/model/NullChannel.mjs';
import SwitchingChannel from '~~/lib/model/SwitchingChannel.mjs';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    channel: {
      type: AbstractChannel,
      required: true
    }
  },
  methods: {
    /**
     * @param {!AbstractChannel} channel The channel to get an icon for.
     * @returns {!object} Object containing the props to pass to <app-svg />
     */
    getIconProps(channel) {
      if (channel instanceof NullChannel) {
        return {
          type: `channel-type`,
          name: `NoFunction`
        };
      }

      if (channel instanceof FineChannel) {
        return this.getIconProps(channel.coarseChannel);
      }

      if (channel instanceof SwitchingChannel) {
        return {
          type: `channel-type`,
          name: `Switching Channel`
        };
      }

      if (channel.type === `Single Color`) {
        return {
          type: `color-circle`,
          name: channel.color
        };
      }

      return {
        type: `channel-type`,
        name: channel.type
      };
    }
  },
  render(createElement) {
    return createElement(
      `app-svg`,
      {
        props: this.getIconProps(this.channel)
      },
      ``
    );
  }
};
</script>
