<template>
  <div class="p-8 bg-blue-50 min-h-screen">
    <!-- Loading & Error -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-600">Memuat data bantuan sosial...</div>
    </div>

    <div v-else-if="!aid" class="text-center text-gray-500 py-20">
      <i class="fa fa-exclamation-circle text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Data tidak ditemukan</p>
    </div>

    <div v-else class="bg-white rounded-2xl shadow p-6">
      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ aid.aid_name }}</h2>
          <p class="text-gray-600">Kategori: {{ aid.category }}</p>
          <p class="text-gray-600">Donatur: {{ aid.donor_name }}</p>
        </div>
        <img
          :src="aid.thumbnail ? `${BASE_URL}/storage/${aid.thumbnail}` : 'https://placehold.co/120x120?text=Bantuan'"
          class="w-32 h-32 rounded-xl object-cover border"
        />
      </div>

      <!-- Informasi Bantuan -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-blue-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Nominal</p>
          <p class="text-lg font-semibold text-blue-700">
            Rp {{ Number(aid.nominal).toLocaleString('id-ID') }}
          </p>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Tanggal Dibuat</p>
          <p class="text-lg font-semibold text-green-700">{{ formatDate(aid.created_at) }}</p>
        </div>
        <div class="bg-yellow-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Deskripsi</p>
          <p class="text-gray-800">{{ aid.description || '-' }}</p>
        </div>
      </div>

      <!-- Tombol Aksi -->
      <div class="flex justify-end gap-3 mb-8">
        <button
          @click="router.push(`/admin/social-aids/${aid.id}/edit`)"
          class="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-edit"></i> Edit
        </button>
        <button
          @click="router.push('/admin/social-aids')"
          class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-arrow-left"></i> Kembali
        </button>
      </div>

      <!-- Daftar Penerima -->
      <h3 class="text-xl font-semibold mb-4">Daftar Penerima</h3>

      <!-- Search Bar -->
      <div class="flex items-center justify-between mb-4">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Cari nama penerima..."
          class="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div v-if="loadingRecipients" class="text-gray-600">Memuat penerima...</div>

      <div v-else-if="!paginatedRecipients.length" class="text-gray-500 text-center py-8">
        Tidak ada penerima yang cocok.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="py-2 px-4 border-b text-left">Nama Kepala Rumah</th>
              <th class="py-2 px-4 border-b text-left">Status</th>
              <th class="py-2 px-4 border-b text-left">Nominal Diterima</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(recipient, i) in paginatedRecipients"
              :key="i"
              class="hover:bg-gray-50"
            >
              <td class="py-2 px-4 border-b">{{ recipient.user?.name || 'Tidak diketahui' }}</td>
              <td class="py-2 px-4 border-b capitalize">{{ recipient.pivot.status || '-' }}</td>
              <td class="py-2 px-4 border-b">
                {{
                  recipient.pivot.received_nominal
                    ? 'Rp ' + Number(recipient.pivot.received_nominal).toLocaleString('id-ID')
                    : '-'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex justify-center items-center mt-6 gap-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-lg border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          ‹
        </button>
        <span class="text-gray-700">
          Halaman {{ currentPage }} dari {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-lg border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { toastError } from '../../../utils/toast'

const router = useRouter()
const route = useRoute()
const BASE_URL = 'http://127.0.0.1:8000'

const aid = ref(null)
const recipients = ref([])
const searchInput = ref('')
const searchQuery = ref('') // debounced query
const loading = ref(true)
const loadingRecipients = ref(true)

const currentPage = ref(1)
const itemsPerPage = 10

// Debounce mekanisme pencarian (500 ms)
let debounceTimer
watch(searchInput, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = newVal
    currentPage.value = 1 // reset ke halaman pertama
  }, 500)
})

onMounted(async () => {
  await fetchAidDetail()
  await fetchRecipients()
})

async function fetchAidDetail() {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${BASE_URL}/api/social-aids/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    aid.value = data
  } catch (error) {
    console.error(error)
    toastError('Gagal memuat detail bantuan sosial')
  } finally {
    loading.value = false
  }
}

async function fetchRecipients() {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(
      `${BASE_URL}/api/social-aids/${route.params.id}/recipients`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    recipients.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loadingRecipients.value = false
  }
}

// Filter real-time (menggunakan query yang sudah di-debounce)
const filteredRecipients = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return recipients.value.filter((recipient) => {
    const name = recipient.user?.name?.toLowerCase() || ''
    return name.includes(query)
  })
})

// Pagination logic
const totalPages = computed(() =>
  Math.ceil(filteredRecipients.value.length / itemsPerPage)
)

const paginatedRecipients = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRecipients.value.slice(start, start + itemsPerPage)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
input[type='text'] {
  transition: all 0.2s ease;
}
input[type='text']:focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}
</style>
