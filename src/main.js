import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/app.css";

console.log("BatakVer: 0.2");

createApp(App).use(store).use(router).mount("#app");
