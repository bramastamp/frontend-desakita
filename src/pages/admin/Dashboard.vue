<template>
  <div class="p-6 bg-blue-50 min-h-screen space-y-8">
    <!-- Judul -->
    <h1 class="text-3xl font-bold text-gray-800 mb-4">Dashboard Desa</h1>

    <!-- Statistik Ringkas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div
        v-for="(item, i) in statCards"
        :key="i"
        class="bg-white rounded-2xl shadow p-6 flex items-center gap-4 transition hover:shadow-lg hover:scale-[1.02]"
      >
        <div :class="item.iconBg" class="p-3 rounded-full">
          <i :class="item.icon" class="text-2xl"></i>
        </div>
        <div>
          <h3 class="text-gray-600 text-sm">{{ item.label }}</h3>
          <p class="text-2xl font-bold text-gray-800">{{ item.value }}</p>
        </div>
      </div>
    </div>

    <!-- Informasi Terbaru -->
    <div class="bg-white rounded-2xl shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fa fa-bullhorn text-teal-500"></i> Informasi Terbaru
      </h2>
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

// 🔹 Info terbaru (dinamis)
const news = ref([])

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

    // 🔹 Gabung data terbaru dari 3 sumber
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

    // 🔹 Urutkan berdasarkan tanggal terbaru
    news.value = combined
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err)
  }
}

// 🔹 Statistik Ringkas
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
