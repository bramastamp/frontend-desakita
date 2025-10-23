<template>
  <header class="flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
    <!-- Kanan: Info Admin/User -->
    <div></div>

    <!-- Kiri: Profil dan Logout -->
    <div class="flex items-center space-x-4">
      <!-- Profil -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-300"></div>
        <div>
          <h2 class="text-sm font-semibold text-gray-800">{{ userName }}</h2>
          <p class="text-xs text-gray-500">
            {{ userRole === 'admin' ? 'Kepala Desa' : 'Kepala Keluarga' }}
          </p>
        </div>
      </div>

      <!-- Tombol Logout -->
      <button
        @click="logout"
        class="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition"
      >
        <LogOut class="w-4 h-4 mr-2" />
        Logout
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'

const router = useRouter()
const userName = ref('')
const userRole = ref('')

onMounted(() => {
  // Ambil data dari localStorage
  userName.value = localStorage.getItem('name') || 'Pengguna'
  userRole.value = localStorage.getItem('role') || 'user'
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('name')
  router.push('/login')
}
</script>


<style lang="scss" scoped>

</style>