<template>
  <div class="mockup-window bg-base-300">
    <div class="flex justify-center px-4 py-16 bg-base-200">
      <div class="p-10 card bg-base-200">
        <div class="form-control mb-3">
          <input
              type="text"
              v-model="props.form.roomName"
              placeholder="Oda adını giriniz"
              class="input input-lg"
              :class="{'input-error': props.form.roomName.length === 0}"
          >
          <label class="label" v-if="props.form.roomName.length === 0">
            <span class="label-text-alt">Bir isim girmelisiniz</span>
          </label>
        </div>

        <div class="form-control mb-3" v-if="false">
          <label class="label">Oylama Türü</label>
          <select class="select w-full max-w-xs" v-model="props.form.type">
            <option disabled="disabled" selected="selected">Süper gücünü seç!</option>
            <option value="orj-fibonacci">Fibonacci ( 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ? )</option>
            <option value="mod-fibonacci">Modified Fibonacci ( 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ? )</option>
            <option value="tshirt">T-shirts (xxs, xs, s, m, l, xl, xxl, ?)</option>
          </select>
        </div>

        <button class="btn btn-primary mt-5" @click="createGame" :disabled="props.form.roomName.length === 0">
          Oluştur
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive} from "vue";
import {useRouter} from "vue-router";
import {io} from "socket.io-client";
import {uuid} from "vue-uuid"

const router = useRouter()
const socket = io("/")

const props = reactive({
  form: {
    roomName: "",
    type: "orj-fibonacci",
    uuid: uuid.v1()
  }
})

const createGame = () => {
  socket.emit("create-game", props.form)

  router.push({name: 'PlayGame', params: {uuid: props.form.uuid}})
}
</script>
