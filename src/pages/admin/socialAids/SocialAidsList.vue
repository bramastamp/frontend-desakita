<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Daftar Bantuan Sosial</h1>

    <!-- Search & Controls -->
    <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari nama bantuan atau kategori"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <div class="flex gap-3 mt-3 md:mt-0">
        <div class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg">
          <select v-model="entriesPerPage" class="border-none focus:ring-0 bg-green-50">
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }} Entries</option>
          </select>
        </div>

        <button
          @click="openAddPage"
          class="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-plus"></i> Tambah Baru
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="flex flex-col items-center text-gray-600">
        <svg class="animate-spin h-8 w-8 text-teal-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p class="text-sm">Memuat data bantuan sosial...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!aids.length" class="text-center text-gray-500 py-20">
      <i class="fa fa-box-open text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Belum ada data bantuan sosial</p>
      <p class="text-sm text-gray-400">Tambahkan data baru untuk memulai</p>
    </div>

    <!-- List Bantuan Sosial -->
    <div
      v-else
      v-for="(aid, index) in paginatedAids"
      :key="aid.id"
      class="bg-white p-5 mb-4 rounded-2xl transition cursor-pointer"
      @click="toggleExpand(index)"
    >
      <div class="flex justify-between items-center">
        <!-- Kiri -->
        <div class="flex items-center gap-4">
          <img
            :src="aid.thumbnail || 'https://via.placeholder.com/100?text=Bantuan'"
            alt="Thumbnail"
            class="w-24 h-20 rounded-xl object-cover"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ aid.aid_name }}</h2>
            <p class="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <i class="fa fa-tags"></i> {{ aid.category }}
            </p>
            <p class="text-sm text-gray-700">Donatur: {{ aid.donor_name }}</p>
          </div>
        </div>

        <!-- Kanan -->
        <div class="flex gap-2">
          <button
            @click.stop="router.push(`/admin/social-aids/${aid.id}`)"
            class="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <i class="fa fa-eye"></i> Lihat
          </button>
          <button
            @click.stop="deleteAid(aid.id)"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
            title="Hapus Bantuan Sosial"
          >
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Detail (expandable) -->
      <transition name="fade">
      <div v-if="expandedIndex === index" class="mt-6">
        <!-- Baris info utama: flex + flex-1 supaya masing-masing item mengisi lebar -->
        <div class="flex flex-wrap gap-4 mb-2">
          <div class="flex-1 flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg">
            <i class="fa fa-wallet text-blue-600 text-xl"></i>
            <div>
              <p class="text-blue-800 font-semibold">Rp {{ Number(aid.nominal).toLocaleString('id-ID') }}</p>
              <p class="text-xs text-gray-600">Nominal Bantuan</p>
            </div>
          </div>

          <div class="flex-1 flex items-center gap-3 bg-green-50 px-3 py-2 rounded-lg">
            <i class="fa fa-calendar text-green-600 text-xl"></i>
            <div>
              <p class="text-green-800 font-semibold">{{ formatDate(aid.created_at) }}</p>
              <p class="text-xs text-gray-600">Dibuat Pada</p>
            </div>
          </div>

          <div class="flex-1 flex items-center gap-3 bg-purple-50 px-3 py-2 rounded-lg">
            <i class="fa fa-users text-purple-600 text-xl"></i>
            <div>
              <p class="text-purple-800 font-semibold">{{ aid.recipients?.length || 0 }}</p>
              <p class="text-xs text-gray-600">Jumlah Penerima</p>
            </div>
          </div>
        </div>

        <!-- Deskripsi di bawah baris utama -->
        <div class="bg-yellow-50 px-3 py-2 rounded-lg">
          <p class="text-yellow-800 font-semibold">{{ aid.description || '-' }}</p>
          <p class="text-xs text-gray-600">Deskripsi</p>
        </div>
      </div>
    </transition>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && aids.length"
      class="flex justify-between items-center mt-6 text-sm text-gray-500"
    >
      <span>Showing {{ startIndex + 1 }}–{{ endIndex }} of {{ filteredAids.length }}</span>
      <div class="flex gap-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <button
          @click="nextPage"
          :disabled="endIndex >= filteredAids.length"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ref, computed, onMounted, watch } from 'vue'
import { toastSuccess, toastError } from '../../../utils/toast'

const router = useRouter()
const aids = ref([])
const loading = ref(true)
const searchQuery = ref('')
const debouncedQuery = ref('')
const entriesPerPage = ref(10)
const page = ref(1)
const expandedIndex = ref(null)
const BASE_URL = "http://127.0.0.1:8000"

// 🔹 Ambil data bantuan sosial
onMounted(fetchAids)
async function fetchAids() {
  loading.value = true
  try {
    const token = localStorage.getItem("token")
    const { data } = await axios.get(`${BASE_URL}/api/social-aids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    aids.value = data
  } catch (error) {
    console.error("Gagal mengambil data bantuan sosial:", error)
    toastError("Gagal memuat data bantuan sosial.")
  } finally {
    loading.value = false
  }
}

// 🔹 Hapus data
async function deleteAid(id) {
  try {
    const token = localStorage.getItem("token")
    await axios.delete(`${BASE_URL}/api/social-aids/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    toastSuccess('Bantuan sosial berhasil dihapus.')
    await fetchAids()
  } catch (error) {
    console.error("Gagal menghapus:", error)
    toastError("Terjadi kesalahan saat menghapus data.")
  }
}

// 🔹 Search debounce
let debounceTimer
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newQuery
  }, 400)
})

// 🔹 Filtering & pagination
const filteredAids = computed(() => {
  const q = debouncedQuery.value.toLowerCase()
  return aids.value.filter(
    a =>
      a.aid_name.toLowerCase().includes(q) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.donor_name && a.donor_name.toLowerCase().includes(q))
  )
})
const startIndex = computed(() => (page.value - 1) * entriesPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + entriesPerPage.value, filteredAids.value.length))
const paginatedAids = computed(() => filteredAids.value.slice(startIndex.value, endIndex.value))

function nextPage() { if (endIndex.value < filteredAids.value.length) page.value++ }
function prevPage() { if (page.value > 1) page.value-- }
function toggleExpand(index) { expandedIndex.value = expandedIndex.value === index ? null : index }
function openAddPage() { router.push('/admin/social-aids/add') }

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}
</script>

<style scoped>
button i {
  pointer-events: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
