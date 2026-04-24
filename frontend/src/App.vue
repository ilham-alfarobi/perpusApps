<!-- App.vue -->
<!-- Root component aplikasi. Hanya bertugas sebagai wadah router-view,
     yang akan me-render komponen Login atau Dashboard sesuai route aktif. -->
<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
// Root component bersih — semua logika ada di masing-masing view
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  height: 100%;
  font-family: "Inter", "Roboto", sans-serif;
}

/* Scrollbar kustom */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f0f4f8;
}
::-webkit-scrollbar-thumb {
  background: #1565c0;
  border-radius: 10px;
}
</style>
