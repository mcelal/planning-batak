<template>
  <h1 class="text-3xl text-center">{{ state.room.name }}</h1>
  <div class="p-4 lg:p-10">
    <div class="card col-span-1 row-span-3 shadow-lg xl:col-span-2 bg-base-300">
      <div class="card-body">
        <span class="font-mono text-6xl countdown justify-center" v-if="state.showCountdown">
          <span :style="`--value:${state.waiting}`"></span>
        </span>

        <template v-if="mode === 'join'">
          <h2 class="my-4 text-4xl font-bold card-title">Başlamaya Hazırlanın !</h2>
          <join-game/>
        </template>

        <template v-else>
          <h2 class="my-4 text-4xl font-bold card-title" v-if="state.room.status === 'playing'">Oyun Devam Ediyor !</h2>
          <h2 class="my-4 text-4xl font-bold card-title" v-if="state.room.status === 'finished' && ! state.showCountdown && state.avg !== 0">Ortalama: {{ state.avg.toFixed(2) }}</h2>

          <div class="flex flex-row flex-wrap gap-2 justify-center mt-4">
            <div class="text-center" v-for="(people, key) in state.room.users" :key="key" style="width: 120px">
              <playing-card
               :number="showIdea(people.idea)"
               :class="{
                 'outline outline-white': people.idea > 0
               }"
               />
              <p class="font-medium text-lg pt-2">{{ people.name }}</p>
            </div>
          </div>

          <div class="justify-center space-x-2 card-actions">
            <button
                class="btn btn-primary btn-lg"
                @click="finishGame"
                v-if="! state.showCountdown && state.room.status === 'playing'">
              BİTİR
            </button>
            <button
                class="btn btn-primary btn-lg"
                @click="newGame"
                v-if="! state.showCountdown && state.room.status === 'finished'">
              BAŞLAT
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>

  <div class="absolute bottom-0 left-0 px-3 h-44 w-full" v-if="mode === 'play'">
    <div class="flex flex-row flex-wrap gap-2 justify-center">
      <playing-card
          v-for="number in numbers.filter(i => i !== '')"
          :key="number"
          :number="number.toString()"
          class="play-card"
          :class="{
            'play-card-selected': state.selectNumber === number,
            }"
          @click="setCard(number)"
      />
    </div>
  </div>
</template>

<script setup>
import {computed, reactive, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import {io} from "socket.io-client";
import JoinGame from "@/components/JoinGame.vue";
import PlayingCard from "@/components/PlayingCard.vue";

const url = new URL(location.origin)
url.port = "3000"
url.protocol = "ws"

console.log("ws:", url.origin)

const route = useRoute();
const router = useRouter();
const socket = io(url.origin)
const store = useStore()

const numbers = ['', '?', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'];

const state = reactive({
  mode: "join",
  room: {
    uuid: null,
    name: null,
    users: [],
    status: "finished",
  },
  selectNumber: '',
  avg: 0,
  waiting: 5,
  showCountdown: false
})

socket.on("connect", () => {
  console.log("socket bağlandı")
})

socket.on("welcome-room", payload => {
  // odaya giriş olduğunda sunucudan kullanıcı listesi gelir
  state.room = payload
  console.log("welcome-room", payload)
})

socket.on("finished-game", payload => {
  // ortalama hesaplanır
  let temp = [];
  payload.users.forEach(item => {
    if (parseInt(item.idea)) {
      temp.push(parseInt(item.idea))
    }
  })
  const sum = temp.reduce((a, b) => a + b, 0)

  state.room.status = "finished"
  state.showCountdown = true

  let countdown = setInterval(() => {
    state.waiting -= 1

    if (state.waiting < 0) {
      clearInterval(countdown)
      state.room = payload
      state.waiting = 5
      state.showCountdown = false
      state.avg = (sum / temp.length) || 0;
    }
  }, 1000)
})

socket.on("disconnect", () => {
  // odadan çıkış olursa ana sayfaya gönder
  router.push({name: 'CreateGame'})
})

const showIdea = idea => {
  if (state.room.status === "finished" && ! state.showCountdown) {
    return idea ?? ":("
  } else {
    return ""
  }
}

const setCard = (number) => {
  if (state.room.status === "finished") return false;

  if (state.selectNumber === number) {
    state.selectNumber = ''
  } else {
    state.selectNumber = number
  }
}

const finishGame = () => {
  socket.emit("end-game", {
    uuid: route.params.uuid
  })
}

const newGame = () => {
  socket.emit("new-game", {
    uuid: route.params.uuid
  })
  state.selectNumber = ""
}

const keyboardListener = (event) => {
  switch (event.key) {
    case "0": setCard("?"); break;
    case "1": setCard('1'); break;
    case "2": setCard('2'); break;
    case "3": setCard('3'); break;
    case "4": setCard('5'); break;
    case "5": setCard('8'); break;
    case "6": setCard('13'); break;
    case "7": setCard('21'); break;
    case "8": setCard('34'); break;
    case "9": setCard('55'); break;
    case "q": setCard('89'); break;
  }
}

document.addEventListener('keydown', keyboardListener, false);

const mode = computed(() => store.state.mode)
watch(mode, (mode) => {
  if (mode === "play") {
    socket.emit("join-room", {
      uuid: route.params.uuid,
      name: store.state.userName
    })
  }
})

watch(() => state.room, (room, oldRoom) => {
  if (oldRoom.status === 'finished' && room.status === 'playing') {
    state.selectNumber = ""
  }
})

watch(() => state.selectNumber, number => {
  if (state.room.status === 'playing') {
    socket.emit("run-game", {
      uuid: route.params.uuid,
      idea: number,
    })
  }
})

</script>
