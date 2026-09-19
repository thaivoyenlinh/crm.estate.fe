import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import Shell from "./Shell.vue"
import router from "./router"

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(Shell)
    },
  },
  handleInstance(app) {
    app.use(router)
  },
})

export const { bootstrap, mount, unmount } = vueLifecycles
