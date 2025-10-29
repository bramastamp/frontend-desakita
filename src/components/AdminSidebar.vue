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
              @click="handleParentClick(item)"
              class="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-green-100 rounded-md transition-colors"
              :class="{ 'bg-green-100 font-semibold text-green-700': isParentActive(item) }"
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
import { useRouter } from 'vue-router'
import { watch } from 'vue'

import { Home, Users, Gift, Calendar, Building2, Map } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const openSubmenu = ref(null)
if (route.path.startsWith('/admin/social-aids')) {
  openSubmenu.value = 'Bantuan Sosial'
}


function handleParentClick(item) {
  if (item.children && item.children.length > 0) {
    if (openSubmenu.value === item.name) {
      // jika sudah terbuka, tutup
      openSubmenu.value = null
    } else {
      // buka submenu dan langsung ke route pertama
      openSubmenu.value = item.name
      router.push(item.children[0].route)
    }
  } else {
    // kalau item biasa
    openSubmenu.value = null // pastikan submenu lain tertutup
    router.push(item.route)
  }
}


const menuItems = [
  { name: 'Dashboard', route: '/admin/dashboard', icon: Home },
  { name: 'Kepala Rumah', route: '/admin/head-of-families', icon: Users },
  {
    name: 'Bantuan Sosial',
    icon: Gift,
    children: [
      { name: 'Daftar Bantuan', route: '/admin/social-aids/list' },
      { name: 'Pengajuan Bantuan', route: '/admin/social-aids/applications' },
    ],
  },
  { name: 'Pembangunan', route: '/admin/developments', icon: Building2 },
  { name: 'Acara', route: '/admin/events', icon: Calendar },
  { name: 'Profil Desa', route: '/admin/village-profile', icon: Map },
]

const isActive = (path) => route.path === path

const isParentActive = (parent) => {
  if (!parent.children) return false
  return parent.children.some(child => route.path.startsWith(child.route))
}

watch(
  () => route.path,
  (newPath) => {
    if (!newPath.startsWith('/admin/social-aids')) {
      openSubmenu.value = null
    }
  }
)

</script>


<style scoped>
@reference "tailwindcss";

.router-link-active {
  @apply bg-green-100 text-green-700 font-semibold;
}
</style>
