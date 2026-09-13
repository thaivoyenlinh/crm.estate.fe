import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import App from "./app/App.vue"

// const app = createApp(App)
// app.mount("#root")
const lifecycles = singleSpaVue({
  createApp,

  appOptions: {
    render() {
      return h(App)
    },
  },
})

export const bootstrap = lifecycles.bootstrap
export const mount = lifecycles.mount
export const unmount = lifecycles.unmount
