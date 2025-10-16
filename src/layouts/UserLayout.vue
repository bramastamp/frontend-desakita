<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main class="flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from '../components/Topbar.vue';
</script>

<style lang="scss" scoped></style>
