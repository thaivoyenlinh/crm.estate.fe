import singleSpaCss from "single-spa-css"
import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import "./styles.css"

import Navbar from "./Navbar.vue"

const cssLifecycles = singleSpaCss({
  cssUrls: import.meta.env.DEV ? [] : [import.meta.url.replace(/\.js$/, ".css")],
})

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(Navbar)
    },
  },
})

export const bootstrap = [cssLifecycles.bootstrap, vueLifecycles.bootstrap]
export const mount = [cssLifecycles.mount, vueLifecycles.mount]
export const unmount = [vueLifecycles.unmount, cssLifecycles.unmount]
