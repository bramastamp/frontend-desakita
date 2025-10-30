<template>
  <div class="p-6 bg-green-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Pembangunan Desa</h1>

    <!-- Search & Controls -->
    <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6 shadow-sm">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari Pembangunan Desa"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div class="flex gap-3 mt-3 md:mt-0">
        <div class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg">
          <span class="text-sm text-gray-600">Show</span>
          <select v-model="entriesPerPage" class="border-none focus:ring-0 bg-green-50">
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }} Entries</option>
          </select>
        </div>
        
        <button
          @click="openAddPage"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-plus"></i>
          Tambah Baru
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="flex flex-col items-center text-gray-600">
        <svg class="animate-spin h-8 w-8 text-green-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
        </svg>
        <p class="text-sm">Memuat data pembangunan desa...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!developments.length" class="text-center text-gray-500 py-20">
      <i class="fa fa-building text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Belum ada data pembangunan</p>
      <p class="text-sm text-gray-400">Tambahkan data baru untuk memulai</p>
    </div>

    <!-- Daftar Pembangunan -->
    <div
      v-else
      v-for="(dev, index) in paginatedDevelopments"
      :key="index"
      class="bg-white p-5 mb-4 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer"
      @click="toggleExpand(index)"
    >
      <div class="flex justify-between items-center">
        <!-- Kiri -->
        <div class="flex items-center gap-4">
          <img
            :src="dev.photo_url || 'https://via.placeholder.com/100x80?text=No+Image'"
            alt="Foto"
            class="w-24 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
            @click.stop="openImageModal(dev.photo_url || 'https://via.placeholder.com/100x80?text=No+Image')"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ dev.title }}</h2>
            <p class="text-sm text-gray-600 flex items-center gap-1 mb-1">
              <i class="fa fa-user"></i> Penanggung Jawab:
              <span class="font-semibold">{{ dev.pic }}</span>
            </p>

            <!-- Deskripsi -->
            <p class="text-sm text-gray-700">
              {{ getShortDescription(dev.description, index) }}
              <button
                v-if="dev.description && dev.description.length > 120"
                @click.stop="toggleDescription(index)"
                class="text-green-600 hover:underline ml-1 font-medium"
              >
                {{ expandedDescriptions[index] ? "Read less" : "Read more" }}
              </button>
            </p>
          </div>
        </div>

        <!-- Kanan -->
        <div class="flex gap-2">
          <button
            @click.stop="router.push(`/admin/developments/edit/${dev.id}`)"
            class="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <i class="fa fa-edit"></i> Kelola
          </button>
          <button
            @click.stop="deleteDevelopment(dev.id)"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
            title="Hapus Pembangunan"
          >
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- Detail (expandable) -->
      <transition name="fade">
        <div v-if="expandedIndex === index" class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg">
            <i class="fa fa-wallet text-red-600 text-xl"></i>
            <div>
              <p class="text-red-600 font-bold">Rp{{ formatCurrency(dev.budget) }}</p>
              <p class="text-xs text-gray-600">Total Anggaran</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg">
            <i class="fa fa-location-dot text-blue-700 text-xl"></i>
            <div>
              <p class="text-blue-700 font-semibold">{{ dev.location }}</p>
              <p class="text-xs text-gray-600">Lokasi</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-lg">
            <i class="fa fa-calendar text-green-700 text-xl"></i>
            <div>
              <p class="text-green-800 font-semibold">{{ formatDate(dev.start_date) }}</p>
              <p class="text-xs text-gray-600">Tanggal Mulai</p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-lg">
            <i class="fa fa-calendar text-green-700 text-xl"></i>
            <div>
              <p class="text-green-800 font-semibold">{{ formatDate(dev.end_date) }}</p>
              <p class="text-xs text-gray-600">Tenggat</p>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && developments.length"
      class="flex justify-between items-center mt-6 text-sm text-gray-500"
    >
      <span>Showing {{ startIndex + 1 }}–{{ endIndex }} of {{ filteredDevelopments.length }}</span>
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
          :disabled="endIndex >= filteredDevelopments.length"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>

  <!-- Popup Gambar -->
  <transition name="fade">
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl w-full p-4" @click.stop>
        <button
          @click="closeImageModal"
          class="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2"
        >
          <i class="fa fa-times"></i>
        </button>
        <img
          :src="selectedImage"
          alt="Foto Pembangunan"
          class="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()
const developments = ref([])
const loading = ref(true) // ✅ Tambahkan loading state
const searchQuery = ref("")
const debouncedQuery = ref("")
const entriesPerPage = ref(10)
const page = ref(1)
const filterOpen = ref(false)
const BASE_URL = "http://127.0.0.1:8000"
const showImageModal = ref(false)
const selectedImage = ref(null)

// 🔹 Fetch Data
onMounted(fetchDevelopments)
async function fetchDevelopments() {
  loading.value = true
  try {
    const token = localStorage.getItem("token")
    const response = await axios.get(`${BASE_URL}/api/developments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    developments.value = response.data
  } catch (err) {
    console.error("Gagal mengambil data pembangunan:", err)
  } finally {
    loading.value = false
  }
}

// 🔹 Delete
async function deleteDevelopment(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus data pembangunan ini?")) return
  try {
    const token = localStorage.getItem("token")
    await axios.delete(`${BASE_URL}/api/developments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    alert("✅ Data pembangunan berhasil dihapus.")
    await fetchDevelopments()
  } catch (error) {
    console.error("Gagal menghapus pembangunan:", error)
    alert("❌ Terjadi kesalahan saat menghapus data.")
  }
}

// 🔹 Expand logic
const expandedIndex = ref(null)
function toggleExpand(index) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

// 🔹 Description toggle
const expandedDescriptions = ref({})
function toggleDescription(index) {
  expandedDescriptions.value[index] = !expandedDescriptions.value[index]
}
function getShortDescription(desc, index) {
  if (!desc) return "-"
  const limit = 120
  const expanded = expandedDescriptions.value[index]
  return expanded || desc.length <= limit ? desc : desc.slice(0, limit) + "..."
}

// 🔹 Search debounce
let debounceTimer
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newQuery
  }, 400)
})

const filteredDevelopments = computed(() => {
  const q = debouncedQuery.value.toLowerCase()
  return developments.value.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.pic.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q)
  )
})

// 🔹 Pagination
const startIndex = computed(() => (page.value - 1) * entriesPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + entriesPerPage.value, filteredDevelopments.value.length)
)
const paginatedDevelopments = computed(() =>
  filteredDevelopments.value.slice(startIndex.value, endIndex.value)
)
function nextPage() {
  if (endIndex.value < filteredDevelopments.value.length) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}
function openAddPage() {
  router.push("/admin/developments/add")
}

// 🔹 Formatter
function formatCurrency(amount) {
  if (!amount) return "0"
  return new Intl.NumberFormat("id-ID").format(amount)
}
function formatDate(dateString) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
}

// 🔹 Gambar Modal
function openImageModal(imageUrl) {
  selectedImage.value = imageUrl
  showImageModal.value = true
}
function closeImageModal() {
  showImageModal.value = false
  selectedImage.value = null
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
