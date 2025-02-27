<template>
  <div class="flex flex-col h-screen">
    <header class="p-10">
      <div
        class="flex flex-wrap justify-between navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box self-start"
      >
        <div class="pl-2 text-lg font-bold">{{ state.room.name }}</div>
        <div class="overflow-hidden">
          <button
            data-tooltip-target="tooltip-copy"
            data-tooltip-trigger="click"
            type="button"
            class="btn btn-ghost btn-sm rounded-btn"
            @click="shareURL"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="img"
              class="inline-block w-5 mr-2 stroke-current"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 36 36"
            >
              <path
                d="M22.6 4h-1.05a3.89 3.89 0 0 0-7.31 0h-.84A2.41 2.41 0 0 0 11 6.4V10h14V6.4A2.41 2.41 0 0 0 22.6 4zm.4 4H13V6.25a.25.25 0 0 1 .25-.25h2.69l.12-1.11a1.24 1.24 0 0 1 .55-.89a2 2 0 0 1 3.15 1.18l.09.84h2.9a.25.25 0 0 1 .25.25z"
                class="clr-i-outline clr-i-outline-path-1"
                fill="currentColor"
              ></path>
              <path
                d="M33.25 18.06H21.33l2.84-2.83a1 1 0 1 0-1.42-1.42l-5.25 5.25l5.25 5.25a1 1 0 0 0 .71.29a1 1 0 0 0 .71-1.7l-2.84-2.84h11.92a1 1 0 0 0 0-2z"
                class="clr-i-outline clr-i-outline-path-2"
                fill="currentColor"
              ></path>
              <path
                d="M29 16h2V6.68A1.66 1.66 0 0 0 29.35 5h-2.27v2H29z"
                class="clr-i-outline clr-i-outline-path-3"
                fill="currentColor"
              ></path>
              <path
                d="M29 31H7V7h2V5H6.64A1.66 1.66 0 0 0 5 6.67v24.65A1.66 1.66 0 0 0 6.65 33h22.71A1.66 1.66 0 0 0 31 31.33v-9.27h-2z"
                class="clr-i-outline clr-i-outline-path-4"
                fill="currentColor"
              ></path>
            </svg>
            Adresi Kopyala
          </button>
        </div>
      </div>
    </header>

    <main class="m-auto">
      <div
        class="card col-span-1 row-span-3 shadow-lg xl:col-span-2 bg-base-200"
      >
        <div class="card-body">
          <h2
            v-if="state.room.status === 'playing'"
            class="my-4 text-2xl font-bold card-title text-center"
          >
            Oyun Devam Ediyor !
          </h2>
          <h2
            v-if="
              state.room.status === 'finished' &&
              !state.showCountdown &&
              state.room.gameScore !== 0
            "
            class="my-4 text-4xl font-bold card-title text-center"
          >
            Ortalama: {{ state.room.gameScore.toFixed(2) }}
          </h2>

          <span
            v-if="state.showCountdown"
            class="countdown font-mono text-6xl justify-center"
          >
            <span :style="`--value:${state.waiting}`"></span>
          </span>
          <!-- /.countdown -->

          <div
            id="players"
            class="flex flex-row flex-wrap gap-2 justify-center mt-4"
          >
            <div
              v-for="(people, key) in state.room.users"
              :key="key"
              class="text-center transition-all"
              style="width: 80px"
            >
              <div
                class="flip-content"
                :class="{
                  'flip-select':
                    people.idea &&
                    people.idea !== '' &&
                    showIdea(people.idea) === '',
                }"
              >
                <playing-card
                  :number="people.idea ? showIdea(people.idea) : '?'"
                  style="width: 80px; height: 112px"
                />
              </div>
              <p class="font-medium text-lg pt-2">
                {{ people.name }}
              </p>
            </div>
          </div>
          <!-- /#players -->

          <div class="card-actions justify-center space-x-2">
            <button
              v-if="!state.showCountdown && state.room.status === 'playing'"
              class="btn btn-primary"
              @click="finishGame"
            >
              Bitir
            </button>
            <button
              v-if="!state.showCountdown && state.room.status === 'finished'"
              class="btn btn-primary"
              @click="newGame"
            >
              Tekrar Başlat
            </button>
          </div>
          <!-- .card-actions -->
        </div>
        <!-- /.card-body -->
      </div>
      <!-- /.card -->
    </main>

    <footer class="flex flex-row flex-wrap gap-x-2 gap-y-4 justify-center p-10">
      <playing-card
        v-for="number in numbers.filter((i) => i !== '')"
        :key="number"
        :number="number.toString()"
        class="play-card"
        style="width: 80px"
        :class="{ 'play-card-selected': selectNumber === number }"
        @click="setCard(number)"
      />
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeMount, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import PlayingCard from "../components/PlayingCard.vue";
import { supabase } from "../lib/supabaseClient";
import { uuid } from "vue-uuid";

const route = useRoute();
const router = useRouter();
const store = useStore();

onBeforeMount(async () => {
  await checkUser();
  await getGame();
});

