import { registerApplication, start } from "single-spa"

registerApplication({
  name: "@recrm/shell-host",
  app: () => import(/* @vite-ignore */ "@recrm/shell-host"),
  activeWhen: (location) => !location.pathname.startsWith("/auth"),
})

start()
