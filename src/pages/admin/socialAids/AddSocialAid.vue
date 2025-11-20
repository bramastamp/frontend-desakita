<template>
  <div class="p-6 bg-blue-50 min-h-screen">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Tambah Bantuan Sosial</h1>

    <div class="bg-white rounded-xl shadow p-6 space-y-5">
      <!-- Nama Bantuan -->
      <div>
        <label class="block font-medium text-gray-700 mb-1"
          >Nama Bantuan Sosial</label
        >
        <input
          v-model="form.aid_name"
          type="text"
          placeholder="Masukkan nama bantuan sosial"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
        />
      </div>

      <!-- Kategori -->
      <div>
        <label class="block font-medium text-gray-700 mb-1">Kategori</label>
        <select
          v-model="form.category"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
        >
          <option value="">-- Pilih Kategori --</option>
          <option value="bahan pokok">Bahan Pokok</option>
          <option value="uang tunai">Uang Tunai</option>
          <option value="bbm subsidi">BBM Subsidi</option>
          <option value="kesehatan">Kesehatan</option>
        </select>
      </div>

      <!-- Nominal & Donatur -->
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium text-gray-700 mb-1">Nominal</label>
          <input
            v-model="form.nominal"
            type="number"
            placeholder="Masukkan nominal bantuan"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>
        <div>
          <label class="block font-medium text-gray-700 mb-1"
            >Nama Donatur</label
          >
          <input
            v-model="form.donor_name"
            type="text"
            placeholder="Masukkan nama donatur"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>
      </div>

      <!-- Deskripsi -->
      <div>
        <label class="block font-medium text-gray-700 mb-1"
          >Deskripsi (opsional)</label
        >
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Tuliskan deskripsi bantuan sosial..."
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
        ></textarea>
      </div>

      <!-- Thumbnail -->
      <div>
        <label class="block font-medium text-gray-700 mb-1"
          >Thumbnail (opsional)</label
        >
        <input type="file" @change="handleFileUpload" class="w-full" />
        <div v-if="preview" class="mt-3">
          <img :src="preview" class="w-48 rounded-lg shadow" alt="Preview" />
        </div>
      </div>

      <!-- Pilih Penerima -->
      <div>
        <label class="block font-medium text-gray-700 mb-1">Pilih Kepala Keluarga Penerima</label>

        <!-- Search -->
        <div class="mb-2">
          <input
            v-model="searchInput"
            type="text"
            placeholder="Cari berdasarkan NIK atau alamat..."
            class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <div v-if="loadingRecipients" class="text-gray-500 italic">Memuat daftar kepala keluarga...</div>

        <div
          v-else
          class="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto"
        >
          <div
            v-for="family in paginatedFamilies"
            :key="family.id"
            class="flex items-center gap-2 py-1"
          >
            <input
              type="checkbox"
              :value="family.id"
              v-model="selectedRecipients"
              class="text-green-600 focus:ring-green-500"
            />
            <span class="text-gray-700 text-sm">
              {{ family.nik }} — {{ family.address }}
            </span>
          </div>

          <div v-if="!paginatedFamilies.length" class="text-gray-500 text-center py-3">
            Tidak ada hasil yang cocok.
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredFamilies.length > itemsPerPage" class="flex justify-center items-center mt-3 gap-2">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-2 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            ‹
          </button>
          <span class="text-gray-700 text-sm">Halaman {{ currentPage }} dari {{ totalPages }}</span>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-2 py-1 border rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>

      <!-- Tombol -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          @click="router.push('/admin/social-aids/list')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Batal
        </button>
        <button
          @click="submitForm"
          class="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg"
        >
          <i class="fa fa-check mr-2"></i> Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { toastSuccess, toastError } from '../../../utils/toast';

const router = useRouter();
const BASE_URL = 'http://127.0.0.1:8000';

const form = ref({
  category: '',
  aid_name: '',
  nominal: '',
  donor_name: '',
  description: '',
  thumbnail: null,
});

const preview = ref(null);
const selectedRecipients = ref([]);
const headOfFamilies = ref([]);
const loadingRecipients = ref(true);

// Handle upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    form.value.thumbnail = file;
    preview.value = URL.createObjectURL(file);
  }
}

// Fetch kepala keluarga
onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${BASE_URL}/api/head-of-families`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    headOfFamilies.value = res.data;
  } catch (err) {
    console.error('Gagal memuat data kepala keluarga:', err);
  } finally {
    loadingRecipients.value = false;
  }
});

// Search dan Pagination
const searchInput = ref('')
const searchQuery = ref('') // untuk debounce
const currentPage = ref(1)
const itemsPerPage = 5

// Debounce pencarian (500 ms)
let debounceTimer
watch(searchInput, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchQuery.value = newVal.toLowerCase()
    currentPage.value = 1 // reset ke halaman pertama
  }, 500)
})

// Filter data berdasarkan pencarian
const filteredFamilies = computed(() => {
  const query = searchQuery.value
  if (!query) return headOfFamilies.value
  return headOfFamilies.value.filter((f) => {
    const nik = f.nik?.toLowerCase() || ''
    const addr = f.address?.toLowerCase() || ''
    return nik.includes(query) || addr.includes(query)
  })
})

// Pagination logic
const totalPages = computed(() =>
  Math.ceil(filteredFamilies.value.length / itemsPerPage)
)

const paginatedFamilies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredFamilies.value.slice(start, start + itemsPerPage)
})

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

// Submit form
async function submitForm() {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.keys(form.value).forEach(key => {
      if (form.value[key]) formData.append(key, form.value[key]);
    });

    // 1️⃣ Simpan data bantuan sosial
    const { data: newAid } = await axios.post(
      `${BASE_URL}/api/social-aids`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // 2️⃣ Simpan penerima (jika ada)
    if (selectedRecipients.value.length > 0) {
      await axios.post(
        `${BASE_URL}/api/social-aids/${newAid.id}/recipients`,
        { head_of_family_ids: selectedRecipients.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    if (!form.value.aid_name || !form.value.category || !form.value.nominal || !form.value.donor_name) {
      toastError('Mohon lengkapi semua field wajib.');
      return;
    }

    toastSuccess('Bantuan sosial berhasil ditambahkan.');
    router.push('/admin/social-aids/list');
  } catch (err) {
    console.error('Gagal menambahkan bantuan sosial:', err);
    toastError('Gagal menambahkan bantuan sosial.');
  }
}
</script>

<style scoped>
input[type='checkbox'] {
  accent-color: #10b981;
}
</style>
