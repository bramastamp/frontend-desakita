<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="fixed left-0 top-0 h-full w-64 bg-white z-40">
      <AdminSidebar />
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col ml-64">
      <!-- Topbar -->
      <div class="fixed top-0 left-64 right-0 z-30 bg-white">
        <Topbar />
      </div>

      <!-- Page content -->
      <main class="mt-16 p-6 flex-1 overflow-y-auto h-[calc(100vh-4rem)]">
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
