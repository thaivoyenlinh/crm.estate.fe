<template>
  <div class="mfe-loading-wrapper">
    <div v-if="isLoading" class="spinner">Đang tải phân hệ...</div>

    <!-- Mount point — 100% safe, fully owned by Vue's lifecycle -->
    <div ref="parcelContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useRoute } from "vue-router"
import { mountRootParcel } from "single-spa"

const route = useRoute()
const parcelContainer = ref(null)
const isLoading = ref(true)
let parcelInstance = null

// Core function that loads and mounts a micro frontend
const loadMicroFrontend = async (moduleName) => {
  // 1. Unmount the currently displayed app to avoid a memory leak
  if (parcelInstance && typeof parcelInstance.unmount === "function") {
    await parcelInstance.unmount()
    parcelInstance = null
  }

  if (!parcelContainer.value) return
  isLoading.value = true

  try {
    // 2. Dynamically load the .js file from the import map configured at the root
    const mfeModule = await import(/* @vite-ignore */ moduleName)

    // 3. Use a single-spa Parcel to mount the child app's UI into Vue's ref element
    parcelInstance = mountRootParcel(mfeModule, {
      domElement: parcelContainer.value,
      customProps: {
        // Pass shared state/data down from the parent system to the child
        // authToken: localStorage.getItem("crm_token") || "guest-session-token",
        // currentLanguage: "vi",
      },
    })
    isLoading.value = false
  } catch (error) {
    console.error(
      `Không thể kích hoạt module Micro Frontend [@recrm/${moduleName}]:`,
      error,
    )
    isLoading.value = false
  }
}

// Mount the matching app as soon as the container appears
onMounted(() => {
  loadMicroFrontend(route.meta.moduleName)
})

// Watch for the user switching between child apps via the menu (e.g. /leads to /customers)
watch(
  () => route.meta.moduleName,
  (newModuleName) => {
    if (newModuleName) {
      loadMicroFrontend(newModuleName)
    }
  },
)

// When the user leaves the admin modules entirely (e.g. navigating to /auth)
onBeforeUnmount(async () => {
  if (parcelInstance && typeof parcelInstance.unmount === "function") {
    await parcelInstance.unmount()
  }
})
</script>

<style scoped>
.mfe-loading-wrapper {
  width: 100%;
  position: relative;
}
.spinner {
  padding: 15px;
  color: #666;
  font-style: italic;
}
</style>
