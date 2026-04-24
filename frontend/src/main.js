// main.js
// Entry point aplikasi Vue.
// Mendaftarkan semua plugin: Vuetify (UI framework), Vue Router (navigasi).
// Lalu me-mount aplikasi ke elemen #app di index.html.

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import vuetify from "./plugins/vuetify.js";

const app = createApp(App);

app.use(router);
app.use(vuetify);

app.mount("#app");
