import { registerApplication, start } from "single-spa"

registerApplication({
  name: "@recrm/shell-host",
  app: () => import("@recrm/shell-host"),
  activeWhen: ["/"],
})

registerApplication({
  name: "@recrm/leads",
  app: () => import("@recrm/leads"),
  activeWhen: ["/leads"],
})

start()
