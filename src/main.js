import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/app.css";
import io from "socket.io-client";

const socket = io(
  process.env.NODE_ENV === "development"
    ? process.env.VUE_APP_DEV_SOCKET
    : process.env.VUE_APP_PROD_SOCKET
);

const app = createApp(App);
app.use(store);
app.use(router);
app.provide("socket", socket);
app.mount("#app");
