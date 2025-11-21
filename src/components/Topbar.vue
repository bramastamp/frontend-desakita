<template>
  <header class="flex justify-between items-center px-6 py-4 bg-white">
    <div></div>

    <div class="flex items-center space-x-4">
      <!-- WARNING ICON -->
      <div 
        v-if="isIncomplete && userRole === 'user'" 
        class="relative group"
      >
        <!-- Icon -->
        <div 
          class="w-5 h-5 flex items-center justify-center 
                bg-yellow-100 text-yellow-600 border border-yellow-400
                rounded-full text-xs font-bold cursor-pointer"
        >
          !
        </div>

        <!-- Tooltip -->
        <div 
          class="absolute left-1/2 -translate-x-1/2 top-7 
                hidden group-hover:block
                bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg
                w-48 z-50"
        >
          Lengkapi data diri Anda segera.
        </div>
      </div>
      
      <!-- Profil -->
      <div
        class="flex items-center space-x-3 p-2 transition overflow-hidden
          profile-box
          hover:profile-hover" 
        :class="userRole === 'user' ? 'hover:bg-gray-100' : 'cursor-default',
                userRole === 'admin' ? 'no-hover' : ''"
        @click="handleProfileClick"
      >
      <!-- FOTO PROFIL -->
      <div class="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
        <img
          v-if="photo"
          :src="photo"
          alt="Profile"
          class="w-full h-full object-cover"
        />
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
const isIncomplete = ref(false);

onMounted(async () => {
  photo.value = localStorage.getItem("photo") || "";
  userName.value = localStorage.getItem("name") || "Pengguna";
  userRole.value = localStorage.getItem("role") || "user";

  if (userRole.value === "user") {
    checkHeadStatus();
  }
});

async function checkHeadStatus() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/api/my-head-of-family/status", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    const data = await res.json();
    isIncomplete.value = data.incomplete;
  } catch (err) {
    console.error("Gagal cek status head of family", err);
  }
}


const handleProfileClick = () => {
  if (userRole.value === "admin") return; // admin tidak bisa klik

  router.push("/user/my-head/edit");
};


const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("photo");

  router.push("/login");
  toastSuccess("Logout Berhasil!!");
};
</script>

<style scoped>
.profile-box {
  border-top-left-radius: 9999px !important;
  border-bottom-left-radius: 9999px !important;
  border-top-right-radius: 3000px !important;
  border-bottom-right-radius: 3000px !important;
}

.profile-box:hover {
  background-color: rgba(0, 0, 0, 0.05); /* sedikit gelap saat hover */
    cursor: pointer !important;
}

.no-hover:hover {
  background-color: transparent !important;
  cursor: default !important;
}

</style>
