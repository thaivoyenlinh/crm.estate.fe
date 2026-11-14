<template>
  <div class="navbar-app">
    <header class="header">CRM Header</header>
    <aside class="sidebar">CRM Sidebar</aside>
  </div>
</template>

<style scoped>
.navbar-app {
  display: contents;
}

.header {
  border-bottom: 1px solid #ddd;
  grid-column: 1 / -1;
  padding: 20px;
}

.sidebar {
  border-right: 1px solid #ddd;
  padding: 20px;
}
</style>
