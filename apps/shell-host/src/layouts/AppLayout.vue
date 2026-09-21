<template>
  <div class="main-layout">
    <header class="header">CRM Header</header>

    <div class="body">
      <aside class="sidebar">CRM Sidebar</aside>

      <main class="content" style="flex: 1; padding: 20px">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
}

.header {
  height: 64px;
  border-bottom: 1px solid #ddd;
  padding: 20px;
}

.body {
  display: flex;
  min-height: calc(100vh - 64px);
}

.sidebar {
  width: 240px;
  border-right: 1px solid #ddd;
  padding: 20px;
}

.content {
  flex: 1;
  padding: 24px;
}
</style>
