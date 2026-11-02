// `embetty-vue-3` ships no type declarations; declare the component we use.
declare module 'embetty-vue-3' {
  import type { DefineComponent } from 'vue';

  export const EmbettyVideo: DefineComponent<{
    type?: string;
    videoId?: string;
    startAt?: number;
    serverUrl?: string;
  }>;
}
