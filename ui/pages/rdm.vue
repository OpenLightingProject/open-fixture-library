<template>
  <div>
    <template v-if="searchFor === 'nothing'">

      <h1>RDM Lookup</h1>

      <p>Find a fixture definition or manufacturer by entering its RDM IDs.</p>

      <form action="/rdm" method="get">
        <LabeledInput label="Manufacturer ID">
          <input
            type="number"
            name="manufacturerId"
            min="0"
            max="65535"
            step="1"
            required>
        </LabeledInput>

        <LabeledInput
          label="Model ID"
          hint="Leave this field empty to find the manufacturer.">
          <input
            type="number"
            name="modelId"
            min="0"
            max="65535"
            step="1">
        </LabeledInput>

        <LabeledInput
          label="Personality index"
          hint="Optional.">
          <input
            type="number"
            name="personalityIndex"
            min="1"
            step="1">
        </LabeledInput>

        <div class="button-bar">
          <button type="submit" class="primary">Lookup fixture / manufacturer</button>
        </div>
      </form>

    </template>
    <template v-else>

      <h1>RDM {{ searchFor }} not found</h1>

      <template v-if="notFound === 'fixture'">
        <p>The requested <a :href="`/${manufacturerKey}`">{{ manufacturerName }}</a> fixture was not found in the Open Fixture Library. Maybe a fixture in the library is missing the RDM ID? It may be included in the <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&amp;model=${modelId}`">Open Lighting RDM database</a>.</p>
        <p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <NuxtLink :to="prefilledFixtureEditorUrl">add it yourself</NuxtLink>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else-if="searchFor === 'fixture'">
        <p>The manufacturer of the requested fixture was not found in the Open Fixture Library. The fixture may be included in the <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&amp;model=${modelId}`">Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name and manufacturer of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <NuxtLink :to="prefilledFixtureEditorUrl">add it yourself</NuxtLink>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else>
        <p>The requested manufacturer was not found in the Open Fixture Library. It may be included in the <a :href="`http://rdm.openlighting.org/manufacturer/display?manufacturer=${manufacturerId}`">Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the manufacturer. Include the full manufacturer name and mention RDM ID <b>{{ manufacturerId }}</b>. Thank you!</p>
      </template>

    </template>
  </div>
</template>

<script setup lang="ts">
import register from '~~/fixtures/register.json';

const route = useRoute();

const manufacturerId = parseIntOrUndefined(route.query.manufacturerId as string);
const modelId = parseIntOrUndefined(route.query.modelId as string);
const personalityIndex = parseIntOrUndefined(route.query.personalityIndex as string);

const notFound = ref<string | null>(null);
const searchFor = ref<string>('nothing');
const manufacturerKey = ref<string | undefined>();
const manufacturerName = ref<string>('');
const modelIdRef = ref<number | undefined>();

if (manufacturerId !== undefined) {
  if (!(String(manufacturerId) in register.rdm)) {
    notFound.value = 'manufacturer';
    searchFor.value = modelId === undefined ? 'manufacturer' : 'fixture';
    manufacturerId; // keep for template
    modelIdRef.value = modelId;
  }
  else {
    const rdmManufacturer = register.rdm[String(manufacturerId)];

    if (modelId === undefined || String(modelId) in rdmManufacturer.models) {
      if (modelId === undefined) {
        navigateTo(`/${rdmManufacturer.key}`, { redirectCode: 301 });
      }
      else {
        const locationHash = personalityIndex === undefined ? '' : `#rdm-personality-${personalityIndex}`;
        navigateTo(`/${rdmManufacturer.key}/${rdmManufacturer.models[String(modelId)]}${locationHash}`, { redirectCode: 301 });
      }
    }
    else {
      const { data: manufacturers } = await useFetch('/api/v1/manufacturers');

      notFound.value = 'fixture';
      searchFor.value = 'fixture';
      manufacturerKey.value = rdmManufacturer.key;
      manufacturerName.value = manufacturers.value?.[rdmManufacturer.key]?.name ?? '';
      modelIdRef.value = modelId;
    }
  }
}

const prefilledFixtureEditorUrl = computed(() => {
  if (searchFor.value !== 'fixture') {
    return '/fixture-editor';
  }

  const useExistingManufacturer = manufacturerKey.value !== undefined;

  const prefillObject = {
    useExistingManufacturer,
    manufacturerKey: useExistingManufacturer ? manufacturerKey.value : undefined,
    newManufacturerRdmId: useExistingManufacturer ? undefined : manufacturerId,
    rdmModelId: modelIdRef.value,
  };

  return `/fixture-editor?prefill=${encodeURIComponent(JSON.stringify(prefillObject))}`;
});

useHead({
  title: 'RDM Lookup',
});

function parseIntOrUndefined(string: string | undefined | null): number | undefined {
  if (!string) return undefined;
  const number = Number.parseInt(string, 10);
  return Number.isNaN(number) ? undefined : number;
}
</script>
