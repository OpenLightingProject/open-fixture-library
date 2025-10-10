export default defineNuxtConfig({
    telemetry:true,
    rootDir: './ui/',
    compatibilityDate: '2025-09-13',
    modules:['@nuxt/fonts'],
    css:['~/assets/styles/style.scss'],
    runtimeConfig:{
        public:{
            websiteUrl:'',
            searchIndexingIsAllowed: process.env.ALLOW_SEARCH_INDEXING === `allowed`,
        }
    }
})