import Vue from 'vue';

Vue.directive(`focus`, {
  inserted(el) {
    if (Vue._oflRestoreComplete) {
      el.focus();
    }
  }
});