const defaultWaiting = 0;
const numbers = [
  "",
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "?",
];

const checkUser = async () => {
  const userName = await store.getters.getUserName;
  if (userName === null) {
    await router.push({
      name: "JoinGame",
      params: { uuid: route.params.uuid },
    });
  }
};

const getGame = async () => {
  const { data, error } = await supabase
    .from("games")
    .select(`*, ideas(user, idea)`)
    .eq("id", route.params.uuid)
    .maybeSingle();

  if (!data || error) {
    await router.push({ name: "CreateGame" });
  }

  state.room.name = data.name;
  state.room.status = data.status;

  data.ideas?.forEach((idea) => {
    if (state.room.users?.[idea.user] !== undefined) {
      state.room.users[idea.user].idea = idea.idea;
    }
  });
};

const state = reactive({
  room: {
    uuid: route.params.uuid,
    name: "",
    users: {},
    status: "playing",
    gameScore: 0,
  },
  waiting: defaultWaiting,
  showCountdown: false,
  myKey: "user-" + uuid.v1(),
});

const channel = supabase
  .channel("game-" + state.room.uuid, {
    config: {
      broadcast: {
        ack: true,
        self: true,
      },
      presence: {
        key: state.myKey,
      },
    },
  })
  .on("presence", { event: "join" }, async ({ key, newPresences }) => {
    if (!newPresences[0].name) {
      return;
    }

    if (state.room.users[key] === undefined) {
      state.room.users[key] = {
        key: key,
        name: newPresences[0].name,
        idea: null,
      };
    }
  })
  .on("presence", { event: "leave" }, ({ key }) => {
    if (state.room.users[key]) {
      delete state.room.users[key];
    }
  })
  .subscribe(async (status) => {
    if (status !== "SUBSCRIBED") {
      return;
    }

    const userName = await store.getters.getUserName;
    await channel.track({
      name: userName,
      online_at: new Date().toISOString(),
    });
  });

supabase
  .channel("update-game-ideas")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "ideas",
      filter: "game=eq." + state.room.uuid,
    },
    (payload) => {
      if (state.room.users[payload.new.user] !== undefined) {
        state.room.users[payload.new.user].idea = payload.new.idea;
      }
    },
  )
  .subscribe();

supabase
  .channel("update-game")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "games",
      filter: "id=eq." + state.room.uuid,
    },
    (payload) => {
      switch (payload.new.status) {
        case "playing":
          handleNewGame();
          break;
        case "finished":
          handleFinishGame();
          break;
      }
    },
  )
  .subscribe();

const shareURL = () => {
  navigator.clipboard.writeText(window.location.href);
};

const newGame = async () => {
  await supabase
    .from("games")
    .update({
      status: "playing",
    })
    .eq("id", route.params.uuid);
};

const handleNewGame = () => {
  state.room.status = "playing";

  Object.values(state.room.users).forEach((user) => {
    state.room.users[user.key].idea = null;
  });
};

const finishGame = async () => {
  await supabase
    .from("games")
    .update({
      status: "finished",
    })
    .eq("id", route.params.uuid);
};

const handleFinishGame = () => {
  state.room.status = "finished";
  state.showCountdown = true;

  let countdown = setInterval(() => {
    state.waiting -= 1;

    if (state.waiting < 0) {
      clearInterval(countdown);
      state.waiting = defaultWaiting;
      state.showCountdown = false;
      state.room.gameScore = gameScore.value;
    }
  }, 1000);
};

const showIdea = (idea) => {
  if (state.room.status === "finished" && !state.showCountdown) {
    return idea ?? ":(";
  } else {
    return "";
  }
};

const setCard = async (number) => {
  if (state.room.status === "finished") return false;

  const idea = selectNumber.value === number ? "" : number;

  await supabase.from("ideas").upsert(
    {
      key: state.room.uuid + state.myKey,
      game: state.room.uuid,
      user: state.myKey,
      idea: idea,
    },
    { onConflict: "key" },
  );
};

const selectNumber = computed(() => {
  return state.room.users[state.myKey]?.idea ?? "";
});

const gameScore = computed(() => {
  const validIdeas = Object.values(state.room.users)
    .map((user) => parseInt(user.idea))
    .filter((idea) => !isNaN(idea) && idea >= 0);

  if (validIdeas.length === 0) return 0;

  return (
    validIdeas.reduce((total, idea) => total + idea, 0) / validIdeas.length
  );
});

const keyboardListener = (event) => {
  switch (event.key) {
    case "0":
      setCard("0");
      break;
    case "1":
      setCard("1");
      break;
    case "2":
      setCard("2");
      break;
    case "3":
      setCard("3");
      break;
    case "4":
      setCard("5");
      break;
    case "5":
      setCard("8");
      break;
    case "6":
      setCard("13");
      break;
    case "7":
      setCard("21");
      break;
    case "8":
      setCard("34");
      break;
    case "9":
      setCard("55");
      break;
    case "q":
      setCard("89");
      break;
  }
};
document.addEventListener("keydown", keyboardListener, false);
</script>
