<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Tambah Anggota Keluarga</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="submitForm" class="grid grid-cols-2 gap-6">
        <!-- Foto Profil -->
        <div class="flex flex-col items-center space-y-4">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            class="w-24 h-24 rounded-full object-cover"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center"
          >
            <User class="w-8 h-8 text-gray-500" />
          </div>

          <label class="bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
            Unggah
            <input type="file" class="hidden" @change="handleFileUpload" />
          </label>
        </div>

        <!-- Data Anggota -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input v-model="form.name" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">NIK</label>
            <input v-model="form.nik" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Nomor Ponsel</label>
            <input v-model="form.phone_number" type="text" class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Pekerjaan</label>
            <input v-model="form.occupation" type="text" class="input" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input v-model="form.date_of_birth" type="date" class="input" @change="calculateAge" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Usia</label>
              <input v-model="form.age" type="text" class="input bg-gray-100" readonly />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select v-model="form.gender" class="input" required>
              <option value="">-- Pilih --</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Status Pernikahan</label>
            <select v-model="form.marital_status" class="input" required>
              <option value="">-- Pilih --</option>
              <option value="single">Belum Menikah</option>
              <option value="married">Menikah</option>
              <option value="divorced">Cerai</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Hubungan dengan Kepala Rumah</label>
            <select v-model="form.relation" class="input" required>
              <option value="">-- Pilih --</option>
              <option value="istri">Istri</option>
              <option value="anak">Anak</option>
              <option value="orangtua">Orang Tua</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <!-- Tombol -->
        <div class="col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { User } from "lucide-vue-next";
import { toastError, toastSuccess, toastWarning } from "../../utils/toast";

const router = useRouter();
const BASE_URL = "http://127.0.0.1:8000";

const form = ref({
  head_of_family_id: "",
  name: "",
  nik: "",
  gender: "",
  date_of_birth: "",
  phone_number: "",
  occupation: "",
  marital_status: "",
  relation: "",
  photo: null,
  age: "",
});

const previewUrl = ref(null);

// ambil head_of_family milik user login
onMounted(async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${BASE_URL}/api/my-head-of-family`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    form.value.head_of_family_id = res.data.id;
  } catch (error) {
    console.error("Gagal mendapatkan data kepala keluarga:", error);
    toastError("Tidak dapat memuat data kepala keluarga Anda.");
  }
});

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png"];
  const maxSize = 2 * 1024 * 1024; // 2 MB

  if (!allowedTypes.includes(file.type)) {
    toastWarning("Hanya boleh unggah file JPG atau PNG.");
    return;
  }

  if (file.size > maxSize) {
    toastWarning("Ukuran maksimal 2MB.");
    return;
  }

  form.value.photo = file;
  previewUrl.value = URL.createObjectURL(file);
}

function calculateAge() {
  if (!form.value.date_of_birth) return;
  const today = new Date();
  const birthDate = new Date(form.value.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  form.value.age = `${age} tahun`;
}

async function submitForm() {
  if (!validateForm()) return;

  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append('head_of_family_id', form.value.head_of_family_id);
    formData.append('name', form.value.name);
    formData.append('nik', form.value.nik);
    formData.append('gender', form.value.gender);
    formData.append('date_of_birth', form.value.date_of_birth);
    formData.append('phone_number', form.value.phone_number);
    formData.append('occupation', form.value.occupation);
    formData.append('marital_status', form.value.marital_status);
    formData.append('relation', form.value.relation);
    if (form.value.photo) formData.append('photo', form.value.photo);

    // 🧠 Tambahkan ini untuk debug
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    await axios.post(`${BASE_URL}/api/my-residents`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toastSuccess("Anggota keluarga berhasil ditambahkan!");
    router.push("/user/my-residents");
  } catch (error) {
    console.error("Gagal menyimpan anggota:", error.response?.data || error);
    toastError("Gagal menambahkan anggota. Periksa kembali data Anda.");
  }
}

function validateForm() {
  if (!form.value.name || !form.value.nik || !form.value.gender || !form.value.date_of_birth) {
    toastWarning("Pastikan semua field wajib sudah diisi!");
    return false;
  }
  return true;
}
</script>

<style scoped>
@reference "tailwindcss";
.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
