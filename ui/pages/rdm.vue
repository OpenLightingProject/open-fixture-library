<template>
  <div>
    <template v-if="searchFor === `nothing`">

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

      <template v-if="notFound === `fixture`">
        <p>The requested <a :href="`/${manufacturerKey}`">{{ manufacturerName }}</a> fixture was not found in the Open Fixture Library. Maybe a fixture in the library is missing the RDM ID? It may be included in the <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&amp;model=${modelId}`">Open Lighting RDM database</a>.</p>
        <p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <NuxtLink :to="prefilledFixtureEditorUrl">add it yourself</NuxtLink>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else-if="searchFor === `fixture`">
        <p>The manufacturer of the requested fixture was not found in the Open Fixture Library. The fixture may be included in the <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&amp;model=${modelId}`">Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name and manufacturer of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <NuxtLink :to="prefilledFixtureEditorUrl">add it yourself</NuxtLink>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else>
        <p>The requested manufacturer was not found in the Open Fixture Library. It may be included in the <a :href="`http://rdm.openlighting.org/manufacturer/display?manufacturer=${manufacturerId}`">Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the manufacturer. Include the full manufacturer name and mention RDM ID <b>{{ manufacturerId }}</b>. Thank you!</p>
      </template>

    </template>
  </div>
</template>

<script>
import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    LabeledInput,
  },
  async asyncData({ query, $axios, redirect, error }) {
    const manufacturerId = parseIntOrNull(query.manufacturerId);

    if (manufacturerId === null) {
      return {
        notFound: null,
        searchFor: 'nothing',
        manufacturerId: null,
        manufacturerKey: null,
        manufacturerName: null,
        modelId: null,
      };
    }

    const modelId = parseIntOrNull(query.modelId);
    const personalityIndex = parseIntOrNull(query.personalityIndex);

    let rdmLookup;
    try {
      rdmLookup = await $axios.$get('/api/v1/rdm', {
        params: {
          manufacturerId,
          ...(modelId !== null && { modelId }),
        },
      });
    }
    catch (requestError) {
      return error(requestError);
    }

    if (rdmLookup.manufacturerKey === null) {
      return {
        notFound: 'manufacturer',
        searchFor: modelId === null ? 'manufacturer' : 'fixture',
        manufacturerId,
        manufacturerKey: null,
        manufacturerName: null,
        modelId,
      };
    }

    if (modelId === null || rdmLookup.fixtureKey !== null) {
      return redirectToCorrectPage(rdmLookup, personalityIndex, redirect);
    }

    return {
      notFound: 'fixture',
      searchFor: 'fixture',
      manufacturerId,
      manufacturerKey: rdmLookup.manufacturerKey,
      manufacturerName: rdmLookup.manufacturerName,
      modelId,
    };
  },
  head() {
    const title = 'RDM Lookup';

    return {
      title,
      meta: [
        {
          hid: 'title',
          content: title,
        },
      ],
    };
  },
  computed: {
    prefilledFixtureEditorUrl() {
      if (this.searchFor !== 'fixture') {
        return '/fixture-editor';
      }

      const shouldUseExistingManufacturer = this.manufacturerKey !== null;

      const prefillObject = {
        useExistingManufacturer: shouldUseExistingManufacturer,
        manufacturerKey: shouldUseExistingManufacturer ? this.manufacturerKey : undefined,
        newManufacturerRdmId: shouldUseExistingManufacturer ? undefined : this.manufacturerId,
        rdmModelId: this.modelId,
      };

      return `/fixture-editor?prefill=${encodeURIComponent(JSON.stringify(prefillObject))}`;
    },
  },
  watchQuery: ['manufacturerId', 'modelId', 'personalityIndex'],
  methods: {
    onSubmit(event) {
      this.$router.push({
        path: this.$route.path,
        query: Object.fromEntries(new FormData(event.target)),
      });
    },
  },
};

/**
 * @param {string | undefined} string - The string to parse.
 * @returns {number | null} The parsed number, or null if the string can't be parsed.
 */
function parseIntOrNull(string) {
  const number = Number.parseInt(string, 10);
  return Number.isNaN(number) ? null : number;
}

/**
 * @param {object} rdmLookup - The API result matching the provided RDM IDs.
 * @param {number | null} personalityIndex - The provided RDM personality index, or null.
 * @param {(code: number, path: string) => void} redirect - The redirect function to be called.
 */
function redirectToCorrectPage(rdmLookup, personalityIndex, redirect) {
  if (rdmLookup.fixtureKey === null) {
    redirect(301, `/${rdmLookup.manufacturerKey}`);
    return;
  }

  const locationHash = personalityIndex === null ? '' : `#rdm-personality-${personalityIndex}`;

  redirect(301, `/${rdmLookup.manufacturerKey}/${rdmLookup.fixtureKey}${locationHash}`);
}
</script>
