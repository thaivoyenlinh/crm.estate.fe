import { registerApplication, start } from "single-spa"

// shell-host is the only top-level single-spa Application — it owns the layout
// (header/sidebar) AND mounts child modules (leads, dashboard, ...) itself as
// Parcels inside its own DOM (see shell-host/src/components/MfeContainer.vue).
// root-config only orchestrates shell-host; it does not register each child
// module individually here, to avoid a race when mounting concurrently (see
// the single-spa reroute() analysis).
registerApplication({
  name: "@recrm/shell-host",
  app: () => import(/* @vite-ignore */ "@recrm/shell-host"),
  activeWhen: (location) => !location.pathname.startsWith("/auth"),
})

start()
