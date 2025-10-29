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
          @click="filterOpen = !filterOpen"
          class="bg-green-50 border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-filter text-gray-600"></i>
          <span class="text-sm text-gray-600">Filter</span>
        </button>
        <button
          @click="openAddPage"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-plus"></i>
          Tambah Baru
        </button>
      </div>
    </div>

    <!-- Daftar Pembangunan -->
    <div
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
            class="w-24 h-20 object-cover rounded-lg border"
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
    <div class="flex justify-between items-center mt-6 text-sm text-gray-500">
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const router = useRouter()
const developments = ref([])
const searchQuery = ref("")
const debouncedQuery = ref("")
const entriesPerPage = ref(10)
const page = ref(1)
const filterOpen = ref(false)
const BASE_URL = "http://127.0.0.1:8000"

// 🔹 Fungsi ambil data
onMounted(fetchDevelopments)

async function fetchDevelopments() {
  try {
    const token = localStorage.getItem("token")
    const response = await axios.get(`${BASE_URL}/api/developments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    developments.value = response.data
  } catch (err) {
    console.error("Gagal mengambil data pembangunan:", err)
  }
}

// 🔹 Fungsi hapus data pembangunan
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

// 🔹 Expand card
const expandedIndex = ref(null)
function toggleExpand(index) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

// 🔹 Read more
const expandedDescriptions = ref({})
function toggleDescription(index) {
  expandedDescriptions.value[index] = !expandedDescriptions.value[index]
}
function getShortDescription(desc, index) {
  if (!desc) return "-"
  const limit = 120
  const expanded = expandedDescriptions.value[index]
  if (desc.length <= limit) return desc
  return expanded ? desc : desc.slice(0, limit) + "..."
}

// 🔹 Pencarian dengan debounce
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
