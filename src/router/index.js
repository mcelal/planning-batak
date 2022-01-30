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
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
