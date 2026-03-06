import { defineNuxtPlugin } from '#app';
import VueFormComponent from '../components/VueForm.vue';
import ValidateComponent from '../components/Validate.vue';
import FieldMessagesComponent from '../components/FieldMessages.vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueForm', VueFormComponent);
  nuxtApp.vueApp.component('Validate', ValidateComponent);
  nuxtApp.vueApp.component('FieldMessages', FieldMessagesComponent);
});
