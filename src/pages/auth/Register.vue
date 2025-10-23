<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-3">
    <transition name="fade-slide" mode="out-in">
      <div
        key="register-page"
        class="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl grid md:grid-cols-2 h-[520px]"
      >
        <!-- Kiri - Form -->
        <div class="pt-8 px-8 pb-6 flex flex-col justify-start">
          <!-- Logo dan Judul -->
          <div class="flex items-center justify-center gap-1 mb-2">
            <img :src="logo" alt="DesaKito Logo" class="w-16" />
            <h1 class="text-3xl font-bold text-gray-800">DesaKito.</h1>
          </div>

          <h2 class="text-xl font-bold text-gray-800 text-center mb-1">
            Haii, Selamat Datang!
          </h2>
          <p class="text-gray-500 text-sm text-center mb-6">
            Silahkan Daftar Terlebih Dahulu
          </p>

          <!-- Form Register -->
          <form @submit.prevent="register" class="space-y-3 w-full max-w-sm mx-auto">
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">Name</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-gray-400 text-sm">
                  <i class="fa-regular fa-user"></i>
                </span>
                <input
                  v-model="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  class="w-full pl-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">Email Address</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-gray-400 text-sm">
                  <i class="fa-regular fa-envelope"></i>
                </span>
                <input
                  v-model="email"
                  type="email"
                  placeholder="Email"
                  class="w-full pl-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-gray-400 text-sm">
                  <i class="fa-solid fa-lock"></i>
                </span>
                <input
                  v-model="password"
                  type="password"
                  placeholder="Password"
                  class="w-full pl-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-teal-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
              :disabled="loading"
            >
              <span v-if="!loading">Register</span>
              <span v-else class="flex items-center gap-2">
                <i class="fa-solid fa-spinner fa-spin"></i> Memproses...
              </span>
            </button>
          </form>

          <p class="text-center text-sm text-gray-600 mt-4">
            Sudah punya akun?
            <RouterLink
              to="/login"
              class="text-teal-600 font-medium hover:underline transition-all duration-300 hover:text-teal-700"
            >
              Login
            </RouterLink>
          </p>
        </div>

        <!-- Kanan - Gambar -->
        <div class="hidden md:block">
          <img
            :src="landscape"
            alt="Desa Pemandangan"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../api'
import { useRouter, RouterLink } from 'vue-router'

// import logo & background
import logo from '../../assets/logo.png'
import landscape from '../../assets/landscape.jpg'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('user')
const loading = ref(false)

const register = async () => {
  try {
    loading.value = true
    // simulasi sedikit delay biar efek spinner kelihatan
    await new Promise(resolve => setTimeout(resolve, 1000))
    await api.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })
    alert('Registrasi berhasil! Silakan login.')
    router.push('/login')
  } catch (err) {
    console.error('Error detail:', err.response?.data)
    alert('Registrasi gagal! Periksa data yang kamu masukkan.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>

</style>
