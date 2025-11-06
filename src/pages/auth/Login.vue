<template>
  <div
    ref="container"
    class="min-h-screen h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden relative"
  >
    <!-- FORM LOGIN -->
    <div
      ref="form"
      class="relative flex-1 flex items-center justify-center order-1 md:order-none z-10 animate-form-in"
    >
      <div class="absolute inset-0 bg-teal-600 rounded-r-[6rem] md:rounded-r-[8rem]"></div>

      <div class="relative z-10 w-full max-w-sm px-8 text-white">
        <h2 class="text-3xl font-bold text-center mb-1">Hai, Selamat Datang!</h2>
        <p class="text-teal-100 text-sm text-center mb-8">
          Silakan masuk untuk melanjutkan
        </p>

        <form @submit.prevent="login" class="space-y-5">
          <div>
            <label class="block text-white text-sm font-medium mb-1">Email Address</label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-teal-200 text-sm">
                <i class="fa-regular fa-envelope"></i>
              </span>
              <input
                v-model="email"
                type="email"
                placeholder="Email"
                class="w-full pl-9 py-2 text-sm rounded-md bg-white/10 border border-white/30 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-white text-sm font-medium mb-1">Password</label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-teal-200 text-sm">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                v-model="password"
                type="password"
                placeholder="Password"
                class="w-full pl-9 py-2 text-sm rounded-md bg-white/10 border border-white/30 text-white placeholder-teal-200 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full bg-white text-teal-700 font-semibold py-3 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
            :disabled="loading"
          >
            <span v-if="!loading">Login</span>
            <span v-else class="flex items-center gap-2">
              <i class="fa-solid fa-spinner fa-spin"></i> Memproses...
            </span>
          </button>
        </form>

        <p class="text-center text-sm text-white mt-5">
          Belum punya akun?
          <span
            @click="animateToRegister"
            class="cursor-pointer font-semibold text-white underline hover:text-gray-200 transition-colors"
          >
            Daftar
          </span>
        </p>
      </div>
    </div>

    <!-- LOGO -->
    <div ref="logo" class="flex-1 flex items-center justify-center p-8 animate-logo-in">
      <div class="text-center">
        <img :src="logoImg" alt="DesaQ Logo" class="w-80 mx-auto mb-3" />
        <h1 class="text-6xl font-extrabold text-teal-600">DesaQ</h1>
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
const email = ref("");
const password = ref("");
const loading = ref(false);
const form = ref(null);
const logo = ref(null);

const login = async () => {
  // ✅ Validasi kolom kosong
  if (!email.value || !password.value) {
    toastWarning("Email dan password wajib diisi!");
    return;
  }

  try {
    loading.value = true;

    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("name", user.name);

    toastSuccess(`Selamat datang, ${user.name}`);

    setTimeout(() => {
      router.push(
        user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"
      );
    }, 500);

  } catch {
    toastError("Email atau password salah");
  } finally {
    loading.value = false;
  }
};

// ✅ Animasi ke register
const animateToRegister = async () => {
  await nextTick();
  const f = form.value;
  const l = logo.value;

  f.classList.remove("animate-form-in");
  l.classList.remove("animate-logo-in");

  f.style.transition = l.style.transition = "none";
  f.style.transform = "translateX(0) rotateY(0) translateZ(0)";
  l.style.transform = "translateX(0) rotateY(0) translateZ(0)";
  f.style.opacity = l.style.opacity = "1";

  requestAnimationFrame(() => {
    f.style.transition = l.style.transition =
      "transform 0.6s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.6s ease";
    f.style.transform = "translateX(-70%) rotateY(-10deg) translateZ(-40px)";
    l.style.transform = "translateX(70%) rotateY(10deg) translateZ(-40px)";
    f.style.opacity = l.style.opacity = "0";

    setTimeout(() => router.push("/register"), 600);
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
@keyframes logoIn {
  from {
    transform: translateX(60%) rotateY(10deg) translateZ(-40px);
    opacity: 0;
  }
  to {
    transform: translateX(0) rotateY(0) translateZ(0);
    opacity: 1;
  }
}

@keyframes formIn {
  from {
    transform: translateX(-60%) rotateY(-10deg) translateZ(-40px);
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
