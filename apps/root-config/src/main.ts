import { navigateToUrl, registerApplication, start } from "single-spa"
import { constructApplications, constructLayoutEngine, constructRoutes } from "single-spa-layout"

import { restoreSession } from "@recrm/auth"

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

const renderBootError = () => {
  const message = document.createElement("p")
  message.textContent = "Unable to connect to the server."

  const retryButton = document.createElement("button")
  retryButton.className = "boot-error__button"
  retryButton.textContent = "Try again"
  retryButton.type = "button"
  retryButton.addEventListener("click", () => location.reload())

  const container = document.createElement("div")
  container.className = "boot-error"
  container.append(message, retryButton)

  document.body.append(container)
}

constructLayoutEngine({ applications, routes })
applications.forEach(registerApplication)

try {
  const isLoggedIn = await restoreSession()
  if (!isLoggedIn) navigateToUrl("/auth")
  start()
} catch (error) {
  console.error(error)
  renderBootError()
}
