<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Profil Desa</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Nama Desa Section -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-600 mb-4">Nama Desa</h2>
            <h3 class="text-3xl font-bold text-gray-900 mb-2">Desa Kita</h3>
            <div class="flex items-center text-gray-600">
              <MapPin class="w-5 h-5 mr-2" />
              <span>Pati, Indonesia</span>
            </div>
          </div>

          <!-- Main Image -->
          <div class="bg-white rounded-lg overflow-hidden shadow-sm">
            <img
              :src="view"
              alt="Desa Kita"
              class="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <!-- Small Images Grid -->
          <div class="grid grid-cols-2 gap-4">
            <img
              :src="sawah"
              alt="Landscape 1"
              class="w-full h-32 object-cover rounded-lg shadow-sm"
            />
            <img
              :src="landscape"
              alt="Landscape 2"
              class="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          </div>

          <!-- Tentang Desa Section -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-600 mb-4">Tentang Desa</h2>
            <p class="text-gray-700 leading-relaxed text-sm">
              Desa adalah suatu wilayah yang ditempatkan sekelompok masyarakat yang hidup bersama dengan sistem pemerintahan sendiri, memiliki adat istiadat, norma, serta mata pencaharian yang umumnya masih sederhana dan dekat dengan alam.
            </p>
          </div>

          <!-- Peta Desa Section -->
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-600 mb-4">Peta Desa</h2>
            <MapView />
          </div>
        </div>

        <!-- Right Column -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg p-6 shadow-sm sticky top-6">
            <h2 class="text-sm font-semibold text-gray-600 mb-6">Detail Desa</h2>

            <!-- Profile Card -->
            <div class="flex items-center mb-6 pb-6 border-b border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
                alt="Budi"
                class="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 class="font-semibold text-gray-900">Budi</h3>
                <p class="text-xs text-gray-500">Kepala Desa</p>
              </div>
            </div>

            <!-- Stats -->
            <div class="space-y-4">
              <!-- Population -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <Users class="w-5 h-5 text-green-500 mt-1" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-semibold text-gray-900">999</p>
                  <p class="text-xs text-gray-500">Jumlah Penduduk</p>
                </div>
              </div>

              <!-- Area -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <Leaf class="w-5 h-5 text-green-500 mt-1" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-semibold text-gray-900">999999m</p>
                  <p class="text-xs text-gray-500">Luas Pertanian</p>
                </div>
              </div>

              <!-- Land Area -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <Square class="w-5 h-5 text-green-500 mt-1" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-semibold text-gray-900">999999m</p>
                  <p class="text-xs text-gray-500">Luas Area</p>
                </div>
              </div>

              <!-- Establishment Date -->
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <Calendar class="w-5 h-5 text-green-500 mt-1" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-semibold text-gray-900">Sun, 10 Oct 1945</p>
                  <p class="text-xs text-gray-500">Desa Terbentuk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MapPin, Map, Users, Leaf, Square, Calendar } from 'lucide-vue-next'

// gambar
import view from '../../assets/view.jpg'
import landscape from '../../assets/landscape.jpg'
import sawah from '../../assets/sawah.jpg'

// peta
import MapView from '../../components/MapView.vue'
</script>

<style scoped>
/* Add any additional custom styles here if needed */
</style>