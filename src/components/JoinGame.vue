<template>
  <div class="flex h-screen justify-center items-center">
    <div class="card col-span-1 row-span-3 shadow-lg xl:col-span-2 bg-base-200">
      <div class="card-body">
        <h2 class="my-4 text-4xl font-bold card-title">Başlamaya Hazırlanın !</h2>
        <div class="form-control mb-3">
          <label class="label">Adınız</label>
          <input type="text" v-model="state.userName" class="input">
        </div>
        <button class="btn btn-primary mt-5" @click="play" :disabled="! state.userName.length">Başla</button>
      </div>
    </div>
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
