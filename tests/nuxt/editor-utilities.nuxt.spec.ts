import { describe, expect, it } from 'vitest';
import { computed, reactive } from 'vue';
import {
  colorsHexStringToArray,
  getEmptyCapability,
  getEmptyChannel,
  getSanitizedChannel,
  isCapabilityChanged,
  isChannelChanged,
  toPlainData,
} from '~/assets/scripts/editor-utilities.js';

describe('toPlainData', () => {
  it('clones nested reactive editor state into plain objects', () => {
    const channel = reactive(getEmptyChannel());
    channel.name = 'Intensity';
    channel.capabilities[0].type = 'Intensity';
    channel.capabilities[0].typeData.brightness = 'bright';

    const clone = toPlainData(channel) as ReturnType<typeof getEmptyChannel>;

    expect(clone).toEqual(channel);
    expect(clone).not.toBe(channel);
    expect(clone.capabilities[0]).not.toBe(channel.capabilities[0]);
    expect(clone.capabilities[0].typeData).not.toBe(channel.capabilities[0].typeData);

    clone.capabilities[0].type = 'ColorIntensity';
    expect(channel.capabilities[0].type).toBe('Intensity');
  });

  it('produces data that structuredClone can handle', () => {
    const fixture = reactive({
      name: 'Reactive Fixture',
      modes: [{ uuid: 'mode-1', channels: ['channel-1'] }],
    });

    const clone = toPlainData(fixture);

    expect(() => structuredClone(clone)).not.toThrow();
    expect(structuredClone(clone)).toEqual(fixture);
  });

  it('tracks reactive property changes when called inside a computed', () => {
    const state = reactive({ typeData: { slotNumberStart: null as number | null } });
    const cloned = computed(() => toPlainData(state.typeData));

    expect(cloned.value).toEqual({ slotNumberStart: null });

    state.typeData.slotNumberStart = 1;

    expect(cloned.value).toEqual({ slotNumberStart: 1 });
  });
});

describe('getSanitizedChannel', () => {
  it('removes channel-dialog-only properties without mutating the input', () => {
    const channel = reactive(getEmptyChannel());
    channel.name = 'Color';
    channel.editMode = 'edit-all';
    channel.modeId = 'mode-1';
    channel.wizard.show = true;

    const sanitized = getSanitizedChannel(channel);

    expect(sanitized).not.toHaveProperty('editMode');
    expect(sanitized).not.toHaveProperty('modeId');
    expect(sanitized).not.toHaveProperty('wizard');
    expect(sanitized.name).toBe('Color');
    expect(sanitized.uuid).toBe(channel.uuid);

    // The editor object must remain untouched for the open dialog.
    expect(channel.editMode).toBe('edit-all');
    expect(channel.modeId).toBe('mode-1');
    expect(channel.wizard.show).toBe(true);
  });

  it('returns a deep clone that is safe to send over the wire', () => {
    const channel = reactive(getEmptyChannel());
    channel.capabilities[0].type = 'Intensity';

    const sanitized = getSanitizedChannel(channel);
    sanitized.capabilities[0].type = 'ColorIntensity';

    expect(channel.capabilities[0].type).toBe('Intensity');
    expect(() => JSON.stringify(sanitized)).not.toThrow();
  });
});

describe('isChannelChanged / isCapabilityChanged', () => {
  it('ignores properties that only belong to the dialog', () => {
    expect(isChannelChanged({
      uuid: 'channel-1',
      editMode: 'create',
      modeId: 'mode-1',
      name: '',
    })).toBe(false);
    expect(isCapabilityChanged(reactive(getEmptyCapability()))).toBe(false);
  });

  it('detects edited channel and capability values', () => {
    const channel = reactive(getEmptyChannel());
    channel.name = 'Intensity';
    expect(isChannelChanged(channel)).toBe(true);

    const capability = reactive(getEmptyCapability());
    capability.type = 'Intensity';
    expect(isCapabilityChanged(capability)).toBe(true);
  });
});

describe('colorsHexStringToArray', () => {
  it('normalizes a comma-separated hex list', () => {
    expect(colorsHexStringToArray(' #FF0000, #00ff00 ')).toEqual(['#ff0000', '#00ff00']);
  });

  it('returns null for empty or invalid input', () => {
    expect(colorsHexStringToArray(null)).toBeNull();
    expect(colorsHexStringToArray('')).toBeNull();
    expect(colorsHexStringToArray('#abc, red')).toBeNull();
  });
});
