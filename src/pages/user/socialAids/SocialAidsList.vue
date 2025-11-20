<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Bantuan Sosial Saya</h1>

    <!-- Search + Entries -->
    <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari bantuan sosial..."
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg mt-3 md:mt-0">
        <span class="text-sm text-gray-600">Show</span>
        <select v-model="entriesPerPage" class="border-none focus:ring-0 bg-green-50">
          <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }} Entries</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="text-center text-gray-600">
        <i class="fa fa-spinner fa-spin text-teal-500 text-3xl mb-3"></i>
        <p>Memuat data bantuan sosial...</p>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!aids.length" class="text-center text-gray-500 py-20">
      <i class="fa fa-box-open text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Belum ada bantuan sosial yang Anda ikuti</p>
    </div>

    <!-- Daftar bantuan -->
    <div
      v-else
      v-for="(aid, index) in paginatedAids"
      :key="aid.id"
      class="bg-white p-5 mb-4 rounded-2xl transition cursor-pointer hover:shadow-md"
      @click="toggleExpand(index)"
    >
      <div class="flex justify-between items-start flex-wrap gap-3">
        <!-- Info Bantuan -->
        <div class="flex items-center gap-4">
          <img
            :src="aid.thumbnail || 'https://via.placeholder.com/100?text=Bantuan'"
            alt="Thumbnail"
            class="w-20 h-20 rounded-xl object-cover"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ aid.aid_name }}</h2>
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="fa fa-tags"></i> {{ aid.category }}
            </p>
            <p class="text-sm text-gray-700">Donatur: {{ aid.donor_name }}</p>
          </div>
        </div>

        <!-- Status + Tombol -->
        <div
          class="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-semibold"
          :class="statusClasses(aid.pivot.status)"
          @click.stop
        >
          <template v-if="aid.pivot.status === 'distributed'">
            <button
              @click="updateStatus(aid.id, 'approved')"
              class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
            >
              Setujui
            </button>
            <button
              @click="updateStatus(aid.id, 'rejected')"
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
            >
              Tolak
            </button>
          </template>

          <template v-else-if="['approved', 'rejected'].includes(aid.pivot.status)">
            <span>Status: {{ aid.pivot.status }}</span>
          </template>

          <template v-else>
            <span>Status: {{ aid.pivot.status }}</span>
          </template>
        </div>
      </div>

      <!-- Detail Bantuan -->
      <transition name="fade">
        <div v-if="expandedIndex === index" class="mt-6">
          <div class="flex flex-wrap gap-4 mb-2">
            <div class="flex-1 flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-lg">
              <i class="fa fa-wallet text-blue-600 text-xl"></i>
              <div>
                <p class="text-blue-800 font-semibold">
                  Rp {{ Number(aid.nominal).toLocaleString('id-ID') }}
                </p>
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
          </div>

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
      <span>Menampilkan {{ startIndex + 1 }}–{{ endIndex }} dari {{ filteredAids.length }}</span>
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
import axios from "axios"
import { ref, computed, onMounted, watch } from "vue"
import { toastSuccess, toastError } from "../../../utils/toast"

const aids = ref([])
const loading = ref(true)
const searchQuery = ref("")
const debouncedQuery = ref("")
const entriesPerPage = ref(10)
const page = ref(1)
const expandedIndex = ref(null)
const BASE_URL = "http://127.0.0.1:8000"

onMounted(fetchAids)
async function fetchAids() {
  loading.value = true
  try {
    const token = localStorage.getItem("token")
    const { data } = await axios.get(`${BASE_URL}/api/my-aids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    aids.value = data
  } catch (error) {
    console.error("Gagal mengambil data bantuan sosial:", error)
    toastError("Gagal mengambil data bantuan sosial.")
  } finally {
    loading.value = false
  }
}

function statusClasses(status) {
  return {
    "bg-green-100 text-green-700": status === "approved",
    "bg-red-100 text-red-700": status === "rejected",
    "bg-yellow-100 text-yellow-700": status === "pending",
    "bg-gray-100 text-gray-700": status === "distributed",
  }
}

async function updateStatus(aidId, newStatus) {
  try {
    const token = localStorage.getItem("token")

    const response = await axios.put(
      `${BASE_URL}/api/social-aids/${aidId}/recipient-status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const aid = aids.value.find((a) => a.id === aidId)
    if (aid) aid.pivot.status = newStatus

    toastSuccess(response.data.message || `Status berhasil diubah menjadi ${newStatus}`)
  } catch (error) {
    if (error.response && error.response.status === 403) {
      toastError(error.response.data.message || "Akses ditolak.")
    } else {
      toastError("Gagal memperbarui status bantuan.")
    }
  }
}

// Debounce pencarian
let debounceTimer
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newQuery
  }, 400)
})

// Filter dan pagination
const filteredAids = computed(() => {
  const q = debouncedQuery.value.toLowerCase()
  return aids.value.filter(
    (a) =>
      a.aid_name.toLowerCase().includes(q) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.donor_name && a.donor_name.toLowerCase().includes(q))
  )
})

const startIndex = computed(() => (page.value - 1) * entriesPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + entriesPerPage.value, filteredAids.value.length)
)
const paginatedAids = computed(() =>
  filteredAids.value.slice(startIndex.value, endIndex.value)
)

function nextPage() {
  if (endIndex.value < filteredAids.value.length) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}
function toggleExpand(index) {
  expandedIndex.value = expandedIndex.value === index ? null : index
}

function formatDate(dateString) {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
</script>

<style scoped>
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
