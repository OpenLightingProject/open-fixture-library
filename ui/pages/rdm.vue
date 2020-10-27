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
        <p>The requested <a :href="manufacturerLink">{{ manufacturerName }}</a> fixture was not found in the Open Fixture Library. Maybe a fixture in the library is missing the RDM ID? It may be included in the <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&amp;model=${modelId}`">Open Lighting RDM database</a>.</p>
        <p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <NuxtLink :to="`/fixture-editor?prefill=${prefillQuery}`">add it yourself</NuxtLink>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else-if="searchFor === `fixture`">
        <p>The manufacturer of the requested fixture was not found in the Open Fixture Library. The fixture may be included in the <a :href="`http://rdm.openlighting.org/model/display?manufacturer=${manufacturerId}&amp;model=${modelId}`">Open Lighting RDM database</a>. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name and manufacturer of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <NuxtLink :to="`/fixture-editor?prefill=${prefillQuery}`">add it yourself</NuxtLink>!</p>
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
    const { manufacturerId, modelId, personalityIndex } = query;

    const manufacturerIdNumber = parseInt(manufacturerId, 10);
    const modelIdNumber = parseInt(modelId, 10);

    if (isEmpty(manufacturerId)) {
      return {
        notFound: null,
        searchFor: `nothing`,
      };
    }

    if (!(manufacturerId in register.rdm)) {
      if (isEmpty(modelId)) {
        return {
          notFound: `manufacturer`,
          searchFor: `manufacturer`,
          manufacturerId: manufacturerIdNumber,
        };
      }

      return {
        notFound: `manufacturer`,
        searchFor: `fixture`,
        manufacturerId: manufacturerIdNumber,
        modelId: modelIdNumber,
        prefillQuery: encodeURIComponent(JSON.stringify({
          useExistingManufacturer: false,
          newManufacturerRdmId: manufacturerIdNumber,
          rdmModelId: modelIdNumber,
        })),
      };
    }

    const manufacturer = register.rdm[manufacturerId];

    if (isEmpty(modelId) || modelId in register.rdm[manufacturerId].models) {
      return redirectToCorrectPage(manufacturer, modelId, personalityIndex, redirect);
    }

    try {
      const manufacturers = await $axios.$get(`/api/v1/manufacturers`);

      return {
        notFound: `fixture`,
        searchFor: `fixture`,
        manufacturerId: manufacturerIdNumber,
        manufacturerLink: `/${manufacturer.key}`,
        manufacturerName: manufacturers[manufacturer.key].name,
        modelId: modelIdNumber,
        prefillQuery: encodeURIComponent(JSON.stringify({
          useExistingManufacturer: true,
          manufacturerKey: manufacturer.key,
          rdmModelId: modelIdNumber,
        })),
      };
    }
    catch (requestError) {
      return error(requestError);
    }
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
};

/**
 * @param {*} queryParam Vue Router's query parameter to check.
 * @returns {Boolean} True if the query parameter is not specified or empty.
 */
function isEmpty(queryParam) {
  return queryParam === undefined || queryParam === ``;
}

/**
 * @param {Object} manufacturer The manufacturer object that matches the provided RDM manufacturer id.
 * @param {String|undefined} modelId The provided RDM model id, or undefined.
 * @param {String|undefined} personalityIndex The provided RDM personality index, or undefined.
 * @param {Function} redirect The redirect function to be called.
 */
function redirectToCorrectPage(manufacturer, modelId, personalityIndex, redirect) {
  if (isEmpty(modelId)) {
    redirect(301, `/${manufacturer.key}`);
    return;
  }

  const personalityIndexNumber = parseInt(personalityIndex, 10);
  const locationHash = isEmpty(personalityIndex) ? `` : `#rdm-personality-${personalityIndexNumber}`;

  redirect(301, `/${manufacturer.key}/${manufacturer.models[modelId]}${locationHash}`);
  return;
}


</script>
