import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import App from "./Shell.vue"
import router from "./router"

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App)
    },
  },
  handleInstance(app) {
    app.use(router)
  },
})

export const { bootstrap, mount, unmount } = vueLifecycles
