<template>
  <div class="p-8 bg-blue-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Tambah Acara Desa</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Judul -->
        <div>
          <label class="block font-medium text-gray-700">Judul Acara</label>
          <input v-model="form.title" type="text" class="input" required />
        </div>

        <!-- Penanggung Jawab -->
        <div>
          <label class="block font-medium text-gray-700">Penanggung Jawab (PIC)</label>
          <input v-model="form.pic" type="text" class="input" required />
        </div>

        <!-- Deskripsi -->
        <div>
          <label class="block font-medium text-gray-700">Deskripsi</label>
          <textarea v-model="form.description" class="input" rows="3" required></textarea>
        </div>

        <!-- Lokasi -->
        <div>
          <label class="block font-medium text-gray-700">Lokasi</label>
          <input v-model="form.location" type="text" class="input" required />
        </div>

        <!-- Tanggal & Waktu -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-gray-700">Tanggal Acara</label>
            <input v-model="form.date" type="date" class="input" required />
          </div>

          <div>
            <label class="block font-medium text-gray-700">Waktu Acara</label>
            <input v-model="form.time" type="time" class="input" required />
          </div>
        </div>

        <!-- Foto Event -->
        <div>
          <label class="block font-medium text-gray-700">Foto Dokumentasi Acara</label>
          <input type="file" @change="handleFileUpload" class="input" />
          <div v-if="previewUrl" class="mt-3">
            <img :src="previewUrl" class="w-40 h-32 object-cover rounded-lg border" />
          </div>
        </div>

        <!-- Tombol Simpan -->
        <div class="flex justify-end mt-6 gap-3">
          <button
            type="button"
            @click="router.push('/admin/events')"
            class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Batal
          </button>
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()
const BASE_URL = "http://127.0.0.1:8000"

const form = ref({
  title: "",
  pic: "",
  description: "",
  location: "",
  date: "",
  time: "",
  event_photo: null,
})

const previewUrl = ref(null)

// 🔹 Upload gambar event
function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  const allowed = ["image/jpeg", "image/png"]
  if (!allowed.includes(file.type)) return alert("File harus JPG atau PNG!")
  if (file.size > 2 * 1024 * 1024) return alert("Ukuran maksimal 2MB!")

  form.value.event_photo = file
  previewUrl.value = URL.createObjectURL(file)
}

// 🔹 Kirim data ke API
async function submitForm() {
  try {
    const token = localStorage.getItem("token")
    const formData = new FormData()
    Object.entries(form.value).forEach(([key, val]) => {
      if (val !== null) formData.append(key, val)
    })

    await axios.post(`${BASE_URL}/api/events`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })

    alert("✅ Acara berhasil ditambahkan!")
    router.push("/admin/events")
  } catch (err) {
    console.error(err)
    alert("❌ Gagal menambahkan acara!")
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
