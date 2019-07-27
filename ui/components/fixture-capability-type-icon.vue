<template>
  <app-svg v-bind="iconProps" />
</template>

<script>
import svg from '~/components/svg.vue';

import Capability from '~~/lib/model/Capability.mjs';

export default {
  components: {
    'app-svg': svg
  },
  props: {
    capability: {
      type: Capability,
      required: true
    }
  },
  computed: {
    iconProps() {
      return getIconProps(this.capability);
    }
  }
};


const specialIconFunctions = {
  ShutterStrobe(cap, iconProps) {
    if (cap.shutterEffect === `Closed` || cap.shutterEffect === `Open`) {
      iconProps.type = `color-circle`;
      iconProps.colors = [cap.shutterEffect === `Closed` ? `#000000` : `#ffffff`];
      delete iconProps.name;
    }
    else {
      iconProps.name = `Strobe`;
    }
  },
  ColorIntensity(cap, iconProps) {
    iconProps.name = `Intensity`;
  },
  ColorPreset(cap, iconProps) {
    iconProps.name = `Color`;
  },
  PanContinuous(cap, iconProps) {
    if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProps.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProps.name = `pan-continuous-cw`;
    }
    else if (cap.speed[0].number < 0 || cap.speed[1].number < 0) {
      iconProps.name = `pan-continuous-ccw`;
    }
  },
  TiltContinuous(cap, iconProps) {
    if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProps.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProps.name = `tilt-continuous-cw`;
    }
    else if (cap.speed[0].number < 0 || cap.speed[1].number < 0) {
      iconProps.name = `tilt-continuous-ccw`;
    }
  },
  WheelSlot(cap, iconProps) {
    const isAnimationGobo = slot => slot.type.startsWith(`AnimationGobo`);
    if (isAnimationGobo(cap.wheelSlot[0]) && isAnimationGobo(cap.wheelSlot[1])) {
      iconProps.name = `Gobo`;
    }
    else if (cap.wheelSlot[0] === cap.wheelSlot[1] && cap.wheelSlot[0].type !== `Split`) {
      iconProps.name = cap.wheelSlot[0].type;
    }
    else {
      iconProps.name = ``;
    }
  },
  WheelShake(cap, iconProps) {
    iconProps.name = (cap.isShaking === `slot`)
      ? `slot-shake`
      : `wheel-shake`;
  },
  IrisEffect(cap, iconProps) {
    iconProps.name = `Iris`;
  },
  FrostEffect(cap, iconProps) {
    iconProps.name = `Frost`;
  },
  Fog(cap, iconProps) {
    iconProps.name = cap.fogType || `Fog`;
  },
  FogOutput(cap, iconProps) {
    iconProps.name = `Fog`;
  },
  FogType(cap, iconProps) {
    iconProps.name = cap.fogType;
  },
  Speed(cap, iconProps) {
    if (!cap.speed) {
      iconProps.name = `speed`;
    }
    else if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProps.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProps.name = `speed-forward`;
    }
    else {
      iconProps.name = `speed-reverse`;
    }
  },
  Rotation(cap, iconProps) {
    if (cap.speed) {
      specialIconFunctions.RotationSpeed(cap, iconProps);
    }
    else {
      iconProps.name = `rotation-angle`;
    }
  },
  RotationSpeed(cap, iconProps) {
    if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProps.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProps.name = `rotation-cw`;
    }
    else {
      iconProps.name = `rotation-ccw`;
    }
  }
};

/**
 * @param {AbstractChannel} cap The capability to get an icon for.
 * @returns {object} Object containing the props to pass to <app-svg />
 */
function getIconProps(cap) {
  if (cap.colors !== null) {
    return {
      type: `color-circle`,
      colors: cap.colors.allColors,
      title: `Capability type: ${cap.type}, ${getColorDescription(cap)}`
    };
  }

  const iconProps = {
    type: `capability`,
    name: cap.type,
    title: `Capability type: ${cap.type}`
  };

  if (cap.isSoundControlled) {
    iconProps.name = `sound-controlled`;
    iconProps.title += ` (sound-controlled)`;
  }
  else if (cap.type in specialIconFunctions) {
    specialIconFunctions[cap.type](cap, iconProps);
  }
  else if (/(?:Speed|Duration|Time)$/.test(cap.type)) {
    specialIconFunctions.Speed(cap, iconProps);
  }
  else if (/Rotation$/.test(cap.type)) {
    specialIconFunctions.Rotation(cap, iconProps);
  }

  return iconProps;
}

/**
 * @param {Capability} capability The capability model object.
 * @returns {string|null} A string describing the colors of this capability, or null if it has no colors.
 */
function getColorDescription(capability) {
  if (capability.colors === null) {
    return null;
  }

  if (capability.colors.isStep) {
    const plural = capability.colors.allColors.length > 1 ? `colors` : `color`;
    return `${plural}: ${capability.colors.allColors.join(`, `)}`;
  }

  return `transition from ${capability.colors.startColors.join(`, `)} to ${capability.colors.endColors.join(`, `)}`;
}
</script>
