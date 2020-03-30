<template>
  <div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="productModelStructuredData" />

    <!-- eslint-disable-next-line vue/no-v-html -->
    <script type="application/ld+json" v-html="breadcrumbListStructuredData" />

    <section v-if="redirect" class="card yellow">
      Redirected from <code>{{ redirect.from }}</code>: {{ redirect.reason }}
    </section>

    <FixturePage :fixture="fixture" :load-all-modes="loadAllModes" />
  </div>
</template>

<style lang="scss" scoped>
.fixture-meta {
  margin: -1.5rem 0 1rem;
  font-size: 0.8rem;
  color: theme-color(text-secondary);

  & > span:not(:last-child)::after {
    content: ' | ';
    padding: 0 0.7ex;
  }
}

.fixture-info {
  border-top: 0.4rem solid transparent;
}

.comment /deep/ .value {
  white-space: pre-line;
}

.fixture-videos {
  text-align: center;
  line-height: 1;
  margin: 1rem 0 0;
  padding: 0;
}
.fixture-video {
  margin-bottom: 1rem;

  @media screen and (min-width: $phone-landscape) {
    display: inline-block;
    width: 50%;
  }

  & a {
    display: inline-block;
    margin-top: 4px;
  }
}

.fixture-links {
  margin: 0;
  padding: 0;
  list-style: none;

  .hostname {
    color: theme-color(text-secondary);
    font-size: 0.9em;
    padding-left: 1ex;
  }

  .link-other {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.wheels {
  white-space: nowrap;
  overflow: hidden;
  overflow-x: auto;
}
</style>

<script>
import packageJson from '../../../package.json';
import register from '../../../fixtures/register.json';

import Fixture from '../../../lib/model/Fixture.js';

import FixturePage from '../../components/fixture-page/FixturePage.vue';

export default {
  components: {
    FixturePage
  },
  validate({ params }) {
    return `${params.manufacturerKey}/${params.fixtureKey}` in register.filesystem;
  },
  async asyncData({ params, query, app, redirect }) {
    const manKey = params.manufacturerKey;
    const fixKey = params.fixtureKey;

    const redirectTo = register.filesystem[`${manKey}/${fixKey}`].redirectTo;
    if (redirectTo) {
      redirect(302, `/${redirectTo}?redirectFrom=${manKey}/${fixKey}`);
      return {};
    }

    const fixtureJson = await app.$axios.$get(`/${manKey}/${fixKey}.json`);

    let redirectObj = null;
    if (query.redirectFrom) {
      const redirectJson = await app.$axios.$get(`/${query.redirectFrom}.json`);

      const reasonExplanations = {
        FixtureRenamed: `The fixture was renamed.`,
        SameAsDifferentBrand: `The fixture is the same but sold under different brands / names.`
      };

      redirectObj = {
        from: query.redirectFrom,
        reason: reasonExplanations[redirectJson.reason]
      };
    }

    return {
      manKey,
      fixKey,
      fixtureJson,
      redirect: redirectObj,
      loadAllModes: `loadAllModes` in query
    };
  },
  computed: {
    fixture() {
      return new Fixture(this.manKey, this.fixKey, this.fixtureJson);
    },
    productModelStructuredData() {
      console.log(`productModelStructuredData`);
      const data = {
        '@context': `http://schema.org`,
        '@type': `ProductModel`,
        'name': this.fixture.name,
        'category': this.fixture.mainCategory,
        'manufacturer': {
          'url': `${packageJson.homepage}${this.fixKey}`
        }
      };

      if (this.fixture.hasComment) {
        data.description = this.fixture.comment;
      }

      if (this.fixture.physical !== null && this.fixture.physical.dimensions !== null) {
        data.depth = this.fixture.physical.depth;
        data.width = this.fixture.physical.width;
        data.height = this.fixture.physical.height;
      }

      return data;
    },
    breadcrumbListStructuredData() {
      return {
        '@context': `http://schema.org`,
        '@type': `BreadcrumbList`,
        'itemListElement': [
          {
            '@type': `ListItem`,
            'position': 1,
            'item': {
              '@id': `${packageJson.homepage}manufacturers`,
              'name': `Manufacturers`
            }
          },
          {
            '@type': `ListItem`,
            'position': 2,
            'item': {
              '@id': `${packageJson.homepage}${this.fixKey}`,
              'name': this.fixture.manufacturer.name
            }
          },
          {
            '@type': `ListItem`,
            'position': 3,
            'item': {
              '@id': this.fixture.url,
              'name': this.fixture.name
            }
          }
        ]
      };
    }
  },
  head() {
    const title = `${this.fixture.manufacturer.name} ${this.fixture.name} DMX fixture definition`;

    return {
      title,
      meta: [
        {
          hid: `title`,
          content: title
        }
      ]
    };
  }
};

</script>
