<template>
  <aside class="w-64 min-h-screen bg-white border-r border-gray-100">
    <div class="p-6 flex items-center space-x-2">
      <img src="" alt="Logo" class="w-8 h-8" />
      <h1 class="text-xl font-semibold text-gray-800">Desa Kito.</h1>
    </div>

    <nav class="mt-6">
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.name">
          <div v-if="item.children">
            <!-- Parent item -->
            <button
              @click="handleParentClick(item)"
              class="flex items-center px-4 py-3 mx-3 w-[calc(100%-1.5rem)] rounded-lg transition-all duration-200"
              :class="[
                isParentActive(item)
                  ? 'bg-teal-100 text-teal-800 font-semibold cursor-default'
                  : 'text-gray-700 hover:bg-teal-50',
              ]"
            >
              <component
                :is="item.icon"
                class="w-5 h-5 mr-3"
                :class="isParentActive(item) ? 'text-teal-800' : 'text-gray-700'"
              />
              {{ item.name }}
            </button>

            <!-- Submenu -->
            <ul v-if="openSubmenu === item.name" class="ml-8 mt-2 space-y-1">
              <li v-for="child in item.children" :key="child.name">
                <router-link
                  :to="child.route"
                  active-class="menu-active"
                  class="block px-3 py-2 mx-3 rounded-md transition-all duration-200"
                  :class="[
                    isActive(child.route)
                      ? 'bg-teal-100 text-teal-800 font-semibold cursor-default'
                      : 'text-gray-600 hover:bg-teal-50',
                  ]"
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
            active-class="menu-active"
            class="flex items-center px-4 py-3 mx-3 w-[calc(100%-1.5rem)] rounded-lg transition-all duration-200"
            :class="[
              isActive(item.route)
                ? 'bg-teal-100 text-teal-800 font-semibold cursor-default'
                : 'text-gray-700 hover:bg-teal-50',
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 mr-3"
              :class="isActive(item.route) ? 'text-teal-800' : 'text-gray-700'"
            />
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Users, Gift, Calendar, Building2, Map } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const openSubmenu = ref(null)

if (route.path.startsWith('/admin/social-aids')) {
  openSubmenu.value = 'Bantuan Sosial'
}

function handleParentClick(item) {
  if (item.children && item.children.length > 0) {
    openSubmenu.value = openSubmenu.value === item.name ? null : item.name
    router.push(item.children[0].route)
  } else {
    openSubmenu.value = null
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
const isParentActive = (parent) =>
  parent.children && parent.children.some((child) => route.path.startsWith(child.route))

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

.menu-active {
  @apply bg-teal-100 text-teal-800 font-semibold rounded-md transition-all duration-200;
}

.menu-active svg {
  @apply text-teal-800;
}
</style>
