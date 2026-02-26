<template>
  <div>
    <FixtureHeader>
      <template #title>
        <h1>
          <NuxtLink :to="`/${manufacturerKey}`">{{ fixture.manufacturer.name }}</NuxtLink>
          {{ fixture.name }}
          <code v-if="fixture.hasShortName">{{ fixture.shortName }}</code>
        </h1>

        <section class="fixture-meta">
          <span class="last-modify-date">Last modified:&nbsp;<OflTime :date="fixture.meta.lastModifyDate" /></span>
          <span class="create-date">Created:&nbsp;<OflTime :date="fixture.meta.createDate" /></span>
          <span class="authors">Author{{ fixture.meta.authors.length === 1 ? `` : `s` }}:&nbsp;{{ fixture.meta.authors.join(`, `) }}</span>
          <span class="source"><a :href="`${githubRepoPath}/blob/${branch}/fixtures/${manufacturerKey}/${fixtureKey}.json`">Source</a></span>
          <span class="revisions"><a :href="`${githubRepoPath}/commits/${branch}/fixtures/${manufacturerKey}/${fixtureKey}.json`">Revisions</a></span>

          <ConditionalDetails v-if="fixture.meta.importPlugin !== null">
            <template #summary>
              Imported using the <NuxtLink :to="`/about/plugins/${fixture.meta.importPlugin}`">{{ plugins.data[fixture.meta.importPlugin].name }} plugin</NuxtLink> on <OflTime :date="fixture.meta.importDate" />.
            </template>
            <span v-if="fixture.meta.hasImportComment">{{ fixture.meta.importComment }}</span>
          </ConditionalDetails>
        </section>
      </template>

      <DownloadButton :fixture-key="`${manufacturerKey}/${fixtureKey}`" show-help />
    </FixtureHeader>

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <FixturePage
      :fixture="fixture"
      :load-all-modes="'loadAllModes' in route.query"
      @help-wanted-clicked="openHelpWantedDialog($event)" />

    <section id="contribute">
      <h2>Something wrong with this fixture definition?</h2>
      <p>It does not work in your lighting software or you see another problem? Then please help correct it!</p>
      <div class="grid-3">
        <ClientOnly>
          <a
            href="#"
            class="card slim"
            @click.prevent="openHelpWantedDialog({
              context: fixture,
              type: `fixture`,
            })">
            <OflSvg name="comment-alert" class="left" /><span>Send information</span>
          </a>
        </ClientOnly>
        <a href="https://github.com/OpenLightingProject/open-fixture-library/issues?q=is%3Aopen+is%3Aissue+label%3Abug" rel="nofollow" class="card slim">
          <OflSvg name="bug" class="left" /><span>Create issue on GitHub</span>
        </a>
        <a :href="mailtoUrl" class="card slim">
          <OflSvg name="email" class="left" /><span>Send email</span>
        </a>
      </div>
    </section>

    <HelpWantedDialog v-model="helpWantedContext" :type="helpWantedType" />
  </div>
</template>

<style lang="scss" scoped>
.fixture-meta {
  margin: -1.5rem 0 1rem;
  font-size: 0.8rem;
  color: theme-color(text-secondary);

  & > span:not(:last-child)::after {
    padding: 0 0.7ex;
    content: " | ";
  }
}
</style>

<script setup lang="ts">
import register from '~~/fixtures/register.json';

import Fixture from '~~/lib/model/Fixture.js';
import Manufacturer from '~~/lib/model/Manufacturer.js';

const route = useRoute();
const config = useRuntimeConfig();

const manufacturerKey = route.params.manufacturerKey as string;
const fixtureKey = route.params.fixtureKey as string;

const redirectTo = register.filesystem[`${manufacturerKey}/${fixtureKey}`]?.redirectTo;
if (redirectTo) {
  navigateTo(`/${redirectTo}?redirectFrom=${manufacturerKey}/${fixtureKey}`, { redirectCode: 302 });
}

const [{ data: fixtureJson }, { data: manufacturerJson }, { data: plugins }, redirect] = await Promise.all([
  useFetch(`/${manufacturerKey}/${fixtureKey}.json`),
  useFetch(`/api/v1/manufacturers/${manufacturerKey}`),
  useFetch('/api/v1/plugins'),
  fetchRedirectObject(route.query.redirectFrom as string | undefined),
]);

const fixture = computed(() => {
  if (!manufacturerJson.value || !fixtureJson.value) return null;
  const manufacturer = new Manufacturer(manufacturerKey, manufacturerJson.value);
  return new Fixture(manufacturer, fixtureKey, fixtureJson.value);
});

const redirectReasonExplanations: Record<string, string> = {
  FixtureRenamed: 'The fixture was renamed.',
  SameAsDifferentBrand: 'The fixture is the same but sold under different brands / names.',
};

async function fetchRedirectObject(redirectFrom: string | undefined) {
  if (!redirectFrom) {
    return undefined;
  }

  const { data: redirectJson } = await useFetch(`/${redirectFrom}.json`);

  return {
    from: redirectFrom,
    reason: redirectReasonExplanations[redirectJson.value?.reason ?? ''],
  };
}

const helpWantedContext = ref<unknown>(undefined);
const helpWantedType = ref('');

function openHelpWantedDialog(event: { context: unknown; type: string }) {
  helpWantedContext.value = event.context;
  helpWantedType.value = event.type;
}

const productModelStructuredData = computed(() => {
  if (!fixture.value) return {};
  const data: Record<string, unknown> = {
    '@context': 'http://schema.org',
    '@type': 'ProductModel',
    name: fixture.value.name,
    category: fixture.value.mainCategory,
    manufacturer: {
      url: `${config.public.websiteUrl}${manufacturerKey}`,
    },
  };

  if (fixture.value.hasComment) {
    data.description = fixture.value.comment;
  }

  if (fixture.value.physical !== null && fixture.value.physical.dimensions !== null) {
    data.depth = fixture.value.physical.depth;
    data.width = fixture.value.physical.width;
    data.height = fixture.value.physical.height;
  }

  return data;
});

const breadcrumbListStructuredData = computed(() => {
  if (!fixture.value) return {};
  return {
    '@context': 'http://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': `${config.public.websiteUrl}manufacturers`,
          name: 'Manufacturers',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': `${config.public.websiteUrl}${manufacturerKey}`,
          name: fixture.value?.manufacturer?.name,
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@id': fixture.value?.url,
          name: fixture.value?.name,
        },
      },
    ],
  };
});

const githubRepoPath = computed(() => {
  const slug = process.env.GITHUB_REPOSITORY || 'OpenLightingProject/open-fixture-library';
  return `https://github.com/${slug}`;
});

const branch = computed(() => {
  const gitRef = process.env.GITHUB_PR_BASE_REF || process.env.GITHUB_REF || 'master';
  return gitRef.split('/').pop() ?? 'master';
});

const mailtoUrl = computed(() => {
  const subject = `Feedback for fixture '${manufacturerKey}/${fixtureKey}'`;
  return `mailto:flo@open-fixture-library.org?subject=${encodeURIComponent(subject)}`;
});

useHead({
  title: computed(() => fixture.value ? `${fixture.value.manufacturer.name} ${fixture.value.name} DMX fixture definition` : ''),
  script: [
    {
      hid: 'productModelStructuredData',
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(productModelStructuredData.value)),
    },
    {
      hid: 'breadcrumbListStructuredData',
      type: 'application/ld+json',
      children: computed(() => JSON.stringify(breadcrumbListStructuredData.value)),
    },
  ],
});
</script>
