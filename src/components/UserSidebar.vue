<template>
  <aside class="w-64 min-h-screen bg-white border-r">
    <div class="p-6 flex items-center space-x-2">
      <img src="" alt="Logo" class="w-8 h-8" />
      <h1 class="text-xl font-semibold text-gray-800">DesaKita.</h1>
    </div>

    <nav class="mt-6">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <div v-if="item.children">
            <!-- Parent item -->
            <button
              @click="toggleSubmenu(item.name)"
              class="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 rounded-md transition-colors"
            >
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </button>

            <!-- Submenu -->
            <ul v-if="openSubmenu === item.name" class="ml-8 mt-2 space-y-1">
              <li v-for="child in item.children" :key="child.name">
                <router-link
                  :to="child.route"
                  class="block px-4 py-2 text-gray-600 hover:bg-green-50 rounded-md"
                  :class="{ 'bg-green-100 text-green-700 font-semibold': isActive(child.route) }"
                >
                  {{ child.name }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Normal item -->
          <router-link
            v-else
            :to="item.route"
            class="flex items-center px-6 py-3 text-gray-700 hover:bg-green-100 rounded-md transition-colors"
            :class="{ 'bg-green-100 font-semibold text-green-700': isActive(item.route) }"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Users, Gift, Calendar, Building2, Map } from 'lucide-vue-next'

const route = useRoute()
const openSubmenu = ref(null)

const toggleSubmenu = (name) => {
  openSubmenu.value = openSubmenu.value === name ? null : name
}

const menuItems = [
  { name: 'Dashboard', route: '/user/dashboard', icon: Home },
  { name: 'Anggota Keluarga', route: '/user/head-families', icon: Users },
  {
    name: 'Bantuan Sosial',
    icon: Gift,
    children: [
      { name: 'Daftar Bantuan', route: '/user/social-aids/list' },
      { name: 'Pengajuan Bantuan', route: '/user/social-aids/applications' },
    ],
  },
  { name: 'Pembangunan', route: '/user/developments', icon: Building2 },
  { name: 'Acara', route: '/user/events', icon: Calendar },
  { name: 'Profil Desa', route: '/user/village-profile', icon: Map },
]

const isActive = (path) => route.path === path
</script>


<style scoped>
@reference "../style.css";

.router-link-active {
  @apply bg-green-100 text-green-700 font-semibold;
}
</style>
