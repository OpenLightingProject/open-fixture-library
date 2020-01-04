<style lang="scss">
.icon {
  display: inline-block;
  height: 1.4em;
  width: 1.4em;
  vertical-align: middle;

  &.inactive {
    fill: theme-color(icon-inactive);
  }

  & svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>

<script>
import icons from '../../assets/icons/icons.js';

export default {
  functional: true,
  props: {
    type: {
      type: String,
      required: false,
      default: () => ``
    },
    name: {
      type: String,
      required: false,
      default: () => ``
    },
    colors: {
      type: Array,
      required: false,
      default: () => []
    },
    title: {
      type: String,
      required: false,
      default: null
    }
  },
  render(createElement, context) {
    let svgMarkup;

    if (context.props.type === `color-circle`) {
      let colors = context.props.colors;

      if (context.props.colors.length === 0 && context.props.name !== ``) {
        // hex colors for ColorIntensity capabilities
        const colorLookup = {
          Red: `#ff0000`,
          Green: `#00ff00`,
          Blue: `#0000ff`,
          Cyan: `#00ffff`,
          Magenta: `#ff00ff`,
          Yellow: `#ffff00`,
          Amber: `#ffbf00`,
          White: `#ffffff`,
          'Warm White': `#ffedde`,
          'Cold White': `#edefff`,
          UV: `#8800ff`,
          Lime: `#bfff00`,
          Indigo: `#4b0082`
        };
        colors = [colorLookup[context.props.name]];
      }

      svgMarkup = getColorCircle(colors, context.props.title || context.props.name);
    }
    else {
      svgMarkup = getSvg(context.props.name, context.props.type, context.props.title);
    }

    return createElement(`span`, Object.assign({}, context.data, {
      class: [`icon`, context.data.class],
      domProps: {
        innerHTML: svgMarkup
      }
    }));
  }
};


/**
 * Returns the contents of the provided SVG file as an inline SVG.
 * @param {String} name Name of the icon (without extension).
 * @param {String|null} category The category (directory) of the icon.
 * @param {String|null} title An optional (tooltip) title for the icon.
 * @returns {String} The inline <svg> tag or an empty string if the file was not found.
 */
function getSvg(name, category = null, title) {
  if (name === ``) {
    return ``;
  }

  const kebabName = name.replace(/([a-z])([A-Z])/g, `$1-$2`).toLowerCase().replace(/[^\w]+/g, `-`);
  const svgBasename = (category ? `${category}/` : ``) + kebabName;
  let svg = ``;

  if (svgBasename in icons) {
    svg = icons[svgBasename].trim();
  }
  else {
    console.error(`Icon '${svgBasename}' not found`);
  }

  if (title) {
    svg = svg.replace(/(<svg[^>]*)>/, `$1 aria-label="${title}"><title>${title}</title>`);
  }

  return svg;
}


/**
 * Get inline SVG for a color circle (like a pie chart with equally-sized pies).
 * @param {Array.<String>} colors Array of color strings to display.
 * @param {String|null} [title] Text for the title tag. If this parameter is not given, no title tag will be added.
 * @returns {String} The HTML for displaying the color circle.
 */
function getColorCircle(colors, title) {
  // viewBox customized to have the (0,0) coordinate in the center
  let str = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="-12 -12 24 24" class="icon color-circle">`;

  if (title) {
    str += `<title>${title}</title>`;
  }

  const radius = 9;

  // use current fill color as background / border
  str += `<circle cx="0" cy="0" r="${radius + 1}" />`;

  str += getColorCircleSvgFragment(colors, radius);

  str += `</svg>`;

  return str;
}


/**
 * @param {Array.<String>} colors An array of hex colors to fill into the circle.
 * @param {Number} radius The radius of the circle.
 * @returns {String} A string containing one SVG <circle> element or multiple SVG <path> elements.
 */
export function getColorCircleSvgFragment(colors, radius) {
  if (colors.length === 1) {
    return `<circle cx="0" cy="0" r="${radius}" fill="${colors[0]}" />`;
  }

  let svgStr = ``;
  const slicePercent = 1.0 / colors.length;

  const xAxisRotation = 0;
  const largeArcFlag = 0;
  const sweepFlag = 1;

  for (let i = 0; i < colors.length; i++) {
    const [startX, startY] = getCoordinatesForPercent(i * slicePercent, radius);
    const [endX, endY] = getCoordinatesForPercent((i + 1) * slicePercent, radius);

    const pathMove = `M ${startX} ${startY}`;
    const pathArc = `A ${radius} ${radius} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
    const pathLine = `L 0 0`;

    svgStr += `<path d="${pathMove} ${pathArc} ${pathLine}" fill="${colors[i]}" />`;
  }

  return svgStr;
}


/**
 * Get x and y coordinates of the point that is `percent` percent of the way around a circle. Note that 37.5% are added to start at a 135deg angle.
 * @param {Number} percent Percent of the whole circle.
 * @param {Number} radius Radius of the circle.
 * @returns {[Number, Number]} Array with x and y coordinate.
 */
function getCoordinatesForPercent(percent, radius) {
  percent += 0.375;

  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}
</script>
