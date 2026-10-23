<template>
  <div>
    <template v-if="searchFor === 'nothing'">

      <h1>RDM Lookup</h1>

      <p>Find a fixture definition or manufacturer by entering its RDM IDs.</p>

      <form action="/rdm" method="get" @submit.prevent="onSubmit($event)">
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
interface RdmLookup {
  manufacturerKey: string | null;
  manufacturerName: string | null;
  fixtureKey: string | null;
}

definePageMeta({
  key: route => route.fullPath,
});

const route = useRoute();
const router = useRouter();

const manufacturerId = parseIntOrNull(route.query.manufacturerId as string | undefined);
const modelId = parseIntOrNull(route.query.modelId as string | undefined);
const personalityIndex = parseIntOrNull(route.query.personalityIndex as string | undefined);

const notFound = ref<string | null>(null);
const searchFor = ref<string>('nothing');
const manufacturerKey = ref<string | null>(null);
const manufacturerName = ref<string | null>(null);

if (manufacturerId !== null) {
  const { data: rdmLookup, error } = await useFetch<RdmLookup>('/api/v1/rdm', {
    query: {
      manufacturerId,
      ...(modelId !== null && { modelId }),
    },
  });

  if (error.value) {
    throw createError({
      statusCode: error.value.statusCode ?? 500,
      statusMessage: 'RDM lookup failed',
    });
  }

  if (rdmLookup.value?.manufacturerKey === null) {
    notFound.value = 'manufacturer';
    searchFor.value = modelId === null ? 'manufacturer' : 'fixture';
  }
  else if (modelId === null || rdmLookup.value?.fixtureKey !== null) {
    redirectToCorrectPage(rdmLookup.value as RdmLookup, personalityIndex);
  }
  else {
    notFound.value = 'fixture';
    searchFor.value = 'fixture';
    manufacturerKey.value = rdmLookup.value.manufacturerKey;
    manufacturerName.value = rdmLookup.value.manufacturerName;
  }
}

useHead({
  title: 'RDM Lookup',
});

const prefilledFixtureEditorUrl = computed(() => {
  if (searchFor.value !== 'fixture') {
    return '/fixture-editor';
  }

  const shouldUseExistingManufacturer = manufacturerKey.value !== null;

  const prefillObject = {
    useExistingManufacturer: shouldUseExistingManufacturer,
    manufacturerKey: shouldUseExistingManufacturer ? manufacturerKey.value : undefined,
    newManufacturerRdmId: shouldUseExistingManufacturer ? undefined : manufacturerId,
    rdmModelId: modelId,
  };

  return `/fixture-editor?prefill=${encodeURIComponent(JSON.stringify(prefillObject))}`;
});

function onSubmit(event: Event) {
  const form = event.target as HTMLFormElement;
  router.push({
    path: route.path,
    query: Object.fromEntries(new FormData(form).entries()) as Record<string, string>,
  });
}

/**
 * @param {string | undefined} string - The string to parse.
 * @returns {number | null} The parsed number, or null if the string can't be parsed.
 */
function parseIntOrNull(string: string | undefined): number | null {
  if (!string) {
    return null;
  }

  const number = Number.parseInt(string, 10);
  return Number.isNaN(number) ? null : number;
}

/**
 * @param {RdmLookup} rdmLookup - The API result matching the provided RDM IDs.
 * @param {number | null} personalityIndex - The provided RDM personality index, or null.
 */
function redirectToCorrectPage(rdmLookup: RdmLookup, personalityIndex: number | null) {
  if (rdmLookup.fixtureKey === null) {
    navigateTo(`/${rdmLookup.manufacturerKey}`, { redirectCode: 301 });
    return;
  }

  const locationHash = personalityIndex === null ? '' : `#rdm-personality-${personalityIndex}`;

  navigateTo(`/${rdmLookup.manufacturerKey}/${rdmLookup.fixtureKey}${locationHash}`, { redirectCode: 301 });
}
</script>
