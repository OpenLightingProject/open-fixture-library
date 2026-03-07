<template>
  <figure class="wheel">
    <svg
      :width="300"
      :height="300"
      :viewBox="`${-wheelRadius} ${-wheelRadius} ${2 * wheelRadius} ${2 * wheelRadius}`">

      <defs>
        <radialGradient id="frostGradient">
          <stop offset="0" stop-color="#fff" />
          <stop offset="0.6" stop-color="#fff" />
          <stop offset="1" stop-color="#000" />
        </radialGradient>
      </defs>

      <circle
        cx="0"
        cy="0"
        :r="wheelRadius"
        fill="#444"
        class="wheel" />
      <circle
        cx="0"
        cy="0"
        r="3"
        fill="#fff"
        class="hole" />

      <g :transform="`scale(${wheel.direction === `CCW` ? -1 : 1}, 1)`" class="arrow">
        <g transform="rotate(-30)">
          <path
            d="M 0,-6 C 3,-6 6,-3 6,0"
            fill="none"
            stroke="#aaa"
            stroke-width="1" />
          <path
            d="M 0,-8 -4,-6 0,-4 Z"
            fill="#aaa" />
        </g>
      </g>

      <g
        v-for="(slot, index) of wheel.slots"
        :key="`slot-${index}`"
        :transform="`rotate(${slotRotateAngle * index}, 0, 0)`"
        class="slot"
        :class="{ dim: highlightedSlot !== null && highlightedSlot !== index }">

        <title>{{ slotTitles[index] }}</title>

        <g
          v-if="slot.colors !== null"
          :transform="`translate(0, ${slotRotateRadius})`"
          v-html="slotSvgFragments[index]" />

        <template v-else-if="slot.type === `Iris`">
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius"
            fill="#000" />
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius * (slot.openPercent ? slot.openPercent.number : 100) / 100"
            fill="#fff" />
        </template>

        <circle
          v-else-if="slot.type === `Frost`"
          :cx="0"
          :cy="slotRotateRadius"
          :r="slotRadius"
          fill="url(#frostGradient)" />

        <template v-else-if="slot.type === `AnimationGoboStart`">
          <!-- use circle's stroke, see https://css-tricks.com/building-a-donut-chart-with-vue-and-svg/ -->
          <circle
            :cx="0"
            :cy="0"
            :r="Math.abs(slotRotateRadius)"
            :stroke-width="2 * slotRadius"
            :stroke-dasharray="slotCircumference"
            :stroke-dashoffset="wheelDirectionFactor * (slotCircumference - animationGoboWidth)"
            :transform="`rotate(${-90 - (wheelDirectionFactor * slotRadius / slotCircumference * 360)}, 0, 0)`"
            stroke="#fff"
            fill="none" />

          <text
            :x="0"
            :y="slotRotateRadius + slotRadius * 0.35"
            :transform="`rotate(${-slotRotateAngle * index}, 0, ${slotRotateRadius})`"
            :font-size="slotRadius"
            text-anchor="middle"
            fill="#000">
            S
          </text>

          <!-- rotate once more (like it was drawn in next slot) -->
          <g :transform="`rotate(${slotRotateAngle}, 0, 0)`">
            <text
              :x="0"
              :y="slotRotateRadius + slotRadius * 0.35"
              :transform="`rotate(${-slotRotateAngle * (index + 1)}, 0, ${slotRotateRadius})`"
              :font-size="slotRadius"
              text-anchor="middle"
              fill="#000">
              E
            </text>
          </g>
        </template>

        <template v-else-if="slot.type !== `AnimationGoboEnd`">
          <circle
            :cx="0"
            :cy="slotRotateRadius"
            :r="slotRadius"
            fill="#fff" />

          <image
            v-if="slot.resource && slot.resource.hasImage"
            :x="-slotRadius"
            :y="slotRotateRadius - slotRadius"
            :width="slotRadius * 2"
            :height="slotRadius * 2"
            :xlink:href="slot.resource.imageDataUrl" />

          <text
            v-else
            :x="0"
            :y="slotRotateRadius + slotRadius * 0.35"
            :transform="`rotate(${-slotRotateAngle * index}, 0, ${slotRotateRadius})`"
            :font-size="slotRadius"
            text-anchor="middle"
            fill="#000">
            {{ slot.nthOfType + 1 }}
          </text>
        </template>
      </g>
    </svg>
    <figcaption>
      <ConditionalDetails>
        <template #summary>{{ wheel.name }}</template>

        <table>
          <tbody>
            <tr
              v-for="(slot, index) of wheel.slots"
              :key="`slot-${index}`"
              tabindex="0"
              @mouseover="highlightedSlot = (slot.type === `AnimationGoboEnd` ? index - 1 : index)"
              @focusin="highlightedSlot = (slot.type === `AnimationGoboEnd` ? index - 1 : index)"
              @mouseout="highlightedSlot = null"
              @focusout="highlightedSlot = null">
              <th scope="row">Slot {{ index + 1 }}</th>
              <td>{{ slot.name }}</td>
            </tr>
          </tbody>
        </table>

      </ConditionalDetails>
    </figcaption>
  </figure>
