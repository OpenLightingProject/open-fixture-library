<template>
  <div class="physical">

    <section v-if="physical.dimensions !== null" class="dimensions">
      <span class="label">Dimensions</span>
      <span class="value">
        {{ physical.width }} &times;
        {{ physical.height }} &times;
        {{ physical.depth }}mm
        <span class="hint">width &times; height &times; depth</span>
      </span>
    </section>

    <section v-if="physical.weight !== null" class="weight">
      <span class="label">Weight</span>
      <span class="value">{{ physical.weight }}kg</span>
    </section>

    <section v-if="physical.power !== null" class="power">
      <span class="label">Power</span>
      <span class="value">{{ physical.power }}W</span>
    </section>

    <section v-if="physical.DMXconnector !== null" class="DMXconnector">
      <span class="label">DMX connector</span>
      <span class="value">{{ physical.DMXconnector }}</span>
    </section>

    <section v-if="physical.hasBulb" class="bulb">
      <h4>Bulb</h4>

      <section v-if="physical.bulbType !== null" class="bulb-type">
        <span class="label">Bulb type</span>
        <span class="value">{{ physical.bulbType }}</span>
      </section>

      <section v-if="physical.bulbColorTemperature !== null" class="bulb-colorTemperature">
        <span class="label">Color temperature</span>
        <span class="value">{{ physical.bulbColorTemperature }}K</span>
      </section>

      <section v-if="physical.bulbLumens !== null" class="bulb-lumens">
        <span class="label">Lumens</span>
        <span class="value">{{ physical.bulbLumens }}lm</span>
      </section>
    </section>

    <section v-if="physical.hasLens" class="lens">
      <h4>Lens</h4>

      <section v-if="physical.lensName !== null" class="lens-name">
        <span class="label">Name</span>
        <span class="value">{{ physical.lensName }}</span>
      </section>

      <section v-if="physical.lensDegreesMin !== null" class="lens-degreesMinMax">
        <span class="label">Light cone</span>
        <span class="value">{{ physical.lensDegreesMin }} … {{ physical.lensDegreesMax }}°</span>
      </section>
    </section>

    <section v-if="physical.hasFocus" class="focus">
      <h4>Focus</h4>

      <section v-if="physical.focusType !== null" class="focus-type">
        <span class="label">Type</span>
        <span class="value">{{ physical.focusType }}</span>
      </section>

      <section v-if="physical.focusPanMax !== null" class="focus-panMax">
        <span class="label">Max. Pan angle</span>
        <span class="value">{{ physical.focusPanMax }}°</span>
      </section>

      <section v-if="physical.focusTiltMax !== null" class="focus-tiltMax">
        <span class="label">Max. Tilt angle</span>
        <span class="value">{{ physical.focusTiltMax }}°</span>
      </section>
    </section>

    <section v-if="physical.hasMatrixPixels" class="matrixPixels">
      <h4>Matrix Pixels</h4>

      <section v-if="physical.matrixPixelsDimensions !== null" class="dimensions">
        <span class="label">Pixel dimensions</span>
        <span class="value">
          {{ physical.matrixPixelsDimensions[0] }} &times;
          {{ physical.matrixPixelsDimensions[1] }} &times;
          {{ physical.matrixPixelsDimensions[2] }}mm
          <span class="hint">width &times; height &times; depth</span>
        </span>
      </section>

      <section v-if="physical.matrixPixelsSpacing !== null" class="dimensions">
        <span class="label">Pixel spacing</span>
        <span class="value">
          {{ physical.matrixPixelsSpacing[0] }} &times;
          {{ physical.matrixPixelsSpacing[1] }} &times;
          {{ physical.matrixPixelsSpacing[2] }}mm
          <span class="hint">left/right &times; top/bottom &times; ahead/aback</span>
        </span>
      </section>
    </section>

  </div>
</template>

<style lang="scss" scoped>
.physical {
  columns: 2 350px;
  column-gap: 3rem;

  & section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>


<script>
import Physical from '~~/lib/model/Physical.mjs';

export default {
  props: {
    physical: {
      type: Physical,
      required: true
    }
  }
};
</script>
