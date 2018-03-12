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

    <app-simple-label :formstate="formstate" :name="`mode-${index}-name`" label="Name">
      <app-property-input-text
        ref="firstInput"
        :name="`mode-${index}-name`"
        v-model="mode.name"
        :schema-property="properties.mode.name.allOf[1]"
        :required="true"
        hint="e.g. Extended"
        title="The name must not contain the word 'mode'." />
    </app-simple-label>

    <app-simple-label :formstate="formstate" :name="`mode-${index}-shortName`" label="Unique short name">
      <app-property-input-text
        :name="`mode-${index}-shortName`"
        v-model="mode.shortName"
        :schema-property="properties.mode.shortName.allOf[1]"
        hint="e.g. ext; defaults to name"
        title="The short name must not contain the word 'mode'." />
    </app-simple-label>

    <app-simple-label
      v-if="fixture.rdmModelId !== null"
      :formstate="formstate"
      :name="`mode-${index}-rdmPersonalityIndex`"
      label="RDM personality index">
      <app-property-input-number
        v-model="mode.rdmPersonalityIndex"
        :name="`mode-${index}-rdmPersonalityIndex`"
        :schema-property="properties.mode.rdmPersonalityIndex" />
    </app-simple-label>


    <h3>Physical override</h3>

    <label>
      <input
        v-model="mode.enablePhysicalOverride"
        type="checkbox"
        class="enable-physical-override">
      Override fixture's physical data in this mode
    </label>

    <section class="physical-override">
      <app-editor-physical
        v-if="mode.enablePhysicalOverride"
        v-model="mode.physical"
        :formstate="formstate"
        :name-prefix="`mode-${index}`" />
    </section>


    <h3>DMX channels</h3>

    <validate
      :state="formstate"
      :custom="{'no-empty-channel-list': channelListNotEmpty}"
      tag="div"
      class="validate-group mode-channels">
      <draggable v-model="mode.channels" :options="dragOptions" :name="`mode-${index}-channels`">
        <transition-group class="mode-channels" tag="ol">
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
      <field-messages
        :state="formstate"
        :name="`mode-${index}-channels`"
        show="$submitted"
        tag="div"
        class="error-message">
        <div slot="no-empty-channel-list">A mode must contain at least one channel.</div>
      </field-messages>
    </validate>

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

<style lang="scss" scoped>
ol.mode-channels {
  margin: 0 0 1ex;
  padding-top: 4px;
  padding-bottom: 4px;
}
.mode-channels a {
  opacity: 0;
  float: right;
  width: 1.4em;
  height: 1.4em;
  padding: 0.3em;
  transition: opacity 0.1s;
}
.mode-channels > li:hover > a,
.mode-channels a:focus {
  opacity: 1;
}

.mode-channels .drag-handle {
  cursor: move;
}
</style>


<script>
import schemaProperties from '~~/lib/schema-properties.js';

import svgVue from '~/components/svg.vue';
import simpleLabelVue from '~/components/simple-label.vue';
import propertyInputNumberVue from '~/components/property-input-number.vue';
import propertyInputTextVue from '~/components/property-input-text.vue';
import editorPhysicalVue from '~/components/editor-physical.vue';

export default {
  components: {
    'app-svg': svgVue,
    'app-simple-label': simpleLabelVue,
    'app-property-input-number': propertyInputNumberVue,
    'app-property-input-text': propertyInputTextVue,
    'app-editor-physical': editorPhysicalVue
  },
  model: {
    prop: `mode`
  },
  props: {
    mode: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    fixture: {
      type: Object,
      required: true
    },
    formstate: {
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
    fixtureEditor() {
      const vueForm = this.$parent;
      return vueForm.$parent;
    },
    channelListNotEmpty() {
      return this.mode.channels.length > 0;
    }
  },
  mounted() {
    // TODO: if (Vue._oflRestoreComplete) {
    this.$refs.firstInput.focus();
  },
  methods: {
    getChannelName(channelUuid) {
      return this.fixtureEditor.getChannelName(channelUuid);
    },
    editChannel(channelUuid) {
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
      return this.fixtureEditor.isChannelNameUnique(channelUuid);
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
          this.fixtureEditor.removeChannel(ch.uuid, this.mode.uuid);
        }
      }

      // then remove the channel itself
      this.fixtureEditor.removeChannel(channelUuid, this.mode.uuid);
    }
  }
};
</script>
