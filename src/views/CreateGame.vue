<template>
  <div class="flex h-screen justify-center items-center">
    <div class="mockup-window bg-base-300">
      <div class="flex justify-center px-4 py-16 bg-base-200">
        <div class="p-10 card bg-base-200">
          <div class="form-control mb-3">
            <label class="label">
                <span
                    class="label-text transition-all"
                    :class="{'text-error': ! props.form.roomName.length}"
                >
                  {{ props.form.roomName.length === 0 ? 'Bir isim girmelisin' : "Oda Adı" }}
                </span>
            </label>
            <input
                type="text"
                v-model="props.form.roomName"
                placeholder="Oda adını giriniz"
                class="input"
                :class="{'input-error': props.form.roomName.length === 0}"
            >
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

          <button
              class="btn btn-primary mt-5"
              @click="createGame"
              :disabled="props.form.roomName.length === 0"
          >
            Oluştur
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {inject, reactive} from "vue";
import {uuid} from "vue-uuid"
import {useRouter} from "vue-router";

const socket = inject("socket")
const router = useRouter()

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
