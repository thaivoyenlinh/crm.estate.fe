<script setup lang="ts">
import { Button, Table } from "ant-design-vue"

const columns = [
  { dataIndex: "name", key: "name", title: "Tên" },
  { dataIndex: "phone", key: "phone", title: "Điện thoại" },
  { dataIndex: "status", key: "status", title: "Trạng thái" },
]

const dataSource = [
  { key: "1", name: "Nguyễn Văn A", phone: "0901234567", status: "Mới" },
  { key: "2", name: "Trần Thị B", phone: "0912345678", status: "Đang chăm sóc" },
]
</script>

<template>
  <div class="lead-list">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Danh sách Lead</h1>

      <Button type="primary">Thêm lead</Button>
    </div>

    <Table :columns="columns" :data-source="dataSource" />
  </div>
</template>
