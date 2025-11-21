<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-gray-800 mb-2">
      Detail Kepala Keluarga
    </h1>
    <p class="text-gray-600 mb-6">
      Melihat anggota keluarga dari:
      <strong class="text-teal-700">{{ familyName }}</strong>
    </p>

    <!-- Search & Controls -->
    <div class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6">
  
      <!-- SEARCH INPUT -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari NIK atau Nama Anggota"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <div class="flex items-center gap-3 mt-3 md:mt-0">

        <!-- SHOW ENTRIES -->
        <div class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg">
          <span class="text-sm text-gray-600">Show</span>
          <select
            v-model="relationFilter"
            class="border-none bg-green-50 focus:ring-0"
          >
            <option value="">Semua</option>
            <option v-for="rel in availableRelations" :key="rel" :value="rel">
              {{ rel }}
            </option>
          </select>
        </div>

        <!-- TOMBOL KEMBALI -->
        <button
          @click="router.push('/admin/head-of-families')"
          class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <i class="fa fa-arrow-left mr-1"></i> Kembali
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
        <p class="text-sm">Memuat data anggota keluarga...</p>
      </div>
    </div>

    <!-- Empty State jika belum ada data -->
    <div v-else-if="residents.length === 0" class="text-center text-gray-500 py-20">
      <i class="fa fa-users-slash text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Belum ada anggota keluarga</p>
      <p class="text-sm text-gray-400">Tambahkan anggota pada kepala keluarga ini</p>
    </div>

    <!-- Tidak ada hasil pencarian -->
    <div v-else-if="filteredResidents.length === 0" class="text-center text-gray-500 py-20">
      <i class="fa fa-search text-5xl text-gray-400 mb-4"></i>
      <p class="text-lg font-medium">Tidak ada hasil</p>
      <p class="text-sm text-gray-400">Coba kata kunci lain</p>
    </div>

    <!-- Grouped List -->
    <div v-else>
      <div
        v-for="(group, relation) in groupedResidents"
        :key="relation"
        class="mb-8"
      >
        <h2 class="text-xl font-semibold text-teal-700 border-l-4 border-teal-500 pl-3 mb-4">
          {{ relation }}
        </h2>

        <div v-if="group.length" class="flex flex-col gap-4">

          <!-- CARD ANGGOTA -->
          <div
            v-for="resident in group"
            :key="resident.id"
            class="bg-white p-5 mb-4 rounded-2xl transition flex flex-col md:flex-row justify-between items-start gap-4"
          >
            <div class="flex items-center gap-4 w-full md:w-3/4">
              <img
                :src="resident.photo || 'https://via.placeholder.com/100x100?text=No+Image'"
                class="w-24 h-24 rounded-lg object-cover"
              />

              <div>
                <h2 class="text-lg font-semibold text-gray-800">{{ resident.name }}</h2>
                <p class="text-sm text-gray-600 flex items-center gap-1 mb-1">
                  <i class="fa fa-briefcase"></i> {{ resident.occupation || "-" }}
                </p>
                <div class="text-sm text-gray-700 flex flex-wrap gap-4">
                  <span><i class="fa fa-id-card"></i> {{ resident.nik }}</span>
                  <span><i class="fa fa-hourglass-half"></i> {{ resident.age }}</span>
                  <span><i class="fa fa-users"></i> {{ resident.relation }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-gray-500 italic ml-2">
          Tidak ada anggota dalam kategori ini.
        </p>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && filteredResidents.length > entriesPerPage"
      class="flex justify-between items-center mt-6 text-sm text-gray-500"
    >
      <span>Showing {{ startIndex + 1 }}–{{ endIndex }} of {{ filteredResidents.length }}</span>
      <div class="flex gap-2">
        <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <button @click="nextPage" :disabled="endIndex >= filteredResidents.length" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

const router = useRouter();


const route = useRoute();
const BASE_URL = "http://127.0.0.1:8000";

const familyId = route.params.id;
const familyName = ref("");

const residents = ref([]);
const loading = ref(true); // <-- 🔥 LOADING STATE
const searchQuery = ref("");
const debouncedQuery = ref("");
const entriesPerPage = ref(10);
const page = ref(1);

async function fetchFamilyName() {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${BASE_URL}/api/head-of-families/${familyId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Gunakan nama dari relasi user
    familyName.value = response.data.data.user_name || "Tidak ada nama";

  } catch (error) {
    console.error("Gagal mengambil data kepala keluarga:", error);
  }
}

onMounted(async () => {
  await fetchFamilyName();   // <-- ambil nama Kepala Keluarga
  await fetchResidents();    // <-- baru ambil anggota
});

async function fetchResidents() {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${BASE_URL}/api/head-of-families/${familyId}/residents`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    residents.value = response.data.map((r) => ({
      id: r.id,
      name: r.name,
      nik: r.nik,
      occupation: r.occupation,
      relation: formatRelation(r.relation),
      photo: r.photo_url || null,
      age: calculateAge(r.date_of_birth),
    }));

  } catch (error) {
    console.error("Gagal mengambil data anggota:", error);
  } finally {
    loading.value = false; // <-- STOP LOADING
  }
}

function formatRelation(rel) {
  if (!rel) return "Orang Tua";

  const cleaned = rel.trim().toLowerCase();

  if (cleaned === "suami") return "Suami";
  if (cleaned === "istri") return "Istri";
  if (cleaned === "anak") return "Anak";

  return "Orang Tua";
}


function calculateAge(date) {
  if (!date) return "-";
  const diff = new Date().getFullYear() - new Date(date).getFullYear();
  return `${diff} Tahun`;
}

// Debounce Search
let debounceTimer;
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newQuery;
  }, 400);
});

const filteredResidents = computed(() => {
  const q = debouncedQuery.value.toLowerCase();

  return residents.value.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      (r.nik && r.nik.toLowerCase().includes(q));

    const matchesRelation =
      !relationFilter.value || r.relation === relationFilter.value;

    return matchesSearch && matchesRelation;
  });
});


// Pagination
const startIndex = computed(() => (page.value - 1) * entriesPerPage.value);
const endIndex = computed(() =>
  Math.min(startIndex.value + entriesPerPage.value, filteredResidents.value.length)
);

const relationFilter = ref(""); // "" = tampilkan semua
const availableRelations = ref(["Suami", "Istri", "Anak", "Orang Tua", "Mertua", "Cucu", "Kerabat"]);

const paginatedResidents = computed(() =>
  filteredResidents.value.slice(startIndex.value, endIndex.value)
);

function nextPage() { if (endIndex.value < filteredResidents.value.length) page.value++; }
function prevPage() { if (page.value > 1) page.value--; }

// Group by relation
const groupedResidents = computed(() => {
  const groups = {};
  
  // Gunakan filteredResidents, bukan paginatedResidents
  filteredResidents.value.forEach((item) => {
    if (!groups[item.relation]) groups[item.relation] = [];
    groups[item.relation].push(item);
  });

  return groups;
});

</script>

<style scoped>
</style>
