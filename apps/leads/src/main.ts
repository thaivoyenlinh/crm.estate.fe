import singleSpaVue from "single-spa-vue"
import { createApp, h } from "vue"

import App from "./Leads.vue"
import router from "./router/index.js"

// const app = createApp(App)
// app.mount("#root")
const lifecycles = singleSpaVue({
  createApp,

  appOptions: {
    render() {
      return h(App)
    },
  },

  handleInstance(app, props: any) {
    // Receives shared data (like the token) that MfeContainer passes down via customProps
    // console.log("Data received from parent Shell-Host app:", props.authToken)
    app.use(router)
  },
})

export const { bootstrap, mount, unmount } = lifecycles
