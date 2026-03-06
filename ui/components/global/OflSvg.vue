<!-- eslint-disable-next-line vue/enforce-style-attribute -- scoped styles don't work with v-html -->
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

<template>
  <span
    class="icon"
    v-bind="ariaAttrs"
    v-html="svgMarkup" />
</template>

<script>
import icons from '../../assets/icons/icons.js';

export default {
  props: {
    type: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    colors: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: undefined,
    },
  },
  computed: {
    hasTitle() {
      if (this.type === 'color-circle') {
        return Boolean(this.title || this.name);
      }
      return Boolean(this.title);
    },
    ariaAttrs() {
      return this.hasTitle ? {} : { 'aria-hidden': 'true' };
    },
    svgMarkup() {
      if (this.type === 'color-circle') {
        let colors = this.colors;

        if (this.colors.length === 0 && this.name !== undefined) {
          const colorLookup = {
            'Red': '#ff0000',
            'Green': '#00ff00',
            'Blue': '#0000ff',
            'Cyan': '#00ffff',
            'Magenta': '#ff00ff',
            'Yellow': '#ffff00',
            'Amber': '#ffbf00',
            'White': '#ffffff',
            'Warm White': '#ffedde',
            'Cold White': '#edefff',
            'UV': '#8800ff',
            'Lime': '#bfff00',
            'Indigo': '#4b0082',
          };
          colors = [colorLookup[this.name]];
        }

        const title = this.title || this.name;
        return getColorCircle(colors, title);
      }
      return getSvg(this.name, this.type, this.title);
    },
  },
};

function getSvg(name, category = undefined, title) {
  if (name === undefined) {
    return '';
  }

  const kebabName = name.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replaceAll(/\W+/g, '-');
  const svgBasename = (category ? `${category}/` : '') + kebabName;
  let svg;

  if (svgBasename in icons) {
    svg = icons[svgBasename].trim();
  }
  else {
    throw new Error(`Icon '${svgBasename}' not found`);
  }

  svg = svg.replace('<svg', '<svg role="img"');

  if (title) {
    svg = svg.replace(/(<svg[^>]*)>/, `$1 aria-label="${title}"><title>${title}</title>`);
  }

  return svg;
}

function getColorCircle(colors, title) {
  let string = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="-12 -12 24 24" class="icon color-circle" role="img">';

  if (title) {
    string += `<title>${title}</title>`;
  }

  const radius = 9;
  string += `<circle cx="0" cy="0" r="${radius + 1}" />`;
  string += getColorCircleSvgFragment(colors, radius);
  string += '</svg>';

  return string;
}

function getCoordinatesForPercent(percent, radius) {
  percent += 0.375;
  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}

export function getColorCircleSvgFragment(colors, radius) {
  if (colors.length === 1) {
    return `<circle cx="0" cy="0" r="${radius}" fill="${colors[0]}" />`;
  }

  let svgString = '';
  const slicePercent = 1 / colors.length;

  for (const [index, color] of colors.entries()) {
    const [startX, startY] = getCoordinatesForPercent(index * slicePercent, radius);
    const [endX, endY] = getCoordinatesForPercent((index + 1) * slicePercent, radius);

    const pathMove = `M ${startX} ${startY}`;
    const pathArc = `A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;
    const pathLine = 'L 0 0';

    svgString += `<path d="${pathMove} ${pathArc} ${pathLine}" fill="${color}" />`;
  }

  return svgString;
}
</script>
