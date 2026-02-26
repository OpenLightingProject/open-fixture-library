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

interface Props {
  type?: string;
  name?: string;
  colors?: string[];
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => [],
});

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
    svg = svg.replace(/(<svg[^>]*)>/, `$1 aria-label="${title}"><title>${title}</title>`);
  }

  return svg;
}

function getColorCircle(colors: string[], title: string | undefined): string {
  let svgString = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24" viewBox="-12 -12 24 24" class="icon color-circle" role="img">`;

  if (title) {
    svgString += `<title>${title}</title>`;
  }

  const radius = 9;

  svgString += `<circle cx="0" cy="0" r="${radius + 1}" />`;

  svgString += getColorCircleSvgFragment(colors, radius);

  svgString += '</svg>';

  return svgString;
}

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

function getCoordinatesForPercent(percent: number, radius: number): [number, number] {
  percent += 0.375;

  const x = radius * Math.cos(2 * Math.PI * percent);
  const y = radius * Math.sin(2 * Math.PI * percent);
  return [x, y];
}

const svgData = computed(() => {
  let svg: string;
  let hasTitle = Boolean(props.title);

  if (props.type === 'color-circle') {
    let colors = props.colors;

    if (props.colors.length === 0 && props.name !== undefined) {
      const colorLookup: Record<string, string> = {
        Red: '#ff0000',
        Green: '#00ff00',
        Blue: '#0000ff',
        Cyan: '#00ffff',
        Magenta: '#ff00ff',
        Yellow: '#ffff00',
        Amber: '#ffbf00',
        White: '#ffffff',
        'Warm White': '#ffedde',
        'Cold White': '#edefff',
        UV: '#8800ff',
        Lime: '#bfff00',
        Indigo: '#4b0082',
      };
      colors = [colorLookup[props.name] ?? ''];
    }

    const title = props.title || props.name;
    hasTitle = Boolean(title);
    svg = getColorCircle(colors, title);
  }
  else {
    svg = getSvg(props.name, props.type, props.title);
  }

  return { svg, hasTitle };
});

const svgMarkup = computed(() => svgData.value.svg);
const hasTitle = computed(() => svgData.value.hasTitle);
</script>

<template>
  <span
    class="icon"
    :class="$attrs.class"
    :aria-hidden="hasTitle ? undefined : 'true'"
    v-html="svgMarkup"
  />
</template>

