<!-- eslint-disable-next-line vue/enforce-style-attribute -- scoped styles don't work for functional components -->
<style lang="scss">
.icon {
  display: inline-block;
  width: 1.4em;
  height: 1.4em;
  vertical-align: middle;

  &.inactive {
    fill: theme-color(icon-inactive);
  }

  &.gobo-icon {
    box-sizing: border-box;
    padding: 2px;
    background-color: white;
    background-clip: content-box;
    border-radius: 50%;
  }

  & svg {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>

<script>
import { arrayProp, stringProp } from 'vue-ts-types';
import icons from '../../assets/icons/icons.js';

export default {
  functional: true,
  props: {
    type: stringProp().optional,
    name: stringProp().optional,
    colors: arrayProp().withDefault(() => []),
    title: stringProp().optional,
  },
  render(createElement, context) {
    let svgMarkup;
    let hasTitle = Boolean(context.props.title);

    if (context.props.type === `color-circle`) {
      let colors = context.props.colors;

      if (context.props.colors.length === 0 && context.props.name !== undefined) {
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
          Indigo: `#4b0082`,
        };
        colors = [colorLookup[context.props.name]];
      }

      const title = context.props.title || context.props.name;
      hasTitle = Boolean(title);
      svgMarkup = getColorCircle(colors, title);
    }
    else {
      svgMarkup = getSvg(context.props.name, context.props.type, context.props.title);
    }

    return createElement(`span`, {
      ...context.data,
      class: [`icon`, context.data.class],
      attrs: hasTitle ? {} : { 'aria-hidden': `true` },
      domProps: {
        innerHTML: svgMarkup,
      },
    });
  },
};


/**
 * Returns the contents of the provided SVG file as an inline SVG.
 * @param {string | undefined} name Name of the icon (without extension).
 * @param {string | undefined} category The category (directory) of the icon.
 * @param {string | undefined} title An optional (tooltip) title for the icon.
 * @returns {string} The inline <svg> tag or an empty string if the file was not found.
 */
function getSvg(name, category = undefined, title) {
  if (name === undefined) {
    return ``;
  }

  const kebabName = name.replaceAll(/([a-z])([A-Z])/g, `$1-$2`).toLowerCase().replaceAll(/\W+/g, `-`);
  const svgBasename = (category ? `${category}/` : ``) + kebabName;
  let svg;

  if (svgBasename in icons) {
    svg = icons[svgBasename].trim();
  }
  else {
    throw new Error(`Icon '${svgBasename}' not found`);
  }

  svg = svg.replace(`<svg`, `<svg role="img"`);

  if (title) {
    svg = svg.replace(/(<svg[^>]*)>/, `$1 aria-label="${title}"><title>${title}</title>`);
  }

  return svg;
}


/**
 * Get inline SVG for a color circle (like a pie chart with equally-sized pies).
 * @param {string[]} colors Array of color strings to display.
 * @param {string | undefined} [title] Text for the title tag. If this parameter is not given, no title tag will be added.
 * @returns {string} The HTML for displaying the color circle.
 */
function getColorCircle(colors, title) {
  // viewBox customized to have the (0,0) coordinate in the center
  let string = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="-12 -12 24 24" class="icon color-circle" role="img">`;

  if (title) {
    string += `<title>${title}</title>`;
  }

  const radius = 9;

  // use current fill color as background / border
  string += `<circle cx="0" cy="0" r="${radius + 1}" />`;

  string += getColorCircleSvgFragment(colors, radius);

  string += `</svg>`;

  return string;
}


/**
 * @param {string[]} colors An array of hex colors to fill into the circle.
 * @param {number} radius The radius of the circle.
 * @returns {string} A string containing one SVG <circle> element or multiple SVG <path> elements.
 */
export function getColorCircleSvgFragment(colors, radius) {
  if (colors.length === 1) {
    return `<circle cx="0" cy="0" r="${radius}" fill="${colors[0]}" />`;
  }

  let svgString = ``;
  const slicePercent = 1 / colors.length;

  const xAxisRotation = 0;
  const largeArcFlag = 0;
  const sweepFlag = 1;

  for (const [index, color] of colors.entries()) {
    const [startX, startY] = getCoordinatesForPercent(index * slicePercent, radius);
    const [endX, endY] = getCoordinatesForPercent((index + 1) * slicePercent, radius);

    const pathMove = `M ${startX} ${startY}`;
    const pathArc = `A ${radius} ${radius} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
    const pathLine = `L 0 0`;

    svgString += `<path d="${pathMove} ${pathArc} ${pathLine}" fill="${color}" />`;
  }

  return svgString;
}


/**
 * Get x and y coordinates of the point that is `percent` percent of the way around a circle. Note that 37.5% are added to start at a 135deg angle.
 * @param {number} percent Percent of the whole circle.
 * @param {number} radius Radius of the circle.
 * @returns {[number, number]} Array with x and y coordinate.
 */
function getCoordinatesForPercent(percent, radius) {
  percent += 0.375;

  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}
</script>
