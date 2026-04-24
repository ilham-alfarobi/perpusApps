// src/plugins/vuetify.js
// Konfigurasi Vuetify 3 sebagai UI framework.
// Mendefinisikan tema global dan mengaktifkan icon set Material Design Icons.

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

const perpusTheme = {
  dark: false,
  colors: {
    primary: "#1565C0",    // Biru gelap — warna utama aplikasi
    secondary: "#0288D1",  // Biru muda — aksen
    accent: "#FF6F00",     // Oranye — highlight/aksi penting
    error: "#D32F2F",
    warning: "#F57C00",
    info: "#0288D1",
    success: "#388E3C",
    background: "#F0F4F8",
    surface: "#FFFFFF",
  },
};

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "perpusTheme",
    themes: { perpusTheme },
  },
  defaults: {
    VBtn: { rounded: "lg" },
    VCard: { rounded: "xl" },
    VTextField: { variant: "outlined", density: "comfortable" },
    VDataTable: { hover: true },
  },
});
