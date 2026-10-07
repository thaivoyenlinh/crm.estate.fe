<template>
  <div class="mfe-loading-wrapper">
    <div v-if="isLoading" class="spinner">Đang tải phân hệ...</div>

    <Parcel
      :key="moduleName"
      :config="config"
      :mount-parcel="mountParcel"
      @parcel-error="onParcelError"
      @parcel-mounted="isLoading = false"
    />
  </div>
</template>

<script setup>
import Parcel from "single-spa-vue/parcel"
import { computed, inject, ref, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const mountParcel = inject("mountParcel")
const isLoading = ref(true)
const moduleName = computed(() => route.meta.moduleName)
const config = computed(() => import(/* @vite-ignore */ moduleName.value))

const onParcelError = (error) => {
  console.error(
    `Không thể kích hoạt module Micro Frontend [${moduleName.value}]:`,
    error,
  )
  isLoading.value = false
}

watch(moduleName, () => {
  isLoading.value = true
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
