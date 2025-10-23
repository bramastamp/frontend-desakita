<template>
  <div class="map-container">
    <div id="map" class="map"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 🧭 Koordinat SMK Tunas Harapan Pati
const latitude = -6.7122068
const longitude = 111.0569336

onMounted(() => {
  // Inisialisasi peta
  const map = L.map('map', {
    zoomControl: true,
    attributionControl: false,
  }).setView([latitude, longitude], 15)

  // 🌍 Tambahkan tile layer dari OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 4,
  }).addTo(map)

  // 🧭 Marker dengan popup info
  const marker = L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`
      <b>SMK Tunas Harapan Pati</b><br>
      <small>Jl. Panglima Sudirman No.1, Pati</small>
    `)

  // Klik marker → buka popup
  marker.on('click', () => {
    marker.openPopup()
  })

  // 🌍 Animasi zoom-in saat peta muncul
  setTimeout(() => {
    map.setView([latitude, longitude], 17, {
      animate: true,
      duration: 2, // detik
      easeLinearity: 0.25,
    })
  }, 500)
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.map {
  width: 100%;
  height: 350px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 📱 Responsif penuh di HP */
@media (max-width: 768px) {
  .map {
    height: 280px;
  }
}
@media (max-width: 480px) {
  .map {
    height: 220px;
  }
}
</style>
