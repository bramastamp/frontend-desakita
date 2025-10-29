<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Edit Anggota Keluarga</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="updateResident" class="grid grid-cols-2 gap-6">
        <!-- Foto Profil -->
        <div class="flex flex-col items-center space-y-4">
          <img
            v-if="previewUrl"
            :src="previewUrl"
            class="w-24 h-24 rounded-full object-cover border"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center"
          >
            <User class="w-8 h-8 text-gray-500" />
          </div>

          <label class="bg-gray-900 text-white px-4 py-2 rounded-lg cursor-pointer">
            Ganti Foto
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
        <div class="col-span-2 flex justify-end mt-6 gap-3">
          <button
            type="button"
            @click="router.push('/user/my-residents')"
            class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { User } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const BASE_URL = "http://127.0.0.1:8000";

const form = ref({
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

onMounted(fetchResident);

async function fetchResident() {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${BASE_URL}/api/my-residents/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;

    // Format tanggal agar cocok untuk input type="date"
    const formattedDate = data.date_of_birth
      ? new Date(data.date_of_birth).toISOString().split("T")[0]
      : "";

    // Isi setiap field tanpa overwrite seluruh object
    form.value.name = data.name;
    form.value.nik = data.nik;
    form.value.gender = data.gender;
    form.value.date_of_birth = formattedDate;
    form.value.phone_number = data.phone_number;
    form.value.occupation = data.occupation;
    form.value.marital_status = data.marital_status;
    form.value.relation = data.relation;
    form.value.photo = null;
    form.value.age = calculateAgeFromDate(data.date_of_birth);

    if (data.photo) {
      previewUrl.value = `${BASE_URL}/storage/${data.photo}`;
    }
  } catch (error) {
    console.error("Gagal memuat data anggota:", error);
    alert("Tidak dapat memuat data anggota keluarga.");
    router.push("/user/my-residents");
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png"];
  const maxSize = 2 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    alert("Hanya boleh unggah file JPG atau PNG.");
    return;
  }

  if (file.size > maxSize) {
    alert("Ukuran maksimal 2MB.");
    return;
  }

  form.value.photo = file;
  previewUrl.value = URL.createObjectURL(file);
}

function calculateAge() {
  form.value.age = calculateAgeFromDate(form.value.date_of_birth);
}

function calculateAgeFromDate(date) {
  if (!date) return "";
  const today = new Date();
  const birth = new Date(date);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} tahun`;
}

async function updateResident() {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Object.entries(form.value).forEach(([key, value]) => {
      if (value !== null && value !== "") formData.append(key, value);
    });
    if (form.value.photo) formData.append("photo", form.value.photo);

    await axios.post(`${BASE_URL}/api/my-residents/${route.params.id}?_method=PUT`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("✅ Data anggota berhasil diperbarui!");
    router.push("/user/my-residents");
  } catch (error) {
    console.error("Gagal memperbarui:", error.response?.data || error);
    alert("❌ Gagal memperbarui data anggota.");
  }
}
</script>

<style scoped>
@reference "tailwindcss";
.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
