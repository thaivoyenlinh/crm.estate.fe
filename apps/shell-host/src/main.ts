import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import App from "./app/App.vue"

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App)
    },
  },
})

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount

// const app = createApp(App)
// app.mount("#root")
