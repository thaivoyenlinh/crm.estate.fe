import singleSpaCss from "single-spa-css"
import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import "./styles.css"

import App from "./Leads.vue"
import router from "./router/index.js"

const cssLifecycles = singleSpaCss({
  cssUrls: import.meta.env.DEV ? [] : ["/leads/leads.css"],
})

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

export const bootstrap = [cssLifecycles.bootstrap, vueLifecycles.bootstrap]
export const mount = [cssLifecycles.mount, vueLifecycles.mount]
export const unmount = [vueLifecycles.unmount, cssLifecycles.unmount]
