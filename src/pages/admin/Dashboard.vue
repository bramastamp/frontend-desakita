<template>
  <div class="p-6 bg-[#f3faf7] min-h-screen space-y-10">
    <!-- Judul -->
    <h1 class="text-2xl md:text-3xl font-semibold text-gray-800">
      Statistik Desa
    </h1>

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
      <h2
        class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"
      >
        <i class="fa fa-bullhorn text-teal-500"></i>
        Informasi Terbaru (7 Hari Terakhir)
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
      return sum + count + 1
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
        date: new Date(d.created_at),
      })),
      ...eventsRes.data.map((e) => ({
        title: `Acara: ${e.title || e.name}`,
        date: new Date(e.created_at),
      })),
      ...bansosRes.data.map((b) => ({
        title: `Bansos: ${b.aid_name || b.name || "Program Bantuan"}`,
        date: new Date(b.created_at),
      })),
    ]

    // 🔹 Urutkan berdasarkan tanggal terbaru
    news.value = combined
      .filter((item) => item.date >= oneWeekAgo)
      .sort((a, b) => b.date - a.date)
      .map((item) => ({
        ...item,
        date: item.date.toLocaleDateString("id-ID"),
      }))
  } catch (err) {
    console.error("Gagal memuat data dashboard:", err)
  }
}

// 🔹 Statistik Ringkas
const statCards = computed(() => [
  {
    label: "Jumlah Penduduk",
    value: stats.value.totalResidents,
    icon: "fa fa-users text-green-700",
    iconBg: "bg-green-100",
  },
  {
    label: "Pembangunan",
    value: stats.value.developments,
    icon: "fa fa-building text-green-700",
    iconBg: "bg-green-100",
  },
  {
    label: "Kepala Rumah",
    value: stats.value.headFamilies,
    icon: "fa fa-crown text-green-700",
    iconBg: "bg-green-100",
  },
  {
    label: "Total Acara",
    value: stats.value.events,
    icon: "fa fa-calendar text-green-700",
    iconBg: "bg-green-100",
  },
])
</script>
