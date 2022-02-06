<template>

  <join-game v-if="mode === 'join'"/>

  <template v-if="mode === 'play'">
    <div class="flex flex-col h-screen">
      <header class="p-10">
        <div class="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box self-start">
          <div class="flex-1 px-2 mx-2">
            <span class="text-lg font-bold">
              {{ state.room.name }}
            </span>
          </div>
          <div class="flex-none px-2 mx-2 lg:flex">
            <div class="flex items-stretch">
              <button
                  data-tooltip-target="tooltip-copy"
                  data-tooltip-trigger="click"
                  type="button"
                  class="btn btn-ghost btn-sm rounded-btn"
                  @click="shareURL"
              >
                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img"
                     class="inline-block w-5 mr-2 stroke-current" preserveAspectRatio="xMidYMid meet" viewBox="0 0 36 36">
                  <path
                      d="M22.6 4h-1.05a3.89 3.89 0 0 0-7.31 0h-.84A2.41 2.41 0 0 0 11 6.4V10h14V6.4A2.41 2.41 0 0 0 22.6 4zm.4 4H13V6.25a.25.25 0 0 1 .25-.25h2.69l.12-1.11a1.24 1.24 0 0 1 .55-.89a2 2 0 0 1 3.15 1.18l.09.84h2.9a.25.25 0 0 1 .25.25z"
                      class="clr-i-outline clr-i-outline-path-1" fill="currentColor"></path>
                  <path
                      d="M33.25 18.06H21.33l2.84-2.83a1 1 0 1 0-1.42-1.42l-5.25 5.25l5.25 5.25a1 1 0 0 0 .71.29a1 1 0 0 0 .71-1.7l-2.84-2.84h11.92a1 1 0 0 0 0-2z"
                      class="clr-i-outline clr-i-outline-path-2" fill="currentColor"></path>
                  <path d="M29 16h2V6.68A1.66 1.66 0 0 0 29.35 5h-2.27v2H29z" class="clr-i-outline clr-i-outline-path-3"
                        fill="currentColor"></path>
                  <path
                      d="M29 31H7V7h2V5H6.64A1.66 1.66 0 0 0 5 6.67v24.65A1.66 1.66 0 0 0 6.65 33h22.71A1.66 1.66 0 0 0 31 31.33v-9.27h-2z"
                      class="clr-i-outline clr-i-outline-path-4" fill="currentColor"></path>
                </svg>
                Adresi Kopyala
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="m-auto">
        <div class="card col-span-1 row-span-3 shadow-lg xl:col-span-2 bg-base-200">
          <div class="card-body">
            <h2 class="my-4 text-2xl font-bold card-title" v-if="state.room.status === 'playing'">
              Oyun Devam Ediyor !
            </h2>
            <h2
                class="my-4 text-4xl font-bold card-title"
                v-if="state.room.status === 'finished' && ! state.showCountdown && state.avg !== 0"
            >
              Ortalama: {{ state.avg.toFixed(2) }}
            </h2>

            <span class="countdown font-mono text-6xl justify-center" v-if="state.showCountdown">
              <span :style="`--value:${state.waiting}`"></span>
            </span> <!-- /.countdown -->

            <div id="players" class="flex flex-row flex-wrap gap-2 justify-center mt-4">
              <div
                  v-for="(people, key) in state.room.users" :key="key"
                  class="text-center transition-all"
                  style="width: 80px"
              >
                <div class="flip-content" :class="{'flip-select': showIdea(people.idea) === '' && people.idea !== ''}">
                  <playing-card :number="people.idea ? showIdea(people.idea) : '?'" style="width: 80px; height: 112px"/>
                </div>
                <p class="font-medium text-lg pt-2">{{ people.name }}</p>
              </div>
            </div> <!-- /#players -->

            <div class="card-actions justify-center space-x-2">
              <button
                  class="btn btn-primary btn-lg"
                  @click="finishGame"
                  v-if="! state.showCountdown && state.room.status === 'playing'"
              >
                Bitir
              </button>
              <button
                  class="btn btn-primary btn-lg"
                  @click="newGame"
                  v-if="! state.showCountdown && state.room.status === 'finished'"
              >
                Tekrar Başlat
              </button>
            </div> <!-- .card-actions -->
          </div> <!-- /.card-body -->
        </div> <!-- /.card -->
      </main>

      <footer class="flex flex-row flex-wrap gap-x-2 gap-y-4 justify-center p-10">
        <playing-card
            v-for="number in numbers.filter(i => i !== '')"
            :key="number"
            :number="number.toString()"
            class="play-card"
            style="width: 80px"
            :class="{'play-card-selected': state.selectNumber === number}"
            @click="setCard(number)"
        />
      </footer>
    </div>
  </template>
</template>

<script setup>
import {computed, inject, reactive, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useStore} from "vuex";
import JoinGame from "@/components/JoinGame.vue";
import PlayingCard from "@/components/PlayingCard.vue";

const route = useRoute();
const router = useRouter();
const store = useStore()
const socket = inject("socket")

const defaultWaiting = 3
const numbers = ['', '0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?'];

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
  waiting: defaultWaiting,
  showCountdown: false
})

socket.on("connect", () => {
  console.log("socket bağlandı")
})

socket.on("room-action", payload => {
  // odaya giriş olduğunda sunucudan kullanıcı listesi gelir
  state.room = payload
})

socket.on("finished-game", payload => {
  // ortalama hesaplanır
  let temp = [];
  payload.users.forEach(item => {
    if (parseInt(item.idea) >= 0) {
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
      state.waiting = defaultWaiting
      state.showCountdown = false
      state.avg = (sum / temp.length) || 0;
    }
  }, 1000)
})

socket.on("disconnect", () => {
  // odadan çıkış olursa ana sayfaya gönder
  router.push({name: 'CreateGame'})
})

const shareURL = () => {
  navigator.clipboard.writeText(window.location.href)
}

const showIdea = idea => {
  if (state.room.status === "finished" && !state.showCountdown) {
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
    case "0":
      setCard("0");
      break;
    case "1":
      setCard('1');
      break;
    case "2":
      setCard('2');
      break;
    case "3":
      setCard('3');
      break;
    case "4":
      setCard('5');
      break;
    case "5":
      setCard('8');
      break;
    case "6":
      setCard('13');
      break;
    case "7":
      setCard('21');
      break;
    case "8":
      setCard('34');
      break;
    case "9":
      setCard('55');
      break;
    case "q":
      setCard('89');
      break;
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
