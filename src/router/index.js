import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    redirect: {
      name: "CreateGame",
    },
  },
  {
    path: "/create-game",
    name: "CreateGame",
    component: () => import("../views/CreateGame.vue"),
  },
  {
    path: "/play-game/:uuid",
    name: "PlayGame",
    component: () => import("../views/PlayGame.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: {
      name: "CreateGame",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
