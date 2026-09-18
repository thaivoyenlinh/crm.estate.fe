import { createMemoryHistory, createRouter } from "vue-router"
import LeadList from "../views/LeadList.vue"

// leads is mounted by shell-host as a Parcel (see MfeContainer.vue) — it is not
// registered as its own single-spa Application, so the real URL is owned
// solely by shell-host's router. This router only handles leads' INTERNAL
// navigation (if it gains nested routes later), so it uses memory history
// instead of createWebHistory to avoid two routers fighting over popstate on
// the same window.history.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: LeadList }],
})

export default router
