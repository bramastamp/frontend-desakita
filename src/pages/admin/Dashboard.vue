<template>
  <div class="p-6 bg-[#f3faf7] min-h-screen space-y-10">
    <!-- Judul -->
    <h1 class="text-2xl md:text-3xl font-semibold text-gray-800">
      Statistik Desa
    </h1>

    <!-- Grid Utama -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <!-- Card Besar - Bantuan Sosial -->
      <div
        class="lg:col-span-2 rounded-3xl text-white shadow-lg p-10 flex flex-col justify-between min-h-[320px]"
        style="background: linear-gradient(135deg, #9DDE60 0%, #3B6636 66%, #062B24 100%)"
      >
        <template v-if="loading">
          <!-- Skeleton untuk card besar -->
          <div class="animate-pulse space-y-4">
            <div class="w-14 h-14 bg-white/20 rounded-full"></div>
            <div class="h-5 bg-white/30 rounded w-1/3"></div>
            <div class="h-8 bg-white/30 rounded w-2/3"></div>
            <div class="h-4 bg-white/30 rounded w-1/2"></div>
            <div class="h-12 bg-white/20 rounded mt-6 w-24"></div>
          </div>
        </template>

        <template v-else>
          <div>
            <div
              class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-6"
            >
              <i class="fa fa-hand-holding-heart text-white text-3xl"></i>
            </div>
            <h4 class="text-base uppercase tracking-wide font-medium text-green-100">
              Bantuan Sosial
            </h4>
            <h2 class="text-3xl md:text-4xl font-bold mb-3">
              Dari Desa untuk Warga
            </h2>
            <p class="text-green-100 text-sm md:text-base leading-relaxed max-w-lg">
              Wujudkan kesejahteraan desa dengan bantuan sosial yang tepat sasaran.
            </p>
          </div>

          <div class="mt-10">
            <p class="text-6xl font-extrabold">{{ stats.socialAids }}</p>
            <p class="text-green-100 text-sm mt-1">Total Program Bansos</p>
          </div>
        </template>
      </div>

      <!-- Card Statistik (2x2 Grid) -->
      <div class="grid grid-cols-2 grid-rows-2 gap-4 h-full">
        <template v-if="loading">
          <!-- Skeleton untuk card kecil -->
          <div
            v-for="i in 4"
            :key="i"
            class="bg-white rounded-2xl p-5 shadow animate-pulse aspect-square"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
              <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
            <div class="h-6 bg-gray-200 rounded w-1/3 mt-4"></div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(item, i) in filteredStatCards"
            :key="i"
            class="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition flex flex-col justify-between items-start aspect-square"
          >
            <div class="flex items-center justify-between w-full mb-2">
              <h3 class="text-gray-600 text-sm font-medium">
                {{ item.label }}
              </h3>
              <div
                class="w-8 h-8 flex items-center justify-center rounded-full"
                :class="item.iconBg"
              >
                <i :class="item.icon" class="text-lg"></i>
              </div>
            </div>
            <p class="text-2xl font-bold text-gray-900">{{ item.value }}</p>
          </div>
        </template>
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

      <template v-if="loading">
        <!-- Skeleton untuk list berita -->
        <ul class="animate-pulse space-y-2">
          <li
            v-for="i in 3"
            :key="i"
            class="flex justify-between py-2 border-b border-gray-100 last:border-none"
          >
            <span class="h-4 bg-gray-200 rounded w-1/2"></span>
            <span class="h-4 bg-gray-200 rounded w-16"></span>
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
          <li
            v-if="news.length === 0"
            class="text-gray-500 text-sm italic py-2"
          >
            Tidak ada informasi terbaru minggu ini.
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
const loading = ref(true)

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

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    news.value = combined
      .filter((item) => item.date >= oneWeekAgo)
      .sort((a, b) => b.date - a.date)
      .map((item) => ({
        ...item,
        date: item.date.toLocaleDateString("id-ID"),
      }))
  } catch (err) {
    console.error("Gagal memuat data dashboard admin:", err)
  } finally {
    loading.value = false
  }
}

const filteredStatCards = computed(() => [
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
