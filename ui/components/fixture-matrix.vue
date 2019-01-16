<template>
  <div class="matrix">
    <section class="structure">
      <div v-for="(zLevel, zIndex) in matrix.pixelKeyStructure" :key="zIndex" class="z-level">
        <div v-for="(row, yIndex) in zLevel" :key="yIndex" class="row">
          <div
            v-for="(pixelKey, xIndex) in row"
            :key="xIndex"
            :style="pixelSizing"
            :class="{ pixel: true, highlight: highlightedPixelKeys.includes(pixelKey) }">{{ pixelKey || '' }}</div>
        </div>
      </div>
      <span class="hint">Front view</span>
    </section>

    <section v-if="matrix.pixelGroupKeys.length > 0" class="pixel-groups">
      <h4>Pixel groups</h4>
      <span class="hint only-js">Hover over the pixel groups to highlight the corresponding pixels.</span>

      <app-labeled-value
        v-for="key in matrix.pixelGroupKeys"
        :key="key"
        :label="key"
        :value="matrix.pixelGroups[key].join(`, `)"
        name="pixel-group"
        @mouseover.native="highlightedPixelKeys = matrix.pixelGroups[key]"
        @mouseout.native="highlightedPixelKeys = []" />
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
    border-color: $icon-inactive-dark;
    background-color: #fff;
  }

  &.highlight {
    background-color: $divider-dark;
  }
}

.pixel-groups {
  max-height: 40vh;
  overflow: auto;
}
</style>


<script>
import labeledValueVue from '~/components/labeled-value.vue';

import Matrix from '~~/lib/model/Matrix.mjs';
import Physical from '~~/lib/model/Physical.mjs';

export default {
  components: {
    'app-labeled-value': labeledValueVue
  },
  props: {
    matrix: {
      type: Matrix,
      required: true
    },
    physical: {
      type: Physical,
      required: true
    }
  },
  data() {
    return {
      highlightedPixelKeys: [],
      baseHeight: 3.2 // in em
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
    }
  }
};
</script>
