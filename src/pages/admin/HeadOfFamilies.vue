<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Kepala Rumah</h1>

    <!-- Search & Controls -->
    <div class="flex flex-wrap justify-between items-center bg-green-50 p-4 rounded-lg mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari NIK atau Nama Kepala Rumah"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div class="flex gap-3 mt-3 md:mt-0">
        <div class="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg">
          <span class="text-sm text-gray-600">Show</span>
          <select v-model="entriesPerPage" class="border-none focus:ring-0">
            <option v-for="n in [5,10,20,50]" :key="n" :value="n">{{ n }} Entries</option>
          </select>
        </div>
        <button
          @click="filterOpen = !filterOpen"
          class="bg-white border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-filter text-gray-600"></i>
          <span class="text-sm text-gray-600">Filter</span>
        </button>
        <button
          @click="openAddModal"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-plus"></i>
          Tambah Baru
        </button>
      </div>
    </div>

    <!-- List -->
    <div
      v-for="(family, index) in paginatedFamilies"
      :key="index"
      class="bg-white p-5 mb-4 rounded-lg shadow-sm flex flex-col md:flex-row justify-between items-center"
    >
      <div class="flex items-center gap-4 w-full md:w-2/3">
        <img
          :src="family.photo || 'https://via.placeholder.com/80'"
          alt="Foto"
          class="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 class="text-lg font-semibold text-gray-800">{{ family.name }}</h2>
          <p class="text-sm text-gray-500 flex items-center gap-1">
            <i class="fa fa-briefcase"></i> {{ family.profession }}
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="fa fa-id-card"></i> NIK: {{ family.nik }}
            </p>
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="fa fa-cake-candles"></i> {{ family.birthdate }}
            </p>
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="fa fa-venus-mars"></i> {{ family.gender }}
            </p>
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="fa fa-phone"></i> {{ family.phone }}
            </p>
            <p class="text-sm text-gray-600 flex items-center gap-1">
              <i class="fa fa-location-dot"></i> {{ family.address }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end gap-3 mt-4 md:mt-0">
        <span class="text-blue-600 text-sm font-medium cursor-pointer hover:underline">
          👪 {{ family.members }} Anggota Keluarga
        </span>
        <button
          @click="manageFamily(family)"
          class="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg"
        >
          Manage
        </button>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-6 text-sm text-gray-500">
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
import { ref, computed } from 'vue'

// Data dummy sementara (nanti diganti API)
const families = ref([
  {
    name: 'Budi',
    nik: '3060283182',
    birthdate: '11 April 1945',
    gender: 'Laki-Laki',
    phone: '+62 821-2211-7492',
    address: 'Jl. Sudirman No.321, Pati, 97219',
    profession: 'Engineering',
    members: 3,
    photo: '/default-avatar.jpg'
  },
  {
    name: 'Siti Aminah',
    nik: '3060283183',
    birthdate: '5 Mei 1982',
    gender: 'Perempuan',
    phone: '+62 812-3333-1111',
    address: 'Jl. Diponegoro No.5, Kudus',
    profession: 'Guru',
    members: 4,
    photo: '/default-avatar.jpg'
  },
])

const searchQuery = ref('')
const entriesPerPage = ref(10)
const page = ref(1)
const filterOpen = ref(false)

const filteredFamilies = computed(() => {
  if (!searchQuery.value) return families.value
  return families.value.filter(f =>
    f.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    f.nik.includes(searchQuery.value)
  )
})

const startIndex = computed(() => (page.value - 1) * entriesPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + entriesPerPage.value, filteredFamilies.value.length))
const paginatedFamilies = computed(() => filteredFamilies.value.slice(startIndex.value, endIndex.value))

function nextPage() {
  if (endIndex.value < filteredFamilies.value.length) page.value++
}
function prevPage() {
  if (page.value > 1) page.value--
}

function openAddModal() {
  alert('Form tambah kepala rumah akan dibuat setelah ini 😊')
}

function manageFamily(family) {
  alert(`Manage data ${family.name}`)
}
</script>


<style lang="scss" scoped>

</style>