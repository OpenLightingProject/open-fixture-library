<template>
  <section class="fixture-mode card">

    <a
      v-if="fixture.modes.length > 1"
      href="#remove-mode"
      class="close"
      @click.prevent="$emit(`remove`)">
      Remove mode
      <app-svg name="close" />
    </a>

    <h2>Mode #{{ index + 1 }}</h2>

    <section class="name">
      <app-simple-label label="Name">
        <app-property-input
          type="text"
          v-model="mode.name"
          :schema-property="properties.mode.name.allOf[1]"
          :required="true"
          hint="e.g. Extended"
          title="The name must not contain the word 'mode'."
          ref="firstInput" />
      </app-simple-label>
    </section>

    <section class="shortName">
      <app-simple-label label="Unique short name">
        <app-property-input
          type="text"
          v-model="mode.shortName"
          :schema-property="properties.mode.shortName.allOf[1]"
          :required="true"
          hint="e.g. ext; defaults to name"
          title="The short name must not contain the word 'mode'." />
      </app-simple-label>
    </section>

    <section v-if="fixture.rdmModelId !== null" class="rdmPersonalityIndex">
      <app-simple-label label="RDM personality index">
        <app-property-input
          type="number"
          v-model="mode.rdmPersonalityIndex"
          :schema-property="properties.mode.rdmPersonalityIndex" />
      </app-simple-label>
    </section>


    <h3>Physical override</h3>

    <label class="validate-group">
      <input
        type="checkbox"
        class="enable-physical-override"
        v-model="mode.enablePhysicalOverride">
      Override fixture's physical data in this mode
      <span class="error-message" hidden />
    </label>

    <section class="physical-override">
      <app-editor-physical
        v-if="mode.enablePhysicalOverride"
        v-model="mode.physical" />
    </section>


    <h3>DMX channels</h3>

    <div class="validate-group mode-channels">
      <draggable v-model="mode.channels" :options="dragOptions">
        <transition-group class="mode-channels" name="mode-channels" tag="ol">
          <li
            v-for="channelUuid in mode.channels"
            :key="channelUuid"
            :data-channel-uuid="channelUuid">

            <span class="channel-name">{{ getChannelName(channelUuid) }}</span>

            <code v-if="!isChannelNameUnique(channelUuid)" class="channel-uuid">{{ channelUuid }}</code>

            <a
              href="#remove"
              title="Remove channel"
              @click.prevent="removeChannel(channelUuid)">
              <app-svg name="close" />
            </a>

            <a
              v-if="!isFineChannel(channelUuid)"
              href="#channel-editor"
              title="Edit channel"
              @click.prevent="editChannel(channelUuid)">
              <app-svg name="pencil" />
            </a>

            <a
              href="#move"
              title="Drag to change channel order"
              class="drag-handle"
              @click.prevent>
              <app-svg name="move" />
            </a>

          </li>
        </transition-group>
      </draggable>
      <span class="error-message" hidden />
    </div>

    <a href="#add-channel" class="button primary" @click.prevent="addChannel">add channel</a>

  </section>
</template>

<style lang="scss">
/* not scoped because child components would not be covered then */
.fixture-mode {
  & .label {
    display: block;
  }

  & .value {
    max-width: none;
  }
}
</style>


<script>
import schemaProperties from '~~/lib/schema-properties.js';

import svgVue from '~/components/svg.vue';
import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputVue from '~/components/property-input.vue';
import editorPhysicalVue from '~/components/editor-physical.vue';

export default {
  components: {
    'app-svg': svgVue,
    'app-simple-label': simpleLabelVue,
    'app-property-input': propertyInputVue,
    'app-editor-physical': editorPhysicalVue
  },
  props: {
    'value': {
      type: Object,
      required: true
    },
    'index': {
      type: Number,
      required: true
    },
    'fixture': {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      properties: schemaProperties,
      dragOptions: {
        handle: `.drag-handle`,
        group: {
          name: `mode`,
          pull: `clone`,
          put(to, from, dragElem, event) {
            if (from === to) {
              return false;
            }

            const channelUuid = dragElem.getAttribute(`data-channel-uuid`);
            const channelAlreadyExists = to.el.querySelectorAll(`[data-channel-uuid="${channelUuid}"]`).length > 0;

            return !channelAlreadyExists;
          },
          revertClone: true
        }
      }
    };
  },
  computed: {
    mode() {
      return this.value;
    }
  },
  mounted() {
    // TODO: if (Vue._oflRestoreComplete) {
    this.$refs.firstInput.focus();
  },
  methods: {
    getChannelName(channelUuid) {
      return this.$parent.getChannelName(channelUuid);
    },
    editChannel(channelUuid) {
      // TODO: handle this request on the other side
      this.$emit(`open-channel-editor`, {
        modeId: this.mode.uuid,
        editMode: `edit-?`,
        uuid: channelUuid
      });
    },
    addChannel: function() {
      this.$emit(`open-channel-editor`, {
        modeId: this.mode.uuid,
        editMode: `add-existing`
      });
    },
    isChannelNameUnique(channelUuid) {
      return this.$parent.isChannelNameUnique(channelUuid);
    },
    isFineChannel(channelUuid) {
      return `coarseChannelId` in this.fixture.availableChannels[channelUuid];
    },
    removeChannel(channelUuid) {
      const channel = this.fixture.availableChannels[channelUuid];

      // first remove the finer channels if any
      let coarseChannelId = channelUuid;
      let fineness = 0;
      if (this.isFineChannel(channelUuid)) {
        coarseChannelId = channel.coarseChannelId;
        fineness = channel.fineness;
      }

      for (const chId of Object.keys(this.fixture.availableChannels)) {
        const ch = this.fixture.availableChannels[chId];
        if (`coarseChannelId` in ch && ch.coarseChannelId === coarseChannelId
          && ch.fineness > fineness) {
          this.$parent.removeChannel(ch.uuid, this.mode.uuid);
        }
      }

      // then remove the channel itself
      this.$parent.removeChannel(channelUuid, this.mode.uuid);
    }
  }
};
</script>
