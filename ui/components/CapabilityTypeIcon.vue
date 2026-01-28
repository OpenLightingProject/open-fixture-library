<script>
import { instanceOfProp } from 'vue-ts-types';
import Capability from '../../lib/model/Capability.js';

export default {
  functional: true,
  props: {
    capability: instanceOfProp(Capability).required,
  },
  render(createElement, context) {
    const capability = context.props.capability;
    const wheelSlot = capability.wheelSlot;

    if (capability.type !== `WheelShake` && wheelSlot !== null && wheelSlot[0] === wheelSlot[1]) {
      const resource = wheelSlot[0].resource;

      if (resource && resource.hasImage) {
        const data = {
          ...context.data,
          attrs: {
            ...context.data.attrs,
            src: resource.imageDataUrl,
            title: `Capability type: ${capability.type}, slot ${capability.slotNumber[0]} (${wheelSlot[0].name})`,
          },
          class: [context.data.class, `icon`, `gobo-icon`],
        };

        return createElement(`img`, data);
      }
    }

    return createElement(`OflSvg`, {
      ...context.data,
      props: getIconProperties(capability),
    });
  },
};

const isAnimationGoboSlot = slot => slot.type.startsWith(`AnimationGobo`);
const isAnimationGobo = capability => isAnimationGoboSlot(capability.wheelSlot[0]) && isAnimationGoboSlot(capability.wheelSlot[1]);

const specialIconFunctions = {
  ShutterStrobe(capability, iconProperties) {
    if (capability.shutterEffect === `Closed` || capability.shutterEffect === `Open`) {
      iconProperties.type = `color-circle`;
      iconProperties.colors = [capability.shutterEffect === `Closed` ? `#000000` : `#ffffff`];
      delete iconProperties.name;
    }
    else {
      iconProperties.name = `Strobe`;
    }
  },
  Intensity(capability, iconProperties) {
    iconProperties.name = `dimmer`;
  },
  ColorIntensity(capability, iconProperties) {
    iconProperties.name = `dimmer`;
  },
  ColorPreset(capability, iconProperties) {
    iconProperties.name = `color-changer`;
  },
  PanContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = `pan-continuous-cw`;
    }
    else if (capability.speed[0].number < 0 || capability.speed[1].number < 0) {
      iconProperties.name = `pan-continuous-ccw`;
    }
  },
  TiltContinuous(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = `tilt-continuous-cw`;
    }
    else if (capability.speed[0].number < 0 || capability.speed[1].number < 0) {
      iconProperties.name = `tilt-continuous-ccw`;
    }
  },
  WheelSlot(capability, iconProperties) {
    if (isAnimationGobo(capability)) {
      iconProperties.name = `animation-gobo`;
    }
    else if (capability.wheelSlot[0] === capability.wheelSlot[1] && capability.wheelSlot[0].type !== `Split`) {
      iconProperties.name = capability.wheelSlot[0].type === `Color` ? `color-changer` : capability.wheelSlot[0].type;
      iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
    }
    else {
      iconProperties.name = undefined;
    }
  },
  WheelShake(capability, iconProperties) {
    if (capability.wheelSlot && isAnimationGobo(capability)) {
      iconProperties.name = `animation-gobo`;
    }
    else if (capability.wheelSlot && capability.wheelSlot[0] !== capability.wheelSlot[1]) {
      iconProperties.name = undefined;
    }
    else {
      iconProperties.name = capability.isShaking === `slot` ? `slot-shake` : `wheel-shake`;

      if (capability.wheelSlot) {
        iconProperties.title += `, slot ${capability.slotNumber[0]} (${capability.wheelSlot[0].name})`;
      }
    }
  },
  IrisEffect(capability, iconProperties) {
    iconProperties.name = `Iris`;
  },
  FrostEffect(capability, iconProperties) {
    iconProperties.name = `Frost`;
  },
  Fog(capability, iconProperties) {
    specialIconFunctions.FogType(capability, iconProperties);
  },
  FogOutput(capability, iconProperties) {
    iconProperties.name = `smoke`;
  },
  FogType(capability, iconProperties) {
    iconProperties.name = capability.fogType === `Haze` ? `hazer` : `smoke`;
  },
  Speed(capability, iconProperties) {
    if (!capability.speed) {
      iconProperties.name = `speed`;
    }
    else if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = `speed-forward`;
    }
    else {
      iconProperties.name = `speed-reverse`;
    }
  },
  Rotation(capability, iconProperties) {
    if (capability.speed) {
      specialIconFunctions.RotationSpeed(capability, iconProperties);
    }
    else {
      iconProperties.name = `rotation-angle`;
    }
  },
  RotationSpeed(capability, iconProperties) {
    if (capability.speed[0].number === 0 && capability.speed[1].number === 0) {
      iconProperties.name = `speed-stop`;
    }
    else if (capability.speed[0].number > 0 || capability.speed[1].number > 0) {
      iconProperties.name = `rotation-cw`;
    }
    else {
      iconProperties.name = `rotation-ccw`;
    }
  },
  Generic(capability, iconProperties) {
    iconProperties.name = `other`;
  },
};

/**
 * @param {AbstractChannel} capability The capability to get an icon for.
 * @returns {object} Object containing the props to pass to <OflSvg />
 */
function getIconProperties(capability) {
  if (capability.colors !== null) {
    return {
      type: `color-circle`,
      colors: capability.colors.allColors,
      title: `Capability type: ${capability.type}, ${getColorDescription(capability)}`,
    };
  }

  const iconProperties = {
    type: `fixture`,
    name: capability.type,
    title: `Capability type: ${capability.type}`,
  };

  if (capability.isSoundControlled) {
    iconProperties.name = `sound-controlled`;
    iconProperties.title += ` (sound-controlled)`;
  }
  else if (capability.type in specialIconFunctions) {
    specialIconFunctions[capability.type](capability, iconProperties);
  }
  else if (/(?:Speed|Duration|Time)$/.test(capability.type)) {
    specialIconFunctions.Speed(capability, iconProperties);
  }
  else if (capability.type.endsWith(`Rotation`)) {
    specialIconFunctions.Rotation(capability, iconProperties);
  }

  return iconProperties;
}

/**
 * @param {Capability} capability The capability model object.
 * @returns {string | null} A string describing the colors of this capability, or null if it has no colors.
 */
function getColorDescription(capability) {
  if (capability.colors === null) {
    return null;
  }

  if (capability.colors.isStep) {
    const plural = capability.colors.allColors.length > 1 ? `colors` : `color`;
    const allColors = capability.colors.allColors.join(`, `);
    return `${plural}: ${allColors}`;
  }

  const startColors = capability.colors.startColors.join(`, `);
  const endColors = capability.colors.endColors.join(`, `);
  return `transition from ${startColors} to ${endColors}`;
}
</script>
