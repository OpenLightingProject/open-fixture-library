<template>

  <div class="capability-type-data">

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-horizontalAngle`"
      label="Horizontal angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`verticalAngle`)"
        property-name="horizontalAngle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      multiple-inputs
      :name="`capability${capability.uuid}-verticalAngle`"
      label="Vertical angle">
      <EditorProportionalPropertySwitcher
        :capability="capability"
        :formstate="formstate"
        :required="isPropertyEmpty(`horizontalAngle`)"
        property-name="verticalAngle" />
    </LabeledInput>

    <LabeledInput
      :formstate="formstate"
      :name="`capability${capability.uuid}-comment`"
      label="Comment">
      <PropertyInputText
        v-model="capability.typeData.comment"
        :formstate="formstate"
        :name="`capability${capability.uuid}-comment`"
        :schema-property="schemaDefinitions.nonEmptyString" />
    </LabeledInput>

  </div>
</template>

<script setup lang="ts">
import { schemaDefinitions } from '~~/lib/schema-properties.js';

interface CapabilityTypeData {
  horizontalAngle?: string | null;
  horizontalAngleStart?: string;
  horizontalAngleEnd?: string;
  verticalAngle?: string | null;
  verticalAngleStart?: string;
  verticalAngleEnd?: string;
  comment?: string;
}

interface Properties {
  capability: {
    uuid: string;
    typeData: CapabilityTypeData;
  };
  formstate?: object;
}

const properties = defineProps<Properties>();

const hint = 'Only move the beam and not a visible physical part of the fixture. This is especially useful for lasers. Use Pan/Tilt for moving heads.';

const defaultData: CapabilityTypeData = {
  horizontalAngle: null,
  horizontalAngleStart: '',
  horizontalAngleEnd: '',
  verticalAngle: null,
  verticalAngleStart: '',
  verticalAngleEnd: '',
  comment: '',
};

/**
 * Checks whether a stepped or proportional property is still empty.
 * @param property - The type data property name.
 * @returns Whether both variants are empty.
 */
function isPropertyEmpty(property: string): boolean {
  const typeData = properties.capability.typeData;
  const propertyKey = property as keyof CapabilityTypeData;
  const startKey = `${property}Start` as keyof CapabilityTypeData;

  const isSteppedEmpty = typeData[propertyKey] === null || typeData[propertyKey] === '';
  const isProportionalEmpty = typeData[startKey] === null || typeData[startKey] === '';

  return isSteppedEmpty && isProportionalEmpty;
}

defineExpose({
  defaultData,
  hint,
});
</script>
