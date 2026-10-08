import { createMemoryHistory, createRouter } from "vue-router"
import LeadList from "../views/LeadList.vue"

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: "/", component: LeadList }],
})

export default router
