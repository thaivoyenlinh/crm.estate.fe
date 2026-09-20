import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import App from "./Leads.vue"
import router from "./router/index.js"

const lifecycles = singleSpaVue({
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

export const { bootstrap, mount, unmount } = lifecycles
