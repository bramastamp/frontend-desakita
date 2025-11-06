<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Kepala Rumah</h1>

    <!-- Search & Controls -->
    <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari NIK atau Nama Kepala Rumah"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <div class="flex gap-3 mt-3 md:mt-0">
        <div class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg">
          <select v-model="entriesPerPage" class="border-none focus:ring-0 bg-green-50">
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }} Entries</option>
          </select>
        </div>

        <button
          @click="openAddModal"
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
        <p class="text-sm">Memuat data kepala rumah...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!families.length" class="text-center text-gray-500 py-20">
      <i class="fa fa-user-slash text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Belum ada data kepala rumah</p>
      <p class="text-sm text-gray-400">Tambahkan data baru untuk memulai</p>
    </div>

    <!-- List Kepala Rumah -->
    <div
      v-else
      v-for="(family, index) in paginatedFamilies"
      :key="index"
      class="bg-white p-5 mb-4 rounded-2xl transition cursor-pointer"
      @click="toggleExpand(index)"
    >
      <div class="flex justify-between items-center">
        <!-- Kiri -->
        <div class="flex items-center gap-4">
          <img
            :src="family.photo || 'https://via.placeholder.com/80'"
            alt="Foto"
            class="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ family.name }}</h2>
            <p class="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <i class="fa fa-briefcase"></i> {{ family.profession }}
            </p>
            <p class="text-sm text-gray-700">NIK: {{ family.nik }}</p>
          </div>
        </div>

        <!-- Kanan -->
        <div class="flex gap-2">
          <button
            @click.stop="router.push(`/admin/head-of-families/edit/${family.id}`)"
            class="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <i class="fa fa-edit"></i> Kelola
          </button>
          <button
            @click.stop="deleteFamily(family.id)"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
            title="Hapus Kepala Rumah"
          >
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Detail (expandable) -->
      <transition name="fade">
        <div
          v-if="expandedIndex === index"
          class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div class="flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg">
            <i class="fa fa-cake-candles text-blue-600 text-xl"></i>
            <div>
              <p class="text-blue-800 font-semibold">{{ family.birthdate || '-' }}</p>
              <p class="text-xs text-gray-600">Tanggal Lahir</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-pink-50 px-3 py-2 rounded-lg">
            <i class="fa fa-venus-mars text-pink-600 text-xl"></i>
            <div>
              <p class="text-pink-800 font-semibold">{{ family.gender }}</p>
              <p class="text-xs text-gray-600">Jenis Kelamin</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-yellow-50 px-3 py-2 rounded-lg">
            <i class="fa fa-phone text-yellow-600 text-xl"></i>
            <div>
              <p class="text-yellow-800 font-semibold">{{ family.phone || '-' }}</p>
              <p class="text-xs text-gray-600">Nomor Telepon</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-lg md:col-span-2">
            <i class="fa fa-location-dot text-green-600 text-xl"></i>
            <div>
              <p class="text-green-800 font-semibold">{{ family.address || '-' }}</p>
              <p class="text-xs text-gray-600">Alamat</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-purple-50 px-3 py-2 rounded-lg">
            <i class="fa fa-users text-purple-600 text-xl"></i>
            <div>
              <p class="text-purple-800 font-semibold">{{ family.members }} Anggota</p>
              <p class="text-xs text-gray-600">Jumlah Keluarga</p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && families.length"
      class="flex justify-between items-center mt-6 text-sm text-gray-500"
    >
      <span>Showing {{ startIndex + 1 }}–{{ endIndex }} of {{ filteredFamilies.length }}</span>
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
          :disabled="endIndex >= filteredFamilies.length"
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

const router = useRouter()
const families = ref([])
const loading = ref(true) // ✅ Tambahkan state loading
const searchQuery = ref('')
const debouncedQuery = ref('')
const entriesPerPage = ref(10)
const page = ref(1)
const filterOpen = ref(false)
const expandedIndex = ref(null)
const BASE_URL = "http://127.0.0.1:8000"

// 🔹 Ambil data
onMounted(fetchFamilies)

async function fetchFamilies() {
  loading.value = true
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/api/head-of-families`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    families.value = response.data.map(f => ({
      id: f.id,
      name: f.user?.name || 'Tidak ada nama',
      nik: f.nik,
      photo: f.profile_picture ? `${BASE_URL}/storage/${f.profile_picture}` : null,
      gender: f.gender === 'male' ? 'Laki-laki' : 'Perempuan',
      birthdate: f.date_of_birth ? f.date_of_birth.split('T')[0] : '-',
      phone: f.phone_number,
      address: f.address,
      profession: f.occupation,
      members: f.residents ? f.residents.length : f.residents_count || 0,
    }))
  } catch (error) {
    console.error("Gagal mengambil data kepala keluarga:", error)
  } finally {
    loading.value = false
  }
}

// 🔹 Hapus data
async function deleteFamily(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus kepala rumah ini beserta akunnya?')) return
  try {
    const token = localStorage.getItem("token")
    await axios.delete(`${BASE_URL}/api/head-of-families/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    alert('✅ Kepala rumah berhasil dihapus.')
    await fetchFamilies()
  } catch (error) {
    console.error("Gagal menghapus:", error)
    alert("❌ Terjadi kesalahan saat menghapus data.")
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
const filteredFamilies = computed(() => {
  const q = debouncedQuery.value.toLowerCase()
  return families.value.filter(
    f => f.name.toLowerCase().includes(q) || (f.nik && f.nik.includes(q))
  )
})
const startIndex = computed(() => (page.value - 1) * entriesPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + entriesPerPage.value, filteredFamilies.value.length))
const paginatedFamilies = computed(() => filteredFamilies.value.slice(startIndex.value, endIndex.value))

function nextPage() { if (endIndex.value < filteredFamilies.value.length) page.value++ }
function prevPage() { if (page.value > 1) page.value-- }
function toggleExpand(index) { expandedIndex.value = expandedIndex.value === index ? null : index }
function openAddModal() { router.push('/admin/head-of-families/add') }
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
