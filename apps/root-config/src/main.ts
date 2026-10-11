import { registerApplication, start } from "single-spa"
import {
  constructApplications,
  constructLayoutEngine,
  constructRoutes,
} from "single-spa-layout"

import layout from "./microfrontend-layout.html?raw"
import "./styles.css"

const routes = constructRoutes(layout, {
  loaders: { mfe: `<div class="mfe-loading">Loading...</div>` },
  props: {},
})
const applications = constructApplications({
  loadApp: ({ name }) => import(/* @vite-ignore */ name),
  routes,
})

constructLayoutEngine({ applications, routes })
applications.forEach(registerApplication)

start()
