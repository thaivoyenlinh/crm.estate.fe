import singleSpaCss from "single-spa-css"
import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import Shell from "./Shell.vue"
import router from "./router"

const cssLifecycles = singleSpaCss({
  cssUrls: import.meta.env.DEV ? [] : ["/shell-host/shell-host.css"],
})

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

export const bootstrap = [cssLifecycles.bootstrap, vueLifecycles.bootstrap]
export const mount = [cssLifecycles.mount, vueLifecycles.mount]
export const unmount = [vueLifecycles.unmount, cssLifecycles.unmount]
