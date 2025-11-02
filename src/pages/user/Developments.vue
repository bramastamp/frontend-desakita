<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Pembangunan Desa</h1>

    <!-- Search -->
    <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari Pembangunan Desa"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <div class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg mt-3 md:mt-0">
        <span class="text-sm text-gray-600">Show</span>
        <select v-model="entriesPerPage" class="border-none focus:ring-0 bg-green-50">
          <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }} Entries</option>
        </select>
      </div>
    </div>

    <!-- Daftar Pembangunan -->
    <div
      v-for="(dev, index) in paginatedDevelopments"
      :key="index"
      class="bg-white p-5 mb-4 rounded-2xl transition cursor-pointer"
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
import axios from "axios"

const developments = ref([])
const searchQuery = ref("")
const debouncedQuery = ref("")
const entriesPerPage = ref(10)
const page = ref(1)
const BASE_URL = "http://127.0.0.1:8000"
const showImageModal = ref(false)
const selectedImage = ref(null)

// 🔹 Ambil data
onMounted(fetchDevelopments)
async function fetchDevelopments() {
  try {
    const response = await axios.get(`${BASE_URL}/api/public/developments`)
    developments.value = response.data
  } catch (err) {
    console.error("Gagal mengambil data pembangunan:", err)
  }
}

// 🔹 Expand & deskripsi
const expandedIndex = ref(null)
function toggleExpand(index) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}
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

// 🔹 Pencarian & pagination
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
