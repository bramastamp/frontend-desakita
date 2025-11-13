<template>
  <div class="p-6 bg-blue-50 min-h-screen space-y-8">
    <!-- Judul -->
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Dashboard Desa</h1>

    <!-- Statistik Ringkas -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6"
    >
      <template v-if="loading">
        <!-- Skeleton Loading -->
        <div
          v-for="i in 5"
          :key="'skeleton-' + i"
          class="bg-white rounded-2xl shadow p-6 flex items-center gap-4 animate-pulse"
        >
          <div class="w-12 h-12 rounded-full bg-gray-200"></div>
          <div class="flex-1 space-y-2">
            <div class="w-24 h-3 bg-gray-200 rounded"></div>
            <div class="w-16 h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(item, i) in statCards"
          :key="i"
          class="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4 transition hover:shadow-lg hover:scale-[1.02] min-w-[180px]"
        >
          <div :class="item.iconBg" class="p-3 rounded-full shrink-0">
            <i :class="item.icon" class="text-2xl"></i>
          </div>
          <div class="text-center sm:text-left">
            <h3 class="text-gray-600 text-sm">{{ item.label }}</h3>
            <p class="text-2xl font-bold text-gray-800">{{ item.value }}</p>
          </div>
        </div>
      </template>
    </div>

    <!-- Informasi Terbaru -->
    <div class="bg-white rounded-2xl shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fa fa-bullhorn text-teal-500"></i> Informasi Terbaru
      </h2>

      <!-- Skeleton untuk berita -->
      <template v-if="loading">
        <ul class="space-y-2">
          <li
            v-for="i in 5"
            :key="'news-skeleton-' + i"
            class="flex justify-between py-2 border-b border-gray-100 last:border-none animate-pulse"
          >
            <span class="w-2/3 h-4 bg-gray-200 rounded"></span>
            <span class="w-1/5 h-4 bg-gray-200 rounded"></span>
          </li>
        </ul>
      </template>

      <template v-else>
        <ul>
          <li
            v-for="item in news"
            :key="item.title"
            class="flex justify-between py-2 border-b border-gray-100 last:border-none"
          >
            <span class="text-gray-700">{{ item.title }}</span>
            <span class="text-sm text-gray-500">{{ item.date }}</span>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ref, onMounted, computed } from "vue"

const BASE_URL = "http://127.0.0.1:8000"
const stats = ref({
  headFamilies: 0,
  totalResidents: 0,
  developments: 0,
  events: 0,
  socialAids: 0,
})
const news = ref([])
const loading = ref(true) // 🔹 indikator loading

onMounted(fetchDashboardData)

async function fetchDashboardData() {
  try {
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }

    const [familiesRes, devRes, eventsRes, bansosRes] = await Promise.all([
      axios.get(`${BASE_URL}/api/head-of-families`, { headers }),
      axios.get(`${BASE_URL}/api/developments`, { headers }),
      axios.get(`${BASE_URL}/api/events`, { headers }),
      axios.get(`${BASE_URL}/api/social-aids`, { headers }),
    ])

    const families = familiesRes.data || []
    const totalResidents = families.reduce((sum, f) => {
      const count = f.residents ? f.residents.length : f.residents_count || 0
      return sum + count + 1 // kepala keluarga juga dihitung
    }, 0)

    stats.value = {
      headFamilies: families.length,
      totalResidents,
      developments: devRes.data?.length || 0,
      events: eventsRes.data?.length || 0,
      socialAids: bansosRes.data?.length || 0,
    }

    const combined = [
      ...devRes.data.map((d) => ({
        title: `Pembangunan: ${d.title || d.name}`,
        date: new Date(d.created_at).toLocaleDateString("id-ID"),
      })),
      ...eventsRes.data.map((e) => ({
        title: `Acara: ${e.title || e.name}`,
        date: new Date(e.created_at).toLocaleDateString("id-ID"),
      })),
      ...bansosRes.data.map((b) => ({
        title: `Bansos: ${b.title || b.name}`,
        date: new Date(b.created_at).toLocaleDateString("id-ID"),
      })),
    ]

    news.value = combined
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err)
  } finally {
    loading.value = false // 🔹 pastikan loading berakhir
  }
}

const statCards = computed(() => [
  {
    label: "Kepala Keluarga",
    value: stats.value.headFamilies,
    icon: "fa fa-user-tie text-teal-600",
    iconBg: "bg-teal-100",
  },
  {
    label: "Total Penduduk",
    value: stats.value.totalResidents,
    icon: "fa fa-users text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    label: "Pembangunan",
    value: stats.value.developments,
    icon: "fa fa-building text-yellow-600",
    iconBg: "bg-yellow-100",
  },
  {
    label: "Acara Desa",
    value: stats.value.events,
    icon: "fa fa-calendar text-pink-600",
    iconBg: "bg-pink-100",
  },
  {
    label: "Bansos",
    value: stats.value.socialAids,
    icon: "fa fa-hand-holding-heart text-green-600",
    iconBg: "bg-green-100",
  },
])
</script>

<style scoped>
@reference "tailwindcss";
</style>
