<template>
  <div class="p-8 bg-blue-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Edit Bantuan Sosial</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="updateAid" class="grid grid-cols-2 gap-6">
        <!-- Thumbnail -->
        <div class="flex flex-col items-center space-y-4">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            class="w-32 h-32 rounded-xl object-cover border"
          />
          <div
            v-else
            class="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center"
          >
            <i class="fa fa-image text-gray-500 text-2xl"></i>
          </div>

          <label class="bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
            Ubah Thumbnail
            <input type="file" class="hidden" @change="handleFileUpload" />
          </label>
        </div>

        <!-- Data Bantuan -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Bantuan</label>
            <input v-model="form.aid_name" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Kategori</label>
            <select v-model="form.category" class="input" required>
              <option value="">-- Pilih Kategori --</option>
              <option value="bahan pokok">Bahan Pokok</option>
              <option value="uang tunai">Uang Tunai</option>
              <option value="bbm subsidi">BBM Subsidi</option>
              <option value="kesehatan">Kesehatan</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Nominal (Rp)</label>
            <input v-model="form.nominal" type="number" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Donatur</label>
            <input v-model="form.donor_name" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea v-model="form.description" class="input" rows="3"></textarea>
          </div>

          <div class="col-span-2 mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Kepala Keluarga Penerima</label>

          <!-- Search -->
          <input
            v-model="searchInput"
            type="text"
            placeholder="Cari berdasarkan NIK atau alamat..."
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none mb-2"
          />

          <div v-if="loadingRecipients" class="text-gray-500 italic">Memuat daftar kepala keluarga...</div>

          <div v-else class="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
            <div
              v-for="family in paginatedFamilies"
              :key="family.id"
              class="flex items-center gap-2 py-1"
            >
              <input
                type="checkbox"
                :value="family.id"
                v-model="selectedRecipients"
                class="text-blue-600 focus:ring-blue-500"
              />
              <span class="text-gray-700 text-sm">
                {{ family.nik }} — {{ family.address }}
              </span>
            </div>

            <div v-if="!paginatedFamilies.length" class="text-gray-500 text-center py-3">
              Tidak ada hasil yang cocok.
            </div>
          </div>
        </div>
        </div>

        <!-- Tombol -->
        <div class="col-span-2 flex justify-end mt-6 space-x-3">
          <button
            type="button"
            @click="router.push('/admin/social-aids')"
            class="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { toastError, toastSuccess } from '../../../utils/toast'

const route = useRoute()
const router = useRouter()
const BASE_URL = 'http://127.0.0.1:8000'

const form = ref({
  aid_name: '',
  category: '',
  nominal: '',
  donor_name: '',
  description: '',
  thumbnail: null,
})

const previewUrl = ref(null)
const selectedRecipients = ref([])
const headOfFamilies = ref([])
const loadingRecipients = ref(true)
const searchInput = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10


function handleFileUpload(event) {
  const file = event.target.files[0]
  form.value.thumbnail = file
  previewUrl.value = URL.createObjectURL(file)
}

// 🔹 Ambil data lama
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    
    // Ambil data bantuan
    const { data } = await axios.get(`${BASE_URL}/api/social-aids/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    form.value = {
      aid_name: data.aid_name,
      category: data.category,
      nominal: data.nominal,
      donor_name: data.donor_name,
      description: data.description,
      thumbnail: null,
    }

    if (data.thumbnail) {
      previewUrl.value = data.thumbnail
    }

    // Ambil semua kepala keluarga
    const res = await axios.get(`${BASE_URL}/api/head-of-families`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    headOfFamilies.value = res.data

    // Ambil penerima lama dan tandai
    const recipientsRes = await axios.get(`${BASE_URL}/api/social-aids/${route.params.id}/recipients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    selectedRecipients.value = recipientsRes.data.map(r => r.id)

  } catch (err) {
    console.error(err)
    toastError('Gagal memuat data bantuan sosial')
  } finally {
    loadingRecipients.value = false
  }
})


// 🔹 Update data
async function updateAid() {
  try {
    const token = localStorage.getItem('token')
    const formData = new FormData()

    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null) {
        formData.append(key, form.value[key])
      }
    })

    // Update data utama
    await axios.post(`${BASE_URL}/api/social-aids/${route.params.id}?_method=PUT`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    // Update penerima (jika ada)
    await axios.post(
      `${BASE_URL}/api/social-aids/${route.params.id}/recipients/update`,
      { head_of_family_ids: selectedRecipients.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    toastSuccess('Data bantuan sosial berhasil diperbarui')
    router.push('/admin/social-aids')
  } catch (err) {
    console.error(err)
    toastError('Gagal memperbarui data')
  }
}


let debounceTimer
watch(searchInput, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = newVal.toLowerCase()
    currentPage.value = 1
  }, 500)
})

const filteredFamilies = computed(() => {
  const query = searchQuery.value
  if (!query) return headOfFamilies.value
  return headOfFamilies.value.filter((f) => {
    const nik = f.nik?.toLowerCase() || ''
    const addr = f.address?.toLowerCase() || ''
    return nik.includes(query) || addr.includes(query)
  })
})

const totalPages = computed(() => Math.ceil(filteredFamilies.value.length / itemsPerPage))
const paginatedFamilies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredFamilies.value.slice(start, start + itemsPerPage)
})
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function prevPage() { if (currentPage.value > 1) currentPage.value-- }

</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none;
}
</style>
