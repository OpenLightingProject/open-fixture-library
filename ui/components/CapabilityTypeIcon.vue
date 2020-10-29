<script>
import Capability from '../../lib/model/Capability.js';

export default {
  functional: true,
  props: {
    capability: {
      type: Capability,
      required: true,
    },
  },
  render(createElement, context) {
    const capability = context.props.capability;
    const wheelSlot = capability.wheelSlot;

    if (capability.type !== `WheelShake` && wheelSlot !== null && wheelSlot[0] === wheelSlot[1]) {
      const resource = wheelSlot[0].resource;

      if (resource && resource.hasImage) {
        const data = Object.assign({}, context.data, {
          attrs: Object.assign({}, context.data.attrs, {
            src: resource.imageDataUrl,
            title: `Capability type: ${capability.type}, slot ${capability.slotNumber[0]} (${wheelSlot[0].name})`,
          }),
          class: [context.data.class, `icon`, `gobo-icon`],
        });

        return createElement(`img`, data);
      }
    }

    return createElement(`OflSvg`, Object.assign({}, context.data, {
      props: getIconProperties(capability),
    }));
  },
};

const isAnimationGoboSlot = slot => slot.type.startsWith(`AnimationGobo`);
const isAnimationGobo = cap => isAnimationGoboSlot(cap.wheelSlot[0]) && isAnimationGoboSlot(cap.wheelSlot[1]);

const specialIconFunctions = {
  ShutterStrobe(cap, iconProperties) {
    if (cap.shutterEffect === `Closed` || cap.shutterEffect === `Open`) {
      iconProperties.type = `color-circle`;
      iconProperties.colors = [cap.shutterEffect === `Closed` ? `#000000` : `#ffffff`];
      delete iconProperties.name;
    }
    else {
      iconProperties.name = `Strobe`;
    }
  },
  Intensity(cap, iconProperties) {
    iconProperties.name = `dimmer`;
  },
  ColorIntensity(cap, iconProperties) {
    iconProperties.name = `dimmer`;
  },
  ColorPreset(cap, iconProperties) {
    iconProperties.name = `color-changer`;
  },
  PanContinuous(cap, iconProperties) {
    if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProperties.name = `pan-continuous-cw`;
    }
    else if (cap.speed[0].number < 0 || cap.speed[1].number < 0) {
      iconProperties.name = `pan-continuous-ccw`;
    }
  },
  TiltContinuous(cap, iconProperties) {
    if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProperties.name = `tilt-continuous-cw`;
    }
    else if (cap.speed[0].number < 0 || cap.speed[1].number < 0) {
      iconProperties.name = `tilt-continuous-ccw`;
    }
  },
  WheelSlot(cap, iconProperties) {
    if (isAnimationGobo(cap)) {
      iconProperties.name = `animation-gobo`;
    }
    else if (cap.wheelSlot[0] === cap.wheelSlot[1] && cap.wheelSlot[0].type !== `Split`) {
      iconProperties.name = cap.wheelSlot[0].type === `Color` ? `color-changer` : cap.wheelSlot[0].type;
      iconProperties.title += `, slot ${cap.slotNumber[0]} (${cap.wheelSlot[0].name})`;
    }
    else {
      iconProperties.name = ``;
    }
  },
  WheelShake(cap, iconProperties) {
    if (cap.wheelSlot && isAnimationGobo(cap)) {
      iconProperties.name = `animation-gobo`;
    }
    else if (cap.wheelSlot && cap.wheelSlot[0] !== cap.wheelSlot[1]) {
      iconProperties.name = ``;
    }
    else {
      iconProperties.name = (cap.isShaking === `slot`)
        ? `slot-shake`
        : `wheel-shake`;

      if (cap.wheelSlot) {
        iconProperties.title += `, slot ${cap.slotNumber[0]} (${cap.wheelSlot[0].name})`;
      }
    }
  },
  IrisEffect(cap, iconProperties) {
    iconProperties.name = `Iris`;
  },
  FrostEffect(cap, iconProperties) {
    iconProperties.name = `Frost`;
  },
  Fog(cap, iconProperties) {
    specialIconFunctions.FogType(cap, iconProperties);
  },
  FogOutput(cap, iconProperties) {
    iconProperties.name = `smoke`;
  },
  FogType(cap, iconProperties) {
    iconProperties.name = cap.fogType === `Haze` ? `hazer` : `smoke`;
  },
  Speed(cap, iconProperties) {
    if (!cap.speed) {
      iconProperties.name = `speed`;
    }
    else if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProperties.name = `speed-forward`;
    }
    else {
      iconProperties.name = `speed-reverse`;
    }
  },
  Rotation(cap, iconProperties) {
    if (cap.speed) {
      specialIconFunctions.RotationSpeed(cap, iconProperties);
    }
    else {
      iconProperties.name = `rotation-angle`;
    }
  },
  RotationSpeed(cap, iconProperties) {
    if (cap.speed[0].number === 0 && cap.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (cap.speed[0].number > 0 || cap.speed[1].number > 0) {
      iconProperties.name = `rotation-cw`;
    }
    else {
      iconProperties.name = `rotation-ccw`;
    }
  },
  Generic(cap, iconProperties) {
    iconProperties.name = `other`;
  },
};

/**
 * @param {AbstractChannel} cap The capability to get an icon for.
 * @returns {Object} Object containing the props to pass to <OflSvg />
 */
function getIconProperties(cap) {
  if (cap.colors !== null) {
    return {
      type: `color-circle`,
      colors: cap.colors.allColors,
      title: `Capability type: ${cap.type}, ${getColorDescription(cap)}`,
    };
  }

  const iconProperties = {
    type: `fixture`,
    name: cap.type,
    title: `Capability type: ${cap.type}`,
  };

  if (cap.isSoundControlled) {
    iconProperties.name = `sound-controlled`;
    iconProperties.title += ` (sound-controlled)`;
  }
  else if (cap.type in specialIconFunctions) {
    specialIconFunctions[cap.type](cap, iconProperties);
  }
  else if (/(?:Speed|Duration|Time)$/.test(cap.type)) {
    specialIconFunctions.Speed(cap, iconProperties);
  }
  else if (cap.type.endsWith(`Rotation`)) {
    specialIconFunctions.Rotation(cap, iconProperties);
  }

  return iconProperties;
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
