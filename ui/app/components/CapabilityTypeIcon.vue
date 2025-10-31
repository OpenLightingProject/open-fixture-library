<template>
  <!-- Prefer image if a single gobo slot with an image and not a WheelShake -->
  <img
    v-if="imgData"
    :src="imgData.src"
    :title="imgData.title"
    class="icon gobo-icon"
  />
  <OflSvg
    v-else
    v-bind="iconProps"
  />
</template>

<script setup lang="ts">
import Capability from '../../lib/model/Capability.js';

const props = defineProps<{
  capability: InstanceType<typeof Capability>;
}>();

// Decide if we should render an <img> (gobo with image) or fall back to OflSvg
const imgData = computed<null | { src: string; title: string }>(() => {
  const capability = props.capability;
  const wheelSlot = capability.wheelSlot;

  if (capability.type !== 'WheelShake' && wheelSlot !== null && wheelSlot[0] === wheelSlot[1]) {
    const resource = wheelSlot[0].resource;
    if (resource && resource.hasImage) {
      return {
        src: resource.imageDataUrl,
        title: `Capability type: ${capability.type}, slot ${capability.slotNumber[0]} (${wheelSlot[0].name})`,
      };
    }
  }
  return null;
});

// Fallback props for <OflSvg />
const iconProps = computed(() => getIconProperties(props.capability));

const isAnimationGoboSlot = (slot: { type: string }) => slot.type.startsWith('AnimationGobo');
const isAnimationGobo = (capability: any) =>
  isAnimationGoboSlot(capability.wheelSlot[0]) && isAnimationGoboSlot(capability.wheelSlot[1]);

const specialIconFunctions: Record<
  string,
  (capability: any, iconProperties: any) => void
> = {
  ShutterStrobe(capability, iconProperties) {
    if (capability.shutterEffect === 'Closed' || capability.shutterEffect === 'Open') {
      iconProperties.type = 'color-circle';
      iconProperties.colors = [capability.shutterEffect === 'Closed' ? '#000000' : '#ffffff'];
      delete iconProperties.name;
    } else {
      iconProperties.name = 'Strobe';
    }
  },
  Intensity(_capability, iconProperties) {
    iconProperties.name = 'dimmer';
  },
  ColorIntensity(_capability, iconProperties) {
    iconProperties.name = 'dimmer';
  },
  ColorPreset(_capability, iconProperties) {
    iconProperties.name = 'color-changer';
  },
  PanContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = 'speed-stop';
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = 'pan-continuous-cw';
    } else if (capability.speed[0].number < 0 || capability.speed[1].number < 0) {
      iconProperties.name = 'pan-continuous-ccw';
    }
  },
  TiltContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = 'speed-stop';
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = 'tilt-continuous-cw';
    } else if (capability.speed[0].number < 0 || capability.speed[1].number < 0) {
      iconProperties.name = 'tilt-continuous-ccw';
    }
  },
  WheelSlot(capability, iconProperties) {
    if (isAnimationGobo(capability)) {
      iconProperties.name = 'animation-gobo';
    } else if (capability.wheelSlot[0] === capability.wheelSlot[1] && capability.wheelSlot[0].type !== 'Split') {
      iconProperties.name = capability.wheelSlot[0].type === 'Color' ? 'color-changer' : capability.wheelSlot[0].type;
      iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
    } else {
      iconProperties.name = undefined;
    }
  },
  WheelShake(capability, iconProperties) {
    if (capability.wheelSlot && isAnimationGobo(capability)) {
      iconProperties.name = 'animation-gobo';
    } else if (capability.wheelSlot && capability.wheelSlot[0] !== capability.wheelSlot[1]) {
      iconProperties.name = undefined;
    } else {
      iconProperties.name = capability.isShaking === 'slot' ? 'slot-shake' : 'wheel-shake';

      if (capability.wheelSlot) {
        iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
      }
    }
  },
  IrisEffect(_capability, iconProperties) {
    iconProperties.name = 'Iris';
  },
  FrostEffect(_capability, iconProperties) {
    iconProperties.name = 'Frost';
  },
  Fog(capability, iconProperties) {
    specialIconFunctions.FogType(capability, iconProperties);
  },
  FogOutput(_capability, iconProperties) {
    iconProperties.name = 'smoke';
  },
  FogType(capability, iconProperties) {
    iconProperties.name = capability.fogType === 'Haze' ? 'hazer' : 'smoke';
  },
  Speed(capability, iconProperties) {
    if (!capability.speed) {
      iconProperties.name = 'speed';
    } else if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = 'speed-stop';
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = 'speed-forward';
    } else {
      iconProperties.name = 'speed-reverse';
    }
  },
  Rotation(capability, iconProperties) {
    if (capability.speed) {
      specialIconFunctions.RotationSpeed(capability, iconProperties);
    } else {
      iconProperties.name = 'rotation-angle';
    }
  },
  RotationSpeed(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = 'speed-stop';
    } else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = 'rotation-cw';
    } else {
      iconProperties.name = 'rotation-ccw';
    }
  },
  Generic(_capability, iconProperties) {
    iconProperties.name = 'other';
  },
};

/**
 * @param capability The capability to get an icon for.
 * @returns Object containing the props to pass to <OflSvg />
 */
function getIconProperties(capability: any) {
  if (capability.colors !== null) {
    return {
      type: 'color-circle',
      colors: capability.colors.allColors,
      title: `Capability type: ${capability.type}, ${getColorDescription(capability)}`,
    };
  }

  const iconProperties: { type: string; name?: string; title: string; colors?: string[] } = {
    type: 'fixture',
    name: capability.type,
    title: `Capability type: ${capability.type}`,
  };

  if (capability.isSoundControlled) {
    iconProperties.name = 'sound-controlled';
    iconProperties.title += ' (sound-controlled)';
  } else if (capability.type in specialIconFunctions) {
    specialIconFunctions[capability.type](capability, iconProperties);
  } else if (/(?:Speed|Duration|Time)$/.test(capability.type)) {
    specialIconFunctions.Speed(capability, iconProperties);
  } else if (capability.type.endsWith('Rotation')) {
    specialIconFunctions.Rotation(capability, iconProperties);
  }

  return iconProperties;
}

/**
 * @param capability The capability model object.
 * @returns A string describing the colors of this capability, or null if it has no colors.
 */
function getColorDescription(capability: any): string | null {
  if (capability.colors === null) {
    return null;
  }

  if (capability.colors.isStep) {
    const plural = capability.colors.allColors.length > 1 ? 'colors' : 'color';
    const allColors = capability.colors.allColors.join(', ');
    return `${plural}: ${allColors}`;
  }

  const startColors = capability.colors.startColors.join(', ');
  const endColors = capability.colors.endColors.join(', ');
  return `transition from ${startColors} to ${endColors}`;
}
</script>
