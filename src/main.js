import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/app.css";
import io from "socket.io-client";

const socket = io(
  import.meta.env.DEV
    ? import.meta.env.VITE_DEV_SOCKET
    : import.meta.env.VITE_PROD_SOCKET,
);

createApp(App).use(store).use(router).provide("socket", socket).mount("#app");
