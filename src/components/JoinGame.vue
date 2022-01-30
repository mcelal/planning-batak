<template>
  <div style="text-align: center">
    <div class="form-control mb-3">
      <label class="label">Adınız</label>
      <input type="text" v-model="state.userName" class="input">
    </div>
    <button class="btn btn-primary mt-5" @click="play" :disabled="! state.userName.length">Başla</button>
  </div>
</template>

<script setup>
import {reactive} from "vue";
import {useStore} from "vuex";

const store = useStore()

const state = reactive({
  userName: "",
})

const oldName = localStorage.getItem("planning-batak-username")
if (oldName) {
  state.userName = oldName
}

const play = () => {
  store.commit("joinGame", state.userName)
  localStorage.setItem("planning-batak-username", state.userName)
}
</script>
