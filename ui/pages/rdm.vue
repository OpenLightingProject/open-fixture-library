<template>
  <div>
    <template v-if="searchFor === `nothing`">

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
import register from '../../fixtures/register.json';

import LabeledInput from '../components/LabeledInput.vue';

export default {
  components: {
    LabeledInput,
  },
  async asyncData({ query, $axios, redirect, error }) {
    const manufacturerId = parseIntOrUndefined(query.manufacturerId);
    const modelId = parseIntOrUndefined(query.modelId);
    const personalityIndex = parseIntOrUndefined(query.personalityIndex);

    if (manufacturerId === undefined) {
      return {
        notFound: null,
        searchFor: `nothing`,
      };
    }

    if (!(String(manufacturerId) in register.rdm)) {
      return {
        notFound: `manufacturer`,
        searchFor: modelId === undefined ? `manufacturer` : `fixture`,
        manufacturerId,
        modelId,
      };
    }

    const rdmManufacturer = register.rdm[String(manufacturerId)];

    if (modelId === undefined || String(modelId) in rdmManufacturer.models) {
      return redirectToCorrectPage(rdmManufacturer, modelId, personalityIndex, redirect);
    }

    let manufacturers;
    try {
      manufacturers = await $axios.$get(`/api/v1/manufacturers`);
    }
    catch (requestError) {
      return error(requestError);
    }

    return {
      notFound: `fixture`,
      searchFor: `fixture`,
      manufacturerId,
      manufacturerKey: rdmManufacturer.key,
      manufacturerName: manufacturers[rdmManufacturer.key].name,
      modelId,
    };
  },
  head() {
    const title = `RDM Lookup`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title,
        },
      ],
    };
  },
  computed: {
    prefilledFixtureEditorUrl() {
      if (this.searchFor !== `fixture`) {
        return `/fixture-editor`;
      }

      const useExistingManufacturer = this.manufacturerKey !== undefined;

      const prefillObject = {
        useExistingManufacturer,
        manufacturerKey: useExistingManufacturer ? this.manufacturerKey : undefined,
        newManufacturerRdmId: useExistingManufacturer ? undefined : this.manufacturerId,
        rdmModelId: this.modelId,
      };

      return `/fixture-editor?prefill=${encodeURIComponent(JSON.stringify(prefillObject))}`;
    },
  },
};

/**
 * @param {string | undefined} string The string to parse.
 * @returns {number | undefined} The parsed number, or undefined if the string can't be parsed.
 */
function parseIntOrUndefined(string) {
  const number = Number.parseInt(string, 10);
  return Number.isNaN(number) ? undefined : number;
}

/**
 * @param {object} rdmManufacturer The manufacturer object that matches the provided RDM manufacturer id.
 * @param {number | undefined} modelId The provided RDM model id, or undefined.
 * @param {number | undefined} personalityIndex The provided RDM personality index, or undefined.
 * @param {Function} redirect The redirect function to be called.
 */
function redirectToCorrectPage(rdmManufacturer, modelId, personalityIndex, redirect) {
  if (modelId === undefined) {
    redirect(301, `/${rdmManufacturer.key}`);
    return;
  }

  const locationHash = personalityIndex === undefined ? `` : `#rdm-personality-${personalityIndex}`;

  redirect(301, `/${rdmManufacturer.key}/${rdmManufacturer.models[String(modelId)]}${locationHash}`);
}
</script>
