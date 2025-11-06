<template>
  <header class="flex justify-between items-center px-6 py-4 bg-white">
    <div></div>

    <div class="flex items-center space-x-4">
      <!-- Profil -->
      <div class="flex items-center space-x-3">
        <!-- FOTO PROFIL -->
        <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          <img
            v-if="photo"
            :src="photo"
            alt="Profile"
            class="w-full h-full object-cover"
          />

          <!-- Default Avatar -->
          <svg
            v-else
            class="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a8.25 8.25 0 0 1 15 0v.75H4.5v-.75Z"
            />
          </svg>
        </div>

        <div>
          <h2 class="text-sm font-semibold text-gray-800">{{ userName }}</h2>
          <p class="text-xs text-gray-500">
            {{ userRole === "admin" ? "Kepala Desa" : "Kepala Keluarga" }}
          </p>
        </div>
      </div>

      <button
        @click="logout"
        class="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition"
      >
        <LogOut class="w-4 h-4 mr-2" />
        Logout
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { LogOut } from "lucide-vue-next";
import { toastSuccess } from "../utils/toast";

const router = useRouter();

const userName = ref("");
const userRole = ref("");
const photo = ref("");

onMounted(() => {
  // ✅ ambil langsung dari localStorage
  photo.value = localStorage.getItem("photo") || "";
  userName.value = localStorage.getItem("name") || "Pengguna";
  userRole.value = localStorage.getItem("role") || "user";
});

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("photo");

  router.push("/login");
  toastSuccess("Logout Berhasil!!");
};
</script>
