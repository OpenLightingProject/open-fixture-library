<template>
  <span
    class="icon"
    :class="$attrs.class"
    :aria-hidden="hasTitle ? undefined : 'true'"
    v-html="svgMarkup" />
</template>

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

<script setup lang="ts">
import icons from '../assets/icons/icons.js';

interface Properties {
  type?: string;
  name?: string;
  colors?: string[];
  title?: string;
}

const properties = withDefaults(defineProps<Properties>(), {
  type: undefined,
  name: undefined,
  colors: () => [],
  title: undefined,
});

/**
 * Returns the SVG markup for an icon.
 * @param name - The icon name.
 * @param category - The optional icon category directory.
 * @param title - An optional accessible title.
 * @returns The SVG markup.
 */
function getSvg(name: string | undefined, category: string | undefined, title: string | undefined): string {
  if (name === undefined) {
    return '';
  }

  const kebabName = name.replaceAll(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replaceAll(/\W+/g, '-');
  const svgBasename = (category ? `${category}/` : '') + kebabName;
  let svg: string;

  if (svgBasename in icons) {
    svg = (icons as Record<string, string>)[svgBasename].trim();
  }
  else {
    throw new Error(`Icon '${svgBasename}' not found`);
  }

  svg = svg.replace('<svg', '<svg role="img"');

  if (title) {
    svg = svg.replace(/(<svg[^>]*)>/, (match, svgStart) => `${svgStart} aria-label="${title}"><title>${title}</title>`);
  }

  return svg;
}

/**
 * Builds a pie-chart color circle icon.
 * @param colors - The colors to render as slices.
 * @param title - An optional accessible title.
 * @returns The SVG markup.
 */
function getColorCircle(colors: string[], title: string | undefined): string {
  let svgString = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="-12 -12 24 24" class="icon color-circle" role="img">';

  if (title) {
    svgString += `<title>${title}</title>`;
  }

  const radius = 9;

  svgString += `<circle cx="0" cy="0" r="${radius + 1}" />`;

  svgString += getColorCircleSvgFragment(colors, radius);

  svgString += '</svg>';

  return svgString;
}

/**
 * Builds the circles or slices inside a color circle icon.
 * @param colors - The colors to render.
 * @param radius - The circle radius.
 * @returns The SVG fragment.
 */
function getColorCircleSvgFragment(colors: string[], radius: number): string {
  if (colors.length === 1) {
    return `<circle cx="0" cy="0" r="${radius}" fill="${colors[0]}" />`;
  }

  let svgString = '';
  const slicePercent = 1 / colors.length;

  const xAxisRotation = 0;
  const largeArcFlag = 0;
  const sweepFlag = 1;

  for (const [index, color] of colors.entries()) {
    const [startX, startY] = getCoordinatesForPercent(index * slicePercent, radius);
    const [endX, endY] = getCoordinatesForPercent((index + 1) * slicePercent, radius);

    const pathMove = `M ${startX} ${startY}`;
    const pathArc = `A ${radius} ${radius} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
    const pathLine = 'L 0 0';

    svgString += `<path d="${pathMove} ${pathArc} ${pathLine}" fill="${color}" />`;
  }

  return svgString;
}

/**
 * Converts a slice position on a color circle to Cartesian coordinates.
 * @param percent - The position in the range 0 to 1.
 * @param radius - The circle radius.
 * @returns The x and y coordinates.
 */
function getCoordinatesForPercent(percent: number, radius: number): [number, number] {
  percent += 0.375;

  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}

const svgData = computed(() => {
  let svg: string;
  let hasTitle = Boolean(properties.title);

  if (properties.type === 'color-circle') {
    let colors = properties.colors;

    if (properties.colors.length === 0 && properties.name !== undefined) {
      const colorLookup: Record<string, string> = {
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
      colors = [colorLookup[properties.name] ?? ''];
    }

    const title = properties.title || properties.name;
    hasTitle = Boolean(title);
    svg = getColorCircle(colors, title);
  }
  else {
    svg = getSvg(properties.name, properties.type, properties.title);
  }

  return { svg, hasTitle };
});

const svgMarkup = computed(() => svgData.value.svg);
const hasTitle = computed(() => svgData.value.hasTitle);
</script>
