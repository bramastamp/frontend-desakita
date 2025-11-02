<template>
  <div class="p-8 bg-blue-50 min-h-screen">
    <h2 class="text-2xl font-bold mb-6">Tambah Pembangunan Desa</h2>

    <div class="bg-white rounded-2xl shadow p-6">
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label class="block font-medium text-gray-700">Judul</label>
          <input v-model="form.title" type="text" class="input" required />
        </div>

        <div>
          <label class="block font-medium text-gray-700">Penanggung Jawab (PIC)</label>
          <input v-model="form.pic" type="text" class="input" required />
        </div>

        <div>
          <label class="block font-medium text-gray-700">Deskripsi</label>
          <textarea v-model="form.description" class="input" rows="3" required></textarea>
        </div>

        <div>
          <label class="block font-medium text-gray-700">Lokasi</label>
          <input v-model="form.location" type="text" class="input" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-gray-700">Status</label>
            <select v-model="form.status" class="input" required>
              <option value="">-- Pilih --</option>
              <option value="planning">Perencanaan</option>
              <option value="ongoing">Sedang Berjalan</option>
              <option value="completed">Selesai</option>
            </select>
          </div>

          <div>
            <label class="block font-medium text-gray-700">Total Anggaran (Rp)</label>
            <input v-model="form.budget" type="number" class="input" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium text-gray-700">Tanggal Mulai</label>
            <input v-model="form.start_date" type="date" class="input" required />
          </div>

          <div>
            <label class="block font-medium text-gray-700">Tanggal Selesai</label>
            <input v-model="form.end_date" type="date" class="input" required />
          </div>
        </div>

        <div>
          <label class="block font-medium text-gray-700">Foto Dokumentasi</label>
          <input type="file" @change="handleFileUpload" class="input" />
          <div v-if="previewUrl" class="mt-3">
            <img :src="previewUrl" class="w-40 h-32 object-cover rounded-lg border" />
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button type="submit" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const form = ref({
  title: "",
  pic: "",
  description: "",
  location: "",
  status: "",
  budget: "",
  start_date: "",
  end_date: "",
  photo: null,
});

const previewUrl = ref(null);

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.type)) return alert("File harus JPG atau PNG!");
  if (file.size > 2 * 1024 * 1024) return alert("Maksimal 2MB!");

  form.value.photo = file;
  previewUrl.value = URL.createObjectURL(file);
}

async function submitForm() {
  try {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    Object.entries(form.value).forEach(([key, val]) => {
      if (val !== null) formData.append(key, val);
    });

    await axios.post("http://127.0.0.1:8000/api/developments", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("✅ Data pembangunan berhasil disimpan!");
    router.push("/admin/developments");
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan data pembangunan!");
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.input {
  @apply w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none;
}
</style>
