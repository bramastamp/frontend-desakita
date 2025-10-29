<template>
  <div class="p-6 bg-green-50 min-h-screen">
    <!-- Title -->
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Anggota Keluarga</h1>

    <!-- Search & Controls -->
    <div
      class="flex flex-wrap justify-between items-center bg-white p-4 rounded-lg mb-6 shadow-sm"
    >
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Cari NIK atau Nama Anggota"
        class="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      />
      <div class="flex gap-3 mt-3 md:mt-0">
        <div
          class="flex items-center gap-2 bg-green-50 border border-gray-200 px-3 py-2 rounded-lg"
        >
          <span class="text-sm text-gray-600">Show</span>
          <select
            v-model="entriesPerPage"
            class="border-none focus:ring-0 bg-green-50"
          >
            <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">
              {{ n }} Entries
            </option>
          </select>
        </div>

        <button
          @click="openAddModal"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <i class="fa fa-plus"></i> Tambah Baru
        </button>
      </div>
    </div>

    <!-- Kelompok Berdasarkan Relasi -->
    <div v-for="(group, relation) in groupedResidents" :key="relation" class="mb-8">
      <!-- Judul Relasi -->
      <h2 class="text-xl font-semibold text-green-700 border-l-4 border-green-500 pl-3 mb-4">
        {{ relation }}
      </h2>

      <!-- Daftar Anggota dalam Kelompok -->
      <div
        v-if="group.length"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="resident in group"
          :key="resident.id"
          class="bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <div class="flex items-center gap-4">
            <img
              :src="resident.photo || 'https://via.placeholder.com/80'"
              alt="Foto"
              class="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <h2 class="text-lg font-semibold text-gray-800">
                {{ resident.name }}
              </h2>
              <p class="text-sm text-gray-600 flex items-center gap-1 mb-1">
                <i class="fa fa-briefcase"></i> {{ resident.occupation || '-' }}
              </p>
              <div class="text-sm text-gray-700 flex flex-wrap gap-4">
                <span class="flex items-center gap-1">
                  <i class="fa fa-id-card"></i> {{ resident.nik }}
                </span>
                <span class="flex items-center gap-1">
                  <i class="fa fa-hourglass-half"></i> {{ resident.age }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi -->
          <div class="flex justify-end gap-2 mt-4">
            <button
              @click.stop="router.push(`/user/my-residents/edit/${resident.id}`)"
              class="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <i class="fa fa-edit"></i> Manage
            </button>
            <button
              @click.stop="deleteResident(resident.id)"
              class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center"
              title="Hapus Anggota"
            >
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Jika Tidak Ada Anggota di Relasi Tersebut -->
      <p v-else class="text-gray-500 italic ml-2">Belum ada anggota dengan relasi ini.</p>
    </div>

    <!-- Pagination -->
    <div
      class="flex justify-between items-center mt-6 text-sm text-gray-500"
      v-if="filteredResidents.length > entriesPerPage"
    >
      <span
        >Showing {{ startIndex + 1 }}–{{ endIndex }} of
        {{ filteredResidents.length }}</span
      >
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
          :disabled="endIndex >= filteredResidents.length"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const BASE_URL = "http://127.0.0.1:8000";

const residents = ref([]);
const searchQuery = ref("");
const debouncedQuery = ref("");
const entriesPerPage = ref(10);
const page = ref(1);

onMounted(fetchResidents);

async function fetchResidents() {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/api/my-residents`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    residents.value = response.data.map((r) => ({
      id: r.id,
      name: r.name,
      nik: r.nik,
      occupation: r.occupation,
      relation: r.relation || "Lainnya",
      photo: r.photo ? `${BASE_URL}/storage/${r.photo}` : null,
      date_of_birth: r.date_of_birth,
      age: calculateAge(r.date_of_birth),
    }));
  } catch (error) {
    console.error("Gagal mengambil data anggota:", error);
  }
}

function calculateAge(date) {
  if (!date) return "-";
  const diff = new Date().getFullYear() - new Date(date).getFullYear();
  return `${diff} Tahun`;
}

async function deleteResident(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus anggota ini?")) return;
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`${BASE_URL}/api/my-residents/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("✅ Anggota berhasil dihapus.");
    await fetchResidents();
  } catch (error) {
    console.error("Gagal menghapus:", error);
    alert("❌ Terjadi kesalahan saat menghapus data.");
  }
}

let debounceTimer;
watch(searchQuery, (newQuery) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newQuery;
  }, 400);
});

const filteredResidents = computed(() => {
  const q = debouncedQuery.value.toLowerCase();
  return residents.value.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      (r.nik && r.nik.toLowerCase().includes(q))
  );
});

const startIndex = computed(() => (page.value - 1) * entriesPerPage.value);
const endIndex = computed(() =>
  Math.min(startIndex.value + entriesPerPage.value, filteredResidents.value.length)
);
const paginatedResidents = computed(() =>
  filteredResidents.value.slice(startIndex.value, endIndex.value)
);

// 🔹 Grouping berdasarkan relasi
const groupedResidents = computed(() => {
  const grouped = {};
  paginatedResidents.value.forEach((r) => {
    if (!grouped[r.relation]) grouped[r.relation] = [];
    grouped[r.relation].push(r);
  });
  return grouped;
});

function nextPage() {
  if (endIndex.value < filteredResidents.value.length) page.value++;
}
function prevPage() {
  if (page.value > 1) page.value--;
}
function openAddModal() {
  router.push("/user/my-residents/add");
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
