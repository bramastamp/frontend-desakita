<template>
  <div class="flex min-h-screen bg-gray-100">
    <UserSidebar class="w-64 bg-white shadow-md" />
    <div class="flex-1 flex flex-col">
      <!-- Topbar -->
      <Navbar />

      <!-- Page content -->
      <main class="p-6 flex-1 overflow-auto">
        <router-view :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Topbar.vue';
import UserSidebar from '../components/UserSidebar.vue';
</script>

<style lang="scss" scoped></style>
