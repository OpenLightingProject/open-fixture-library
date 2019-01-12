<template>
  <figure class="wheel">
    <svg width="300" height="300" viewBox="-50 -50 100 100">
      <circle
        cx="0"
        cy="0"
        r="50"
        fill="#444"
        class="wheel" />
      <circle
        cx="0"
        cy="0"
        r="3"
        fill="#fff" />

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
        v-for="(slot, index) in wheel.slots"
        :key="`slot-${index}`"
        :transform="`rotate(${slotRotateAngle * index}, 0, 0)`"
        class="slot">

        <title>Slot {{ index + 1 }}: {{ slot.name }}</title>

        <g
          v-if="slot.colors !== null"
          :transform="`translate(0, ${slotRotateRadius})`"
          v-html="slotSvgFragments[index]" />

        <circle
          v-else
          :cx="0"
          :cy="slotRotateRadius"
          :r="slotRadius"
          fill="#fff" />

        <text
          v-if="!(`colors` in slot)"
          :x="0"
          :y="slotRotateRadius + slotRadius * 0.35"
          :transform="`rotate(${-slotRotateAngle * index}, 0, ${slotRotateRadius})`"
          :font-size="slotRadius"
          text-anchor="middle"
          fill="#000">
          {{ index + 1 }}
        </text>
      </g>
    </svg>
    <figcaption>{{ wheel.name }}</figcaption>
  </figure>
</template>

<style lang="scss" scoped>
figure {
  box-sizing: border-box;
  padding: 0 1rem;
  margin: 0 0 0.5rem;
  display: inline-block;
  width: 32%;
  min-width: 18rem;
}

svg {
  width: 100%;
  height: 100%;
}

.slot {
  & text {
    fill: $primary-text-dark;
    pointer-events: none;
    font-weight: 400;
  }

  &:hover {
    opacity: 0.7;
  }
}

figcaption {
  font-weight: bold;
  text-align: center;
}
</style>

<script>
const { getColorCircleSvgFragment } = require(`~/components/svg.vue`);
import Wheel from '~~/lib/model/Wheel.mjs';

export default {
  props: {
    wheel: {
      type: Wheel,
      required: true
    }
  },
  computed: {
    slotRadius() {
      return Math.min(70 / this.wheel.slots.length * 1.25, 18.5);
    },
    slotRotateRadius() {
      return -50 + this.slotRadius + 3;
    },
    slotRotateAngle() {
      return 360 / this.wheel.slots.length * (this.wheel.direction === `CCW` ? -1 : 1);
    },
    slotSvgFragments() {
      return this.wheel.slots.map(slot => {
        if (slot.colors !== null) {
          return getColorCircleSvgFragment(slot.colors, this.slotRadius);
        }

        return null;
      });
    }
  }
};
</script>
