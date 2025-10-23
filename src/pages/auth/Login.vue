<template>
  <transition name="fade-slide" mode="out-in">
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-3">
      <div
        class="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl grid md:grid-cols-2 h-[520px]"
      >
        <!-- Kiri - Form -->
        <div class="pt-8 px-8 pb-6 flex flex-col justify-start">
          <!-- Logo dan Judul -->
          <div class="flex items-center justify-center gap-2 mb-2">
            <img :src="logo" alt="DesaKito Logo" class="w-16" />
            <h1 class="text-3xl font-bold text-gray-800">DesaKito.</h1>
          </div>

          <h2 class="text-xl font-bold text-gray-800 text-center mb-1">
            Selamat Datang Kembali!
          </h2>
          <p class="text-gray-500 text-sm text-center mb-10">
            Silakan masuk untuk melanjutkan
          </p>

          <!-- Form Login -->
          <form @submit.prevent="login" class="space-y-5 w-full max-w-sm mx-auto">
            <div>
              <label class="block text-gray-700 text-sm font-medium mb-1"
                >Email Address</label
              >
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
              <label class="block text-gray-700 text-sm font-medium mb-1"
                >Password</label
              >
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

            <!-- Tombol Login -->
            <button
              type="submit"
              class="w-full bg-teal-600 text-white text-sm font-medium py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
              :disabled="loading"
            >
              <span v-if="!loading">Login</span>
              <span v-else class="flex items-center gap-2">
                <i class="fa-solid fa-spinner fa-spin"></i> Memproses...
              </span>
            </button>
          </form>

          <!-- Link ke Register -->
          <p class="text-center text-sm text-gray-600 mt-4">
            Belum punya akun?
            <RouterLink
              to="/register"
              class="text-teal-600 font-medium hover:underline transition-colors"
            >
              Register
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
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../api'
import { useRouter } from 'vue-router'

import logo from '../../assets/logo.png'
import landscape from '../../assets/landscape.jpg'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

const login = async () => {
  try {
    loading.value = true
    const res = await api.post('/login', {
      email: email.value,
      password: password.value
    })

    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('role', user.role)

    // Simulasi sedikit delay biar animasi loading kelihatan
    setTimeout(() => {
      loading.value = false
      if (user.role === 'admin') router.push('/admin/dashboard')
      else router.push('/user/dashboard')
    }, 1000)
  } catch (err) {
    loading.value = false
    alert('Login gagal! Periksa kembali email dan password.')
  }
}
</script>

<style scoped>

</style>
