<template>
  <div class="matrix">
    <section class="structure">
      <div v-for="(zLevel, zIndex) of matrix.pixelKeyStructure" :key="zIndex" class="z-level">
        <div v-for="(row, yIndex) of zLevel" :key="yIndex" class="row">
          <div
            v-for="(pixelKey, xIndex) of row"
            :key="xIndex"
            :style="pixelSizing"
            :class="{ pixel: true, highlight: highlightedPixelKeys.includes(pixelKey) }">{{ pixelKey || '' }}</div>
        </div>
      </div>
      <span class="hint">Front view</span>
    </section>

    <section v-if="pixelGroups.length > 0" class="pixel-groups">
      <h4>Pixel groups</h4>
      <span class="hint only-js">Hover over the pixel groups to highlight the corresponding pixels.</span>

      <div>
        <LabeledValue
          v-for="[key, value] of pixelGroups"
          :key="key"
          :label="key"
          :value="value"
          name="pixel-group"
          @mouseover="highlightedPixelKeys = matrix.pixelGroups[key]"
          @mouseout="highlightedPixelKeys = []" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.z-level {
  border-collapse: collapse;
  border-spacing: 0;
  overflow: auto;
  padding-top: 1px;
  padding-left: 1px;
  margin-bottom: 8px;
}

.row {
  display: block;
  margin-top: -1px;
  white-space: nowrap;
}

.pixel {
  display: inline-block;
  display: -ms-inline-flexbox;
  display: inline-flex;
  -ms-flex-pack: center;
  justify-content: center;
  -ms-flex-align: center;
  align-items: center;
  line-height: 1.4em;
  text-align: center;
  margin-left: -1px;
  vertical-align: top;
  font-size: 90%;
  border: 1px solid transparent;
  white-space: normal;
  transition: background-color 0.2s;

  &:not(:empty) {
    border-color: theme-color(icon-inactive);
    background-color: theme-color(card-background);
  }

  &.highlight {
    background-color: theme-color(divider);
  }
}

.pixel-groups > div {
  max-height: 32vh;
  overflow: auto;
}
</style>

<script>
import Matrix from '../../../lib/model/Matrix.js';
import Physical from '../../../lib/model/Physical.js';

import LabeledValue from '../LabeledValue.vue';

export default {
  components: {
    LabeledValue,
  },
  props: {
    matrix: {
      type: Matrix,
      required: true,
    },
    physical: {
      type: Physical,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      highlightedPixelKeys: [],
      baseHeight: 3.2, // in em
    };
  },
  computed: {
    pixelSizing() {
      let sizing = `height: ${this.baseHeight}em; `;

      if (this.physical !== null && this.physical.hasMatrixPixels) {
        const scale = this.baseHeight / this.physical.matrixPixelsDimensions[1];
        sizing += `width: ${this.physical.matrixPixelsDimensions[0] * scale}em; `;
        sizing += `margin-right: ${this.physical.matrixPixelsSpacing[0] * scale}em; `;
        sizing += `margin-bottom: ${this.physical.matrixPixelsSpacing[1] * scale}em; `;
      }
      else {
        sizing += `width: ${this.baseHeight}em; `;
      }

      return sizing;
    },

    pixelGroups() {
      return this.matrix.pixelGroupKeys.map(groupKey => {
        const group = this.matrix.jsonObject.pixelGroups[groupKey];
        const resolvedPixelsKeys = this.matrix.pixelGroups[groupKey];

        if (group === `all`) {
          return [groupKey, `All pixels`];
        }

        const constraintAxes = [`x`, `y`, `z`].filter(axis => axis in group);

        const shouldShowPixelKeyArray = Array.isArray(group) || resolvedPixelsKeys.length <= 5 || constraintAxes.some(
          axis => group[axis].some(constraint => /^\d+n/.test(constraint)),
        ) || constraintAxes.length > 2 || `name` in group;

        if (shouldShowPixelKeyArray) {
          return [groupKey, resolvedPixelsKeys.join(`, `)];
        }

        const constraintTexts = constraintAxes.map(axis => {
          const axisConstraints = group[axis].map(
            constraint => constraint.replace(`>=`, `≥ `).replace(`<=`, `≤ `).replace(`=`, ``),
          );

          return `${axis.toUpperCase()} coordinate is ${axisConstraints.join(`, `)}`;
        });

        return [groupKey, `Pixels where ${constraintTexts.join(` and `)}`];
      });
    },
  },
};
</script>
