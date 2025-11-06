<template>
  <div
    ref="container"
    class="h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden relative"
  >
    <!-- LOGO -->
    <div ref="logo" class="flex-1 flex items-center justify-center p-8 animate-logo-in">
      <div class="text-center">
        <img :src="logoImg" alt="DesaQ Logo" class="w-80 mx-auto mb-3" />
        <h1 class="text-6xl font-extrabold text-teal-600">DesaQ</h1>
      </div>
    </div>

    <!-- FORM REGISTER -->
    <div ref="form" class="relative flex-1 flex items-center justify-center animate-form-in">
      <div class="absolute inset-0 bg-teal-600 rounded-l-[6rem] md:rounded-l-[8rem]"></div>

      <div class="relative z-10 w-full max-w-sm px-8 text-white">
        <h2 class="text-3xl font-bold text-center mb-1">Haii, Selamat Datang!</h2>
        <p class="text-teal-100 text-sm text-center mb-8">
          Silahkan Daftar Terlebih Dahulu
        </p>

        <form @submit.prevent="register" class="space-y-5">
          <div>
            <label class="block text-white text-sm font-medium mb-1">Name</label>
            <input
              v-model="name"
              type="text"
              placeholder="Nama Lengkap"
              class="w-full py-2 px-3 text-sm rounded-md bg-white/10 border border-white/30 text-white placeholder-teal-200 focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label class="block text-white text-sm font-medium mb-1">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="w-full py-2 px-3 text-sm rounded-md bg-white/10 border border-white/30 text-white placeholder-teal-200 focus:ring-2 focus:ring-white"
            />
          </div>

          <div>
            <label class="block text-white text-sm font-medium mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="w-full py-2 px-3 text-sm rounded-md bg-white/10 border border-white/30 text-white placeholder-teal-200 focus:ring-2 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-white text-teal-700 font-semibold py-3 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
            :disabled="loading"
          >
            <span v-if="!loading">Daftar</span>
            <span v-else class="flex items-center gap-2">
              <i class="fa-solid fa-spinner fa-spin"></i> Memproses...
            </span>
          </button>
        </form>

        <p class="text-center text-sm text-white mt-5">
          Sudah punya akun?
          <span
            @click="animateToLogin"
            class="cursor-pointer font-semibold text-white underline hover:text-gray-200 transition-colors"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../api";
import logoImg from "../../assets/logo desaq.png";
import { toastSuccess, toastError, toastWarning } from "../../utils/toast";

const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const form = ref(null);
const logo = ref(null);

const register = async () => {
  if (!name.value || !email.value || !password.value) {
    toastWarning("Semua kolom wajib diisi!");
    return;
  }

  if (password.value.length < 6) {
    toastWarning("Password minimal 6 karakter!");
    return;
  }

  try {
    loading.value = true;

    await api.post("/register", {
      name: name.value,
      email: email.value,
      password: password.value,
    });

    toastSuccess("Registrasi berhasil! Silakan login.");

    setTimeout(() => {
      router.push("/login");
    }, 1200);

  } catch (error) {
    toastError(
      error?.response?.data?.message ||
        "Registrasi gagal! Periksa data yang kamu masukkan."
    );
  } finally {
    loading.value = false;
  }
};


// ✅ Animasi keluar → Login
const animateToLogin = async () => {
  await nextTick();
  const f = form.value;
  const l = logo.value;

  f.classList.remove("animate-form-in");
  l.classList.remove("animate-logo-in");

  f.style.transition = l.style.transition = "none";

  requestAnimationFrame(() => {
    f.style.transition = l.style.transition =
      "transform 0.6s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.6s ease";

    f.style.transform = "translateX(70%) rotateY(10deg) translateZ(-40px)";
    l.style.transform = "translateX(-70%) rotateY(-10deg) translateZ(-40px)";
    f.style.opacity = l.style.opacity = "0";

    setTimeout(() => router.push("/login"), 600);
  });
};

// ✅ Animasi masuk
onMounted(() => {
  const f = form.value;
  const l = logo.value;

  requestAnimationFrame(() => {
    f.classList.add("animate-form-in");
    l.classList.add("animate-logo-in");
  });
});
</script>

<style scoped>
/* Animasi masuk */
@keyframes logoIn {
  from {
    transform: translateX(-60%) rotateY(-10deg) translateZ(-40px);
    opacity: 0;
  }
  to {
    transform: translateX(0) rotateY(0) translateZ(0);
    opacity: 1;
  }
}
@keyframes formIn {
  from {
    transform: translateX(60%) rotateY(10deg) translateZ(-40px);
    opacity: 0;
  }
  to {
    transform: translateX(0) rotateY(0) translateZ(0);
    opacity: 1;
  }
}
.animate-logo-in {
  animation: logoIn 0.7s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
.animate-form-in {
  animation: formIn 0.7s cubic-bezier(0.77, 0, 0.175, 1) forwards;
}
</style>