</template>

<style lang="scss" scoped>
figure {
  box-sizing: border-box;
  display: inline-block;
  width: 32%;
  min-width: 18rem;
  padding: 0 1rem;
  margin: 0 0 0.5rem;
  vertical-align: top;
  white-space: normal;
}

svg {
  width: 100%;
  height: 100%;
}

.slot {
  & text {
    font-weight: 400;
    pointer-events: none;
    fill: $primary-text-dark;
  }

  &:hover {
    opacity: 0.7;
  }

  &.dim {
    opacity: 0.3;
  }
}

figcaption :deep(summary) {
  position: sticky;
  top: 0;
  font-weight: 700;
  text-align: center;

  &:not(:hover, :focus) {
    background: theme-color(card-background, 80%);
  }
}

figcaption {
  max-height: 50vh;
  overflow: auto;
}

figcaption table {
  border-spacing: 0;

  & td,
  & th {
    padding: 3px;
    vertical-align: top;
  }

  th {
    white-space: nowrap;
  }
}
</style>

<script setup lang="ts">
import Wheel from '~~/lib/model/Wheel.js';

interface Props {
  wheel: Wheel;
}

const props = defineProps<Props>();

const highlightedSlot = ref<number | null>(null);
const wheelRadius = 50;
const wheelPadding = 3;

const wheelDirectionFactor = computed(() => {
  return props.wheel.direction === `CCW` ? -1 : 1;
});

const slotRadius = computed(() => {
  const usableRadius = wheelRadius - wheelPadding;

  const spacingFactor = 0.85;
  const anglePerSlot = (2 * Math.PI / props.wheel.slots.length) * spacingFactor;

  const maximumRadius = (usableRadius / 2) - 5;

  return Math.min(usableRadius / (1 + (1 / Math.sin(anglePerSlot / 2))), maximumRadius);
});

const slotRotateRadius = computed(() => {
  return -wheelRadius + slotRadius.value + wheelPadding;
});

const slotRotateAngle = computed(() => {
  return 360 / props.wheel.slots.length * wheelDirectionFactor.value;
});

const slotCircumference = computed(() => {
  return 2 * Math.PI * Math.abs(slotRotateRadius.value);
});

const slotSvgFragments = computed(() => {
  return props.wheel.slots.map(slot => {
    if (slot.colors !== null) {
      return getColorCircleSvgFragment(slot.colors, slotRadius.value);
    }

    return null;
  });
});

const animationGoboWidth = computed(() => {
  if (props.wheel.slots.length === 2) {
    return slotCircumference.value;
  }

  return (2 * slotRadius.value) + (slotCircumference.value * Math.abs(slotRotateAngle.value) / 360);
});

const slotTitles = computed(() => {
  return props.wheel.slots.map((slot, index) => {
    if (slot.type === `AnimationGoboStart`) {
      const splitSlot = props.wheel.getSlot(index + 1.5);
      return `Slots ${index + 1}…${index + 2}: ${splitSlot.name}`;
    }

    return `Slot ${index + 1}: ${slot.name}`;
  });
});

function getColorCircleSvgFragment(colors: string[], radius: number) {
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  const fragment = document.createDocumentFragment();
  const circle = document.createElementNS(svgNs, 'circle');

  circle.setAttribute('r', String(radius));
  circle.setAttribute('fill', colors[0]);
  svg.appendChild(circle);

  if (colors.length >= 2) {
    const circle2 = document.createElementNS(svgNs, 'circle');
    circle2.setAttribute('r', String(radius / 2));
    circle2.setAttribute('fill', colors[1]);
    svg.appendChild(circle2);
  }

  if (colors.length >= 3) {
    const rect = document.createElementNS(svgNs, 'rect');
    const halfRadius = radius / 2;
    rect.setAttribute('x', String(-halfRadius));
    rect.setAttribute('y', String(-halfRadius));
    rect.setAttribute('width', String(radius));
    rect.setAttribute('height', String(radius));
    rect.setAttribute('fill', colors[2]);
    svg.appendChild(rect);
  }

  fragment.appendChild(svg);
  return new XMLSerializer().serializeToString(svg);
}
</script>
