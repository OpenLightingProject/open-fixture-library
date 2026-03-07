<template>
  <div class="matrix">
    <section class="structure">
      <div v-for="(zLevel, zIndex) of matrix.pixelKeyStructure" :key="zIndex" class="z-level">
        <div v-for="(row, yIndex) of zLevel" :key="yIndex" class="row">
          <div
            v-for="(pixelKey, xIndex) of row"
            :key="xIndex"
            :style="pixelSizing"
            class="pixel"
            :class="{ highlight: highlightedPixelKeys.includes(pixelKey) }">{{ pixelKey || '' }}</div>
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
          tabindex="0"
          @mouseover="highlightedPixelKeys = matrix.pixelGroups[key]"
          @focusin="highlightedPixelKeys = matrix.pixelGroups[key]"
          @mouseout="highlightedPixelKeys = []"
          @focusout="highlightedPixelKeys = []" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.z-level {
  padding-top: 1px;
  padding-left: 1px;
  margin-bottom: 8px;
  overflow: auto;
  border-spacing: 0;
  border-collapse: collapse;
}

.row {
  display: block;
  margin-top: -1px;
  white-space: nowrap;
}

.pixel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: -1px;
  font-size: 90%;
  line-height: 1.4em;
  vertical-align: top;
  text-align: center;
  white-space: normal;
  border: 1px solid transparent;
  transition: background-color 0.2s;

  &:not(:empty) {
    background-color: theme-color(card-background);
    border-color: theme-color(icon-inactive);
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

<script setup lang="ts">
import Matrix from '~~/lib/model/Matrix.js';
import Physical from '~~/lib/model/Physical.js';

interface Props {
  matrix: Matrix;
  physical?: Physical | null;
}

const props = defineProps<Props>();

const highlightedPixelKeys = ref<string[]>([]);
const baseHeight = 3.2;

const pixelSizing = computed(() => {
  let sizing = `height: ${baseHeight}em; `;

  if (props.physical?.hasMatrixPixels) {
    const scale = baseHeight / props.physical.matrixPixelsDimensions[1];
    sizing += `width: ${props.physical.matrixPixelsDimensions[0] * scale}em; `;
    sizing += `margin-right: ${props.physical.matrixPixelsSpacing[0] * scale}em; `;
    sizing += `margin-bottom: ${props.physical.matrixPixelsSpacing[1] * scale}em; `;
  }
  else {
    sizing += `width: ${baseHeight}em; `;
  }

  return sizing;
});

const pixelGroups = computed(() => {
  return props.matrix.pixelGroupKeys.map(groupKey => {
    const group = props.matrix.jsonObject.pixelGroups[groupKey];
    const resolvedPixelsKeys = props.matrix.pixelGroups[groupKey];

    if (group === `all`) {
      return [groupKey, `All pixels`];
    }

    const constraintAxes = [`x`, `y`, `z`].filter(axis => axis in group);

    const shouldShowPixelKeyArray = Array.isArray(group) || resolvedPixelsKeys.length <= 5 || constraintAxes.some(
      axis => group[axis].some((constraint: string) => /^\d+n/.test(constraint)),
    ) || constraintAxes.length > 2 || `name` in group;

    if (shouldShowPixelKeyArray) {
      return [groupKey, resolvedPixelsKeys.join(`, `)];
    }

    const constraintText = constraintAxes.map(axis => {
      const axisConstraints = (group[axis] as string[]).map(
        constraint => constraint.replace(`>=`, `≥ `).replace(`<=`, `≤ `).replace(`=`, ``),
      ).join(`, `);

      return `${axis.toUpperCase()} coordinate is ${axisConstraints}`;
    }).join(` and `);

    return [groupKey, `Pixels where ${constraintText}`];
  });
});
</script>
