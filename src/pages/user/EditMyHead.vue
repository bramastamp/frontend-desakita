<template>
  <div class="p-8 bg-blue-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Edit Data Saya</h2>

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
            <label class="block text-sm font-medium text-gray-700">Nama</label>
            <input v-model="form.nama" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input v-model="form.email" type="email" class="input" />
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
import axios from "axios";
import { User } from "lucide-vue-next";
import { toastError, toastSuccess } from "../../utils/toast";
import { useRouter } from "vue-router";
const router = useRouter();


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
  if (!form.value.tanggal_lahir) return;

  const today = new Date();
  const birthDate = new Date(form.value.tanggal_lahir);
  let age = today.getFullYear() - birthDate.getFullYear();

  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  form.value.usia = age + " tahun";
}

// =============================
// 🔹 AMBIL DATA DIRI (GET)
// =============================
onMounted(async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:8000/api/my-head-of-family/detail", {
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

    previewUrl.value = data.profile_picture_url;
    calculateAge(); // panggil setelah tanggal_lahir terisi

  } catch (err) {
    console.error(err);
    toastError("Gagal memuat data diri!");
  }
});

// ==================================
// 🔹 UPDATE DATA DIRI (PUT)
// ==================================
async function updateForm() {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const formData = new FormData();
    if (form.value.foto) formData.append("profile_picture", form.value.foto);

    formData.append("name", form.value.nama);
    formData.append("email", form.value.email);
    formData.append("nik", form.value.nik);
    formData.append("gender", form.value.jenis_kelamin);
    formData.append("date_of_birth", form.value.tanggal_lahir);
    formData.append("phone_number", form.value.ponsel);
    formData.append("address", form.value.alamat);
    formData.append("occupation", form.value.pekerjaan);
    formData.append("marital_status", form.value.status);

    await axios.post(
      "http://localhost:8000/api/my-head-of-family/update",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toastSuccess("Data berhasil diperbarui!");

    // ===============================
    // 🔹 REDIRECT BERDASARKAN ROLE
    // ===============================
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }

  } catch (error) {
    console.error(error);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      let msg = "";
      for (const key in errors) msg += `${errors[key][0]}\n`;
      toastError(msg);
      return;
    }

    toastError("Gagal memperbarui data!");
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
