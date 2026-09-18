import { createRouter, createWebHistory } from "vue-router"
import { MfeContainer } from "../components"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Internal dashboard page, written directly in the shell if preferred
    {
      path: "/",
      component: {
        template: "<div><h3>Chào mừng tới Hệ thống RECRM Dashboard</h3></div>",
      },
    },

    // Dynamic route for the LEADS application
    {
      path: "/leads/:pathMatch(.*)*", // Matches /leads and every path beneath it
      component: MfeContainer,
      meta: { moduleName: "leads" }, // Maps straight to the suffix in the import map (@recrm/leads)
    },

    // To add a new app later (e.g. customers), just copy this block:
    // { path: '/customers/:pathMatch(.*)*', component: MfeContainer, meta: { moduleName: 'customers' } }
  ],
})

export default router
