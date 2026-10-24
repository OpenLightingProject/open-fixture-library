import { defineNuxtPlugin } from '#app';
import VueFormComponent from '../components/VueForm.vue';
import ValidateComponent from '../components/Validate.vue';
import FieldMessagesComponent from '../components/FieldMessages.vue';

export default defineNuxtPlugin({
  name: 'vue-form',
  parallel: true,
  setup({ vueApp }) {
    vueApp.component('VueForm', VueFormComponent);
    vueApp.component('Validate', ValidateComponent);
    vueApp.component('FieldMessages', FieldMessagesComponent);
  },
});
