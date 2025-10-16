<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-semibold text-center mb-4">Register</h2>

      <form @submit.prevent="register">
        <input v-model="name" type="text" placeholder="Nama Lengkap" class="w-full mb-3 p-2 border rounded" />
        <input v-model="email" type="email" placeholder="Email" class="w-full mb-3 p-2 border rounded" />
        <input v-model="password" type="password" placeholder="Password" class="w-full mb-3 p-2 border rounded" />

        <button type="submit" class="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Daftar
        </button>
      </form>

      <p class="text-center mt-4 text-sm text-gray-600">
        Sudah punya akun?
        <RouterLink to="/login" class="text-blue-600 hover:underline">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../api'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('user') // default

const register = async () => {
  try {
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
  }
}
</script>



<style lang="scss" scoped>

</style>