<script>
import Capability from '../../lib/model/Capability.js';

export default {
  functional: true,
  props: {
    capability: {
      type: Capability,
      required: true
    }
  },
  render(createElement, context) {
    return createElement(`OflSvg`, {
      props: getIconProps(context.props.capability)
    });
  }
};

const isAnimationGoboSlot = slot => slot.type.startsWith(`AnimationGobo`);
const isAnimationGobo = cap => isAnimationGoboSlot(cap.wheelSlot[0]) && isAnimationGoboSlot(cap.wheelSlot[1]);

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
  Intensity(cap, iconProps) {
    iconProps.name = `dimmer`;
  },
  ColorIntensity(cap, iconProps) {
    iconProps.name = `dimmer`;
  },
  ColorPreset(cap, iconProps) {
    iconProps.name = `color-changer`;
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
    if (isAnimationGobo(cap)) {
      iconProps.name = `animation-gobo`;
    }
    else if (cap.wheelSlot[0] === cap.wheelSlot[1] && cap.wheelSlot[0].type !== `Split`) {
      iconProps.name = cap.wheelSlot[0].type === `Color` ? `color-changer` : cap.wheelSlot[0].type;
    }
    else {
      iconProps.name = ``;
    }
  },
  WheelShake(cap, iconProps) {
    if (cap.wheelSlot && isAnimationGobo(cap)) {
      iconProps.name = `animation-gobo`;
    }
    else if (cap.wheelSlot && cap.wheelSlot[0] !== cap.wheelSlot[1]) {
      iconProps.name = ``;
    }
    else {
      iconProps.name = (cap.isShaking === `slot`)
        ? `slot-shake`
        : `wheel-shake`;
    }
  },
  IrisEffect(cap, iconProps) {
    iconProps.name = `Iris`;
  },
  FrostEffect(cap, iconProps) {
    iconProps.name = `Frost`;
  },
  Fog(cap, iconProps) {
    specialIconFunctions.FogType(cap, iconProps);
  },
  FogOutput(cap, iconProps) {
    iconProps.name = `smoke`;
  },
  FogType(cap, iconProps) {
    iconProps.name = cap.fogType === `Haze` ? `hazer` : `smoke`;
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
  },
  Generic(cap, iconProps) {
    iconProps.name = `other`;
  }
};

/**
 * @param {AbstractChannel} cap The capability to get an icon for.
 * @returns {Object} Object containing the props to pass to <OflSvg />
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
    type: `fixture`,
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
 * @returns {String|null} A string describing the colors of this capability, or null if it has no colors.
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
