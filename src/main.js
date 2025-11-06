import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "leaflet/dist/leaflet.css";

/* ✅ Tambahkan Toast */
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import "./assets/toast.css"; // ✅ (jika kamu pakai custom toast style)

const app = createApp(App);

app.use(router);
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  draggable: true,
  pauseOnHover: true,
});

app.mount("#app");
