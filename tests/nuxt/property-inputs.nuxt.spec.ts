import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import LabeledInput from '~/components/LabeledInput.vue';
import PropertyInputEntity from '~/components/PropertyInputEntity.vue';
import PropertyInputNumber from '~/components/PropertyInputNumber.vue';
import { useEditorForm } from '~/composables/useEditorForm';
import type { EditorFormApi } from '~/composables/useEditorForm';

describe('PropertyInputNumber', () => {
  it('emits validation data that matches the rendered data-exclusive-* attributes', async () => {
    const wrapper = await mountSuspended(PropertyInputNumber, {
      props: {
        schemaProperty: {
          type: 'number',
          exclusiveMinimum: 5,
          exclusiveMaximum: 9,
        },
        modelValue: 7,
        name: 'test-number',
      },
    });

    const input = wrapper.find('input');
    expect(input.attributes('data-exclusive-minimum')).toBe('5');
    expect(input.attributes('data-exclusive-maximum')).toBe('9');

    const emitted = wrapper.emitted('vf:validate');
    expect(emitted).toBeDefined();
    const validationData = emitted?.at(-1)?.[0] as Record<string, string | null>;
    expect(validationData['data-exclusive-minimum']).toBe(input.attributes('data-exclusive-minimum'));
    expect(validationData['data-exclusive-maximum']).toBe(input.attributes('data-exclusive-maximum'));
  });

  it('keeps the v-model contract', async () => {
    const wrapper = await mountSuspended(PropertyInputNumber, {
      props: {
        schemaProperty: { type: 'number' },
        modelValue: 1,
      },
      attachTo: document.body,
    });

    const input = wrapper.find('input');
    (input.element as HTMLInputElement).focus();
    (input.element as HTMLInputElement).value = '42';
    await input.trigger('input');
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([42]);
  });
});

describe('PropertyInputEntity', () => {
  const entitySchema = {
    oneOf: [
      { enum: ['center', 'left'] },
      { $ref: '#/units/meters' },
      { $ref: '#/units/seconds' },
    ],
  };

  it('emits the selected unit and updated value when the unit changes', async () => {
    const wrapper = await mountSuspended(PropertyInputEntity, {
      props: {
        name: 'position',
        formstate: {},
        schemaProperty: entitySchema,
        modelValue: '2m',
        associatedEntity: '2m',
      },
    });

    await wrapper.find('select').setValue('seconds');

    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual(['2s']);
    expect(wrapper.emitted('unit-selected')?.at(-1)).toEqual(['s']);
  });

  it('reports entities-have-same-units after a unit change mismatches the associated entity', async () => {
    let form: EditorFormApi | undefined;
    const entityValue = ref<string | number | null>('3s');
    const associatedValue = '3s';

    const Wrapper = defineComponent({
      setup() {
        form = useEditorForm();

        return () => h(LabeledInput, { name: 'position', label: 'Position', formstate: {} }, {
          default: () => h(PropertyInputEntity, {
            name: 'position',
            formstate: {},
            schemaProperty: entitySchema,
            modelValue: entityValue.value,
            associatedEntity: associatedValue,
            ['onUpdate:modelValue']: (value: string | number | null) => {
              entityValue.value = value;
            },
          }),
        });
      },
    });

    const wrapper = await mountSuspended(Wrapper);
    await flushPromises();

    // Same unit is valid.
    await form?.submit();
    expect(form?.errors.value.position).toBeUndefined();

    // Then change it to meters, while the associated entity stays in seconds.
    await wrapper.find('select').setValue('meters');
    await nextTick();
    await flushPromises();
    await form?.submit();
    expect(form?.errors.value.position).toBe('entities-have-same-units');

    // Change the entity unit back to seconds so both entities share it again.
    await wrapper.find('select').setValue('seconds');
    await nextTick();
    await flushPromises();
    await form?.submit();
    expect(form?.errors.value.position).toBeUndefined();
  });
});
