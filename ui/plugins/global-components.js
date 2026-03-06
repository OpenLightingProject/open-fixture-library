import { defineNuxtPlugin } from '#app';
import OflSvg from '../components/global/OflSvg.vue';
import OflTime from '../components/global/OflTime.vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('OflSvg', OflSvg);
  nuxtApp.vueApp.component('OflTime', OflTime);
});
