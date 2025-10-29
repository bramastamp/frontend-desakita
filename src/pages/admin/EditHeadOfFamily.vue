<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Edit Kepala Rumah</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="updateForm" class="grid grid-cols-2 gap-6">
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
            Ubah Foto
            <input type="file" class="hidden" @change="handleFileUpload" />
          </label>
        </div>

        <!-- Data Kepala Rumah -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Kepala Rumah</label>
            <input v-model="form.nama" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input v-model="form.email" type="email" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">NIK</label>
            <input v-model="form.nik" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Nomor Ponsel</label>
            <input v-model="form.ponsel" type="text" class="input" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Pekerjaan</label>
            <input v-model="form.pekerjaan" type="text" class="input" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
              <input v-model="form.tanggal_lahir" type="date" class="input" @change="calculateAge" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Usia</label>
              <input v-model="form.usia" type="text" class="input bg-gray-100" readonly />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select v-model="form.jenis_kelamin" class="input" required>
              <option value="">-- Pilih --</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Status Pernikahan</label>
            <select v-model="form.status" class="input" required>
              <option value="">-- Pilih --</option>
              <option value="single">Belum Menikah</option>
              <option value="married">Menikah</option>
              <option value="divorced">Cerai</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Alamat</label>
            <textarea v-model="form.alamat" class="input" rows="2" required></textarea>
          </div>
        </div>

        <!-- Tombol -->
        <div class="col-span-2 flex justify-end mt-6">
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Perbarui
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { User } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const form = ref({
  nama: "",
  email: "",
  nik: "",
  ponsel: "",
  pekerjaan: "",
  tanggal_lahir: "",
  usia: "",
  jenis_kelamin: "",
  status: "",
  alamat: "",
  foto: null,
});

const previewUrl = ref(null);

function handleFileUpload(event) {
  const file = event.target.files[0];
  form.value.foto = file;
  previewUrl.value = URL.createObjectURL(file);
}

function calculateAge() {
  const today = new Date();
  const birthDate = new Date(form.value.tanggal_lahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  form.value.usia = age + " tahun";
}

// 🔹 Ambil data lama
onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`http://localhost:8000/api/head-of-families/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data.data;
    form.value.nama = data.user_name;
    form.value.email = data.user_email;
    form.value.nik = data.nik;
    form.value.ponsel = data.phone_number;
    form.value.pekerjaan = data.occupation;
    form.value.tanggal_lahir = data.date_of_birth
      ? data.date_of_birth.split("T")[0]
      : "";
    form.value.jenis_kelamin = data.gender;
    form.value.status = data.marital_status;
    form.value.alamat = data.address;
    form.value.usia = hitungUmur(data.date_of_birth);
    previewUrl.value = data.profile_picture_url || null;
  } catch (err) {
    console.error("Gagal memuat data:", err);
  }
});

function hitungUmur(tanggalLahir) {
  const today = new Date();
  const birthDate = new Date(tanggalLahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age + " tahun";
}

// 🔹 Update data
async function updateForm() {
  try {
    // 🔸 Validasi sederhana di sisi frontend

    if (form.value.foto && form.value.foto.size > 2 * 1024 * 1024) {
      alert("❌ Ukuran foto terlalu besar! Maksimal 2MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (form.value.foto && !allowedTypes.includes(form.value.foto.type)) {
      alert("❌ Format foto tidak valid! Gunakan JPG atau PNG.");
      return;
    }

    // 🔹 Siapkan data
    const token = localStorage.getItem("token");
    const formData = new FormData();

    if (form.value.foto) {
      formData.append("profile_picture", form.value.foto);
    }
    formData.append("name", form.value.nama);
    formData.append("email", form.value.email);
    formData.append("nik", form.value.nik);
    formData.append("gender", form.value.jenis_kelamin);
    formData.append("date_of_birth", form.value.tanggal_lahir);
    formData.append("phone_number", form.value.ponsel);
    formData.append("address", form.value.alamat);
    formData.append("occupation", form.value.pekerjaan);
    formData.append("marital_status", form.value.status);

    // 🔹 Kirim ke server
    await axios.post(`http://localhost:8000/api/head-of-families/${id}?_method=PUT`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("✅ Data kepala rumah berhasil diperbarui!");
    router.push("/admin/head-of-families");

  } catch (error) {
    console.error("Gagal update:", error.response?.data || error);

    if (error.response?.status === 422) {
      // 🔸 Tampilkan error validasi dari Laravel
      const errors = error.response.data.errors;
      let errorMessages = "Gagal memperbarui data karena kesalahan berikut:\n\n";
      for (const key in errors) {
        errorMessages += `• ${errors[key][0]}\n`;
      }
      alert(errorMessages);
    } else if (error.response?.status === 413) {
      alert("❌ File foto terlalu besar untuk diunggah!");
    } else if (error.response?.status === 500) {
      alert("⚠️ Terjadi kesalahan pada server. Coba lagi nanti.");
    } else {
      alert("❌ Gagal memperbarui data. Periksa koneksi dan coba lagi.");
    }
  }
}

</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
