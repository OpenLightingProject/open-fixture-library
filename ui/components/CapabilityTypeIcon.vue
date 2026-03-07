<template>
  <img
    v-if="showImage"
    :src="imageSrc"
    :title="imageTitle"
    class="icon gobo-icon">
  <OflSvg v-else v-bind="iconProperties" />
</template>

<script setup lang="ts">
import Capability from '~~/lib/model/Capability.js';

interface Props {
  capability: Capability;
}

const props = defineProps<Props>();

const isAnimationGoboSlot = (slot: { type: string }) => slot.type.startsWith('AnimationGobo');
const isAnimationGoboFunc = (capability: Capability) => {
  const wheelSlot = capability.wheelSlot;
  return isAnimationGoboSlot(ws[0]) && isAnimationGoboSlot(ws[1]);
};

const specialIconFunctions: Record<string, (capability: Capability, iconProperties: { type: string; name?: string; title: string; colors?: string[] }) => void> = {
  ShutterStrobe(capability, iconProperties) {
    if (capability.shutterEffect === 'Closed' || capability.shutterEffect === 'Open') {
      iconProperties.type = 'color-circle';
      iconProperties.colors = [capability.shutterEffect === 'Closed' ? '#000000' : '#ffffff'];
      delete iconProperties.name;
    }
    else {
      iconProperties.name = 'Strobe';
    }
  },
  Intensity(_capability, iconProperties) { iconProperties.name = 'dimmer'; },
  ColorIntensity(_capability, iconProperties) { iconProperties.name = 'dimmer'; },
  ColorPreset(_capability, iconProperties) { iconProperties.name = 'color-changer'; },
  PanContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) iconProperties.name = 'speed-stop';
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) iconProperties.name = 'pan-continuous-cw';
    else iconProperties.name = 'pan-continuous-ccw';
  },
  TiltContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) iconProperties.name = 'speed-stop';
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) iconProperties.name = 'tilt-continuous-cw';
    else iconProperties.name = 'tilt-continuous-ccw';
  },
  WheelSlot(capability, iconProperties) {
    if (isAnimationGoboFunc(capability)) iconProperties.name = 'animation-gobo';
    else if (capability.wheelSlot[0] === capability.wheelSlot[1] && capability.wheelSlot[0].type !== 'Split') {
      iconProperties.name = capability.wheelSlot[0].type === 'Color' ? 'color-changer' : capability.wheelSlot[0].type;
      iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
    }
    else { iconProperties.name = undefined; }
  },
  WheelShake(capability, iconProperties) {
    if (capability.wheelSlot && isAnimationGoboFunc(capability)) iconProperties.name = 'animation-gobo';
    else if (capability.wheelSlot && capability.wheelSlot[0] !== capability.wheelSlot[1]) iconProperties.name = undefined;
    else {
      iconProperties.name = capability.isShaking === 'slot' ? 'slot-shake' : 'wheel-shake';
      if (capability.wheelSlot) iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
    }
  },
  IrisEffect(_capability, iconProperties) { iconProperties.name = 'Iris'; },
  FrostEffect(_capability, iconProperties) { iconProperties.name = 'Frost'; },
  Fog(capability, iconProperties) { specialIconFunctions.FogType(capability, iconProperties); },
  FogOutput(_capability, iconProperties) { iconProperties.name = 'smoke'; },
  FogType(capability, iconProperties) { iconProperties.name = capability.fogType === 'Haze' ? 'hazer' : 'smoke'; },
  Speed(capability, iconProperties) {
    if (!capability.speed) iconProperties.name = 'speed';
    else if (capability.speed[0].number === 0 && capability.speed[1].number === 0) iconProperties.name = 'speed-stop';
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) iconProperties.name = 'speed-forward';
    else iconProperties.name = 'speed-reverse';
  },
  Rotation(capability, iconProperties) {
    if (capability.speed) specialIconFunctions.RotationSpeed(capability, iconProperties);
    else iconProperties.name = 'rotation-angle';
  },
  RotationSpeed(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) iconProperties.name = 'speed-stop';
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) iconProperties.name = 'rotation-cw';
    else iconProperties.name = 'rotation-ccw';
  },
  Generic(_capability, iconProperties) { iconProperties.name = 'other'; },
};

function getIconProperties(capability: Capability): { type: string; name?: string; title: string; colors?: string[] } {
  if (capability.colors !== null) {
    return { type: 'color-circle', colors: capability.colors.allColors, title: `Capability type: ${capability.type}, ${getColorDescription(capability)}` };
  }
  const iconProperties: { type: string; name?: string; title: string } = { type: 'fixture', name: capability.type, title: `Capability type: ${capability.type}` };
  if (capability.isSoundControlled) { iconProperties.name = 'sound-controlled'; iconProperties.title += ' (sound-controlled)'; }
  else if (capability.type in specialIconFunctions) specialIconFunctions[capability.type](capability, iconProperties);
  else if (/(?:Speed|Duration|Time)$/.test(capability.type)) specialIconFunctions.Speed(capability, iconProperties);
  else if (capability.type.endsWith('Rotation')) specialIconFunctions.Rotation(capability, iconProperties);
  return iconProperties;
}

function getColorDescription(capability: Capability): string | null {
  if (capability.colors === null) return null;
  if (capability.colors.isStep) return `${capability.colors.allColors.length > 1 ? 'colors' : 'color'}: ${capability.colors.allColors.join(', ')}`;
  return `transition from ${capability.colors.startColors.join(', ')} to ${capability.colors.endColors.join(', ')}`;
}

const capability = props.capability;
const wheelSlot = capability.wheelSlot;

const showImage = computed(() => capability.type !== 'WheelShake' && wheelSlot !== null && wheelSlot[0] === wheelSlot[1] && wheelSlot[0].resource?.hasImage);
const imageSrc = computed(() => wheelSlot && wheelSlot[0] === wheelSlot[1] ? wheelSlot[0].resource?.imageDataUrl : '');
const imageTitle = computed(() => wheelSlot && wheelSlot[0] === wheelSlot[1] ? `Capability type: ${capability.type}, slot ${capability.slotNumber[0]} (${wheelSlot[0].name})` : '');
const iconProperties = computed(() => getIconProperties(capability));
</script>
