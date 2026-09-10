import { registerApplication, start } from "single-spa"

registerApplication({
  name: "@recrm/shell-host",
  app: () => import("@recrm/shell-host"),
  activeWhen: ["/"],
})

start()
