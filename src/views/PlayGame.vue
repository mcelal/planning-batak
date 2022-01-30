<template>
  <div class="mockup-window bg-base-300">
    <div class="flex justify-center px-4 py-16 bg-base-200">

      <div id="join" v-if="mode === 'join'">
        <join-game/>
      </div> <!-- /join -->

      <div id="play" v-if="mode === 'play'">
        <h1>ORTALAMA: {{ state.avg }}</h1>
        <pre>{{ state.room }}</pre>
        <div class="avatar placeholder" v-for="(people, key) in state.room.users" :key="key">
          <div class="bg-neutral-focus text-neutral-content rounded text-xs p-3 m-4 w-20 h-32 flex-col">
            <span class="text-2xl">{{ people.name }}</span>
            <p>{{ people.name }}</p>
            <p>{{ showIdea(people.idea) }}</p>
          </div>
        </div>
        <div class="m-4 align-center">
          <div class="btn-group">
            <input type="radio" name="options" id="option" v-model="state.selectNumber" value="" data-title="-" class="btn">
            <input type="radio" name="options" id="option1" v-model="state.selectNumber" value="?" data-title="?" class="btn">
            <input type="radio" name="options" id="option2" v-model="state.selectNumber" value="1" data-title="1" class="btn">
            <input type="radio" name="options" id="option3" v-model="state.selectNumber" value="2" data-title="2" class="btn">
            <input type="radio" name="options" id="option4" v-model="state.selectNumber" value="3" data-title="3" class="btn">
            <input type="radio" name="options" id="option5" v-model="state.selectNumber" value="5" data-title="5" class="btn">
            <input type="radio" name="options" id="option8" v-model="state.selectNumber" value="8" data-title="8" class="btn">
            <input type="radio" name="options" id="option13" v-model="state.selectNumber" value="13" data-title="13" class="btn">
            <input type="radio" name="options" id="option21" v-model="state.selectNumber" value="21" data-title="21" class="btn">
            <input type="radio" name="options" id="option34" v-model="state.selectNumber" value="34" data-title="34" class="btn">
          </div>

          <button class="btn btn-primary btn-lg" @click="finishGame" v-if="state.room.status === 'playing'">BİTİR</button>
          <button class="btn btn-primary btn-lg" @click="newGame" v-else>BAŞLAT</button>
        </div>
      </div> <!-- /play -->
    </div>
  </div><!-- /window -->
</template>

<script setup>
import {computed, reactive, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {io} from "socket.io-client";
import JoinGame from "@/components/JoinGame.vue";
import {useStore} from "vuex";

const route = useRoute();
const router = useRouter();
const socket = io('localhost:3000')
const store = useStore()

const state = reactive({
  mode: "join",
  room: {
    uuid: null,
    name: null,
    users: [],
    status: "playing",
  },
  selectNumber: null,
  avg: 0
})

socket.on("connect", () => {
  console.log("socket bağlandım")
})

socket.on("welcome-room", payload => {
  // odaya giriş olduğunda sunucudan kullanıcı listesi gelir
  state.room = payload
  // console.log("odaya bağlanan var")
})

socket.on("run-game", payload => {
  console.log("oy kullanildi", payload)
})

socket.on("disconnect", () => {
  // odadan çıkış olursa ana sayfaya gönder
  router.push({name: 'CreateGame'})
})

const showIdea = idea => {
  if (state.room.status === "playing") {
    return "*"
  } else {
    return idea ?? ":("
  }
}

const finishGame = () => {
  console.log("oyunu bitir")
  socket.emit("end-game", {
    uuid: route.params.uuid
  })
}

const newGame = () => {
  console.log("yeni oyun başlat")
  socket.emit("new-game",{
    uuid: route.params.uuid
  })
  state.selectNumber = null
}

const mode = computed(() => store.state.mode)
watch(mode, (mode) => {
  if (mode === "play") {
    socket.emit("join-room", {
      uuid: route.params.uuid,
      name: store.state.userName
    })
  }
})

// const status = computed(() => state.room.status ?? null)
watch(() => state.room, room => {
  if (room && room.status === "finished") {
    console.log(typeof room.users, room.users)

    room.users.map(i => {
      console.log(i)
    })
    // let numbers = [];
    // room.users.each(i => {
    //   console.log(i.idea)
    // })
  }
})

watch(() => state.selectNumber, number => {
  socket.emit("run-game", {
    uuid: route.params.uuid,
    idea: number,
  })
})
</script>
