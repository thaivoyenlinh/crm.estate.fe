<template>
  <div class="mfe-loading-wrapper">
    <div v-if="isLoading" class="spinner">Đang tải phân hệ...</div>

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

const loadMicroFrontend = async (moduleName) => {
  if (parcelInstance && typeof parcelInstance.unmount === "function") {
    await parcelInstance.unmount()
    parcelInstance = null
  }

  if (!parcelContainer.value) return
  isLoading.value = true

  try {
    const mfeModule = await import(/* @vite-ignore */ moduleName)

    parcelInstance = mountRootParcel(mfeModule, {
      domElement: parcelContainer.value,
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

onMounted(() => {
  loadMicroFrontend(route.meta.moduleName)
})

watch(
  () => route.meta.moduleName,
  (newModuleName) => {
    if (newModuleName) {
      loadMicroFrontend(newModuleName)
    }
  },
)

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
