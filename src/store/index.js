import { createStore } from "vuex";

export default createStore({
  state: {
    game: null,
    mode: "join",
    userName: null,
  },
  mutations: {
    joinGame(state, payload) {
      state.mode = "play";
      state.userName = payload;
    },
    setGame(state, payload) {
      state.game = payload;
    },
  },
  getters: {
    getGame: (state) => state.game,
  },
  actions: {},
  modules: {},
});
