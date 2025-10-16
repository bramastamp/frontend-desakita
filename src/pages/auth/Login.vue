<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 class="text-2xl font-semibold text-center mb-4">Login</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email" class="w-full mb-3 p-2 border rounded" />
        <input v-model="password" type="password" placeholder="Password" class="w-full mb-3 p-2 border rounded" />
        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')

const login = async () => {
  try {
    const res = await api.post('/login', { email: email.value, password: password.value })
    const { token, user } = res.data

    localStorage.setItem('token', token)
    localStorage.setItem('role', user.role)

    if (user.role === 'admin') router.push('/admin/dashboard')
    else router.push('/user/dashboard')
  } catch (err) {
    alert('Login gagal! Periksa kembali email dan password.')
  }
}
</script>


<style lang="scss" scoped>

</style>