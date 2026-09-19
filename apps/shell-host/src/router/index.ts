import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

import { MfeContainer } from "@/components"
import { MFE_APPS } from "@/constants"

const mfeRouters: RouteRecordRaw[] = Object.values(MFE_APPS).map((app) => ({
  path: `/${app.path}/:pathMatch(.*)*`,
  component: MfeContainer,
  meta: {
    moduleName: app.module,
  },
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Dynamic route for MFE application
    ...mfeRouters,
  ],
})

export default router
