<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Tambah Kepala Rumah Baru</h2>

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

        <!-- Data Kepala Rumah -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nama Kepala Rumah</label>
            <input v-model="form.nama" type="text" class="input" required />
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

        <!-- Akun -->
        <div class="col-span-2 border-t pt-4 mt-2">
          <h3 class="font-semibold mb-3">Akun</h3>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Alamat Email</label>
              <input v-model="form.email" type="email" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input v-model="form.password" type="password" class="input" required />
            </div>
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
import { ref } from "vue";
import axios from "axios";
import { User } from "lucide-vue-next";

const form = ref({
  nama: "",
  nik: "",
  ponsel: "",
  pekerjaan: "",
  tanggal_lahir: "",
  usia: "",
  jenis_kelamin: "",
  status: "",
  alamat: "",
  email: "",
  password: "",
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

async function submitForm() {
  try {
    // 1️⃣ Register user baru
    const registerResponse = await axios.post("http://localhost:8000/api/register", {
      name: form.value.nama,
      email: form.value.email,
      password: form.value.password,
      role: "user",
    });

    const userId = registerResponse.data.user.id;

    // 2️⃣ Buat HeadOfFamily baru
    const headData = {
      user_id: userId,
      profile_picture: form.value.foto ? form.value.foto.name : null,
      nik: form.value.nik,
      gender: form.value.jenis_kelamin,
      date_of_birth: form.value.tanggal_lahir,
      phone_number: form.value.ponsel,
      address: form.value.alamat,
      occupation: form.value.pekerjaan,
      marital_status: form.value.status,
    };

    await axios.post("http://localhost:8000/api/head-of-families", headData);

    alert("Data kepala rumah berhasil disimpan!");
  } catch (error) {
    console.error(error);
    alert("Gagal menyimpan data.");
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
