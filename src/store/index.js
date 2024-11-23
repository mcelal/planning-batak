import { createStore } from "vuex";

export default createStore({
  state: {
    mode: "join",
    game: null,
    userName: null,
    roomName: null,
  },
  mutations: {
    createGame(state, payload) {
      state.roomName = payload.roomName;
      state.game = payload.gameUUID;
    },
    joinGame(state, payload) {
      // state.mode = "play";
      state.userName = payload.userName;
      state.game = payload.gameUUID;
    },
    setGame(state, payload) {
      state.game = payload;
    },
    setUserName(state, payload) {
      state.userName = payload;
    },
  },
  getters: {
    getGame: (state) => state.game,
    getUserName: (state) => state.userName,
  },
  actions: {},
  modules: {},
});
