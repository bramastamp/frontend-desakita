<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <AdminSidebar class="w-64 bg-white shadow-md" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <Topbar />

      <!-- Page content -->
      <main class="p-6 flex-1 overflow-auto">
        <router-view :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '../components/AdminSidebar.vue'
import Topbar from '../components/Topbar.vue'

</script>

<style lang="scss" scoped></style>
