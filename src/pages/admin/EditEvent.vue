<template>
  <div class="p-8 bg-blue-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Edit Acara Desa</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="updateEvent" class="space-y-6">
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

          <div class="mt-3 flex gap-4 items-center">
            <div v-if="previewUrl">
              <p class="text-sm text-gray-500 mb-1">Preview Baru:</p>
              <img :src="previewUrl" class="w-40 h-32 object-cover rounded-lg border" />
            </div>

            <div v-else-if="form.event_photo">
              <p class="text-sm text-gray-500 mb-1">Foto Sekarang:</p>
              <img :src="form.event_photo" class="w-40 h-32 object-cover rounded-lg border" />
            </div>
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
            Perbarui
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"
import { toastError, toastSuccess, toastWarning } from "../../utils/toast"

const router = useRouter()
const route = useRoute()
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

// 🔹 Ambil data event berdasarkan ID
onMounted(async () => {
  try {
    const token = localStorage.getItem("token")
    const { id } = route.params
    const res = await axios.get(`${BASE_URL}/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = res.data

    // Format tanggal ke YYYY-MM-DD agar cocok dengan input type="date"
    const formatDate = (dateStr) => {
      if (!dateStr) return ""
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    // Format waktu ke HH:mm agar cocok dengan input type="time"
    const formatTime = (timeStr) => {
      if (!timeStr) return ""
      const date = new Date(`1970-01-01T${timeStr}Z`)
      const hours = String(date.getUTCHours()).padStart(2, "0")
      const minutes = String(date.getUTCMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
    }

    form.value = {
      ...data,
      date: formatDate(data.date),
      time: formatTime(data.time),
      event_photo: data.event_photo || null,
    }
  } catch (err) {
    console.error(err)
    toastError("Gagal memuat data acara!")
    router.push("/admin/events")
  }
})


// 🔹 Upload gambar baru (opsional)
function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  const allowed = ["image/jpeg", "image/png"]
  if (!allowed.includes(file.type)) return toastWarning("File harus JPG atau PNG!")
  if (file.size > 2 * 1024 * 1024) return toastWarning("Ukuran maksimal 2MB!")

  form.value.event_photo = file
  previewUrl.value = URL.createObjectURL(file)
}

// 🔹 Update data event
async function updateEvent() {
  try {
    const token = localStorage.getItem("token")
    const { id } = route.params
    const formData = new FormData()

    Object.entries(form.value).forEach(([key, val]) => {
      // ⚠️ Jangan kirim event_photo jika bukan file baru
      if (key === "event_photo") {
        if (val instanceof File) {
          formData.append(key, val)
        }
      } else if (val !== null) {
        formData.append(key, val)
      }
    })

    await axios.post(`${BASE_URL}/api/events/${id}?_method=PUT`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })

    toastSuccess("Data acara berhasil diperbarui!")
    router.push("/admin/events")
  } catch (err) {
    console.error(err)
    toastError("Gagal memperbarui acara!")
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
