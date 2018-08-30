<template>
  <div>
    <template v-if="searchFor === `nothing`">

      <h1>RDM Lookup</h1>

      <p>Find a fixture definition or manufacturer by entering its RDM IDs.</p>

      <form action="/rdm" method="get">
        <app-labeled-input label="Manufacturer ID">
          <input
            type="number"
            name="manufacturerId"
            min="0"
            max="65535"
            step="1"
            required>
        </app-labeled-input>

        <app-labeled-input
          label="Model ID"
          hint="Leave this field empty to find the manufacturer.">
          <input
            type="number"
            name="modelId"
            min="0"
            max="65535"
            step="1">
        </app-labeled-input>

        <app-labeled-input
          label="Personality index"
          hint="Optional.">
          <input
            type="number"
            name="personalityIndex"
            min="1"
            step="1">
        </app-labeled-input>

        <div class="button-bar">
          <button type="submit" class="primary">Lookup fixture / manufacturer</button>
        </div>
      </form>

    </template>
    <template v-else>

      <h1>RDM {{ searchFor }} not found</h1>

      <template v-if="notFound === `fixture`">
        <p>The requested <a :href="manufacturerLink">{{ manufacturerName }}</a> fixture was not found in the Open Fixture Library. Maybe a fixture in the library is missing the RDM ID?</p>
        <p>Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <nuxt-link :to="`/fixture-editor?prefill=${prefillQuery}`">add it yourself</nuxt-link>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else-if="searchFor === `fixture`">
        <p>The manufacturer of the requested fixture was not found in the Open Fixture Library. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the fixture. Include the name and manufacturer of the requested fixture and mention RDM IDs <b>{{ manufacturerId }} / {{ modelId }}</b>. Or you can <nuxt-link :to="`/fixture-editor?prefill=${prefillQuery}`">add it yourself</nuxt-link>!</p>
        <p>Thank you either way!</p>
      </template>

      <template v-else>
        <p>The requested manufacturer was not found in the Open Fixture Library. Please consider <a href="https://github.com/OpenLightingProject/open-fixture-library/issues">filing a bug</a> to suggest adding the manufacturer. Include the full manufacturer name and mention RDM ID <b>{{ manufacturerId }}</b>. Thank you!</p>
      </template>

    </template>
  </div>
</template>

<script>
import labeledInputVue from '~/components/labeled-input.vue';

import register from '~~/fixtures/register.json';
import manufacturers from '~~/fixtures/manufacturers.json';

export default {
  components: {
    'app-labeled-input': labeledInputVue
  },
  head() {
    return {
      title: `RDM Lookup`
    };
  },
  async asyncData({ query, redirect }) {
    const { manufacturerId, modelId, personalityIndex } = query;

    if (isEmpty(manufacturerId)) {
      return {
        notFound: null,
        searchFor: `nothing`
      };
    }

    if (!(manufacturerId in register.rdm)) {
      if (isEmpty(modelId)) {
        return {
          notFound: `manufacturer`,
          searchFor: `manufacturer`,
          manufacturerId: manufacturerId
        };
      }

      return {
        notFound: `manufacturer`,
        searchFor: `fixture`,
        manufacturerId: manufacturerId,
        modelId: modelId,
        prefillQuery: encodeURIComponent(JSON.stringify({
          useExistingManufacturer: false,
          newManufacturerRdmId: parseInt(manufacturerId),
          rdmModelId: parseInt(modelId)
        }))
      };
    }

    const manufacturer = register.rdm[manufacturerId];

    if (isEmpty(modelId)) {
      redirect(301, `/${manufacturer.key}`);
      return {};
    }

    if (modelId in register.rdm[manufacturerId].models) {
      const locationHash = isEmpty(personalityIndex) ? `` : `#rdm-personality-${personalityIndex}`;

      redirect(301, `/${manufacturer.key}/${manufacturer.models[modelId]}${locationHash}`);
      return {};
    }

    return {
      notFound: `fixture`,
      searchFor: `fixture`,
      manufacturerId: manufacturerId,
      manufacturerLink: `/${manufacturer.key}`,
      manufacturerName: manufacturers[manufacturer.key].name,
      modelId: modelId,
      prefillQuery: encodeURIComponent(JSON.stringify({
        useExistingManufacturer: true,
        manufacturerShortName: manufacturer.key,
        rdmModelId: parseInt(modelId)
      }))
    };
  }
};

/**
 * @param {*} queryParam Vue Router's query parameter to check.
 * @returns {!boolean} True if the query parameter is not specified or empty.
 */
function isEmpty(queryParam) {
  return queryParam === undefined || queryParam === ``;
}


</script>
