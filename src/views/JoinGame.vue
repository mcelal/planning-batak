<template>
  <div class="flex h-screen justify-center items-center">
    <div class="card col-span-1 row-span-3 shadow-lg xl:col-span-2 bg-base-200">
      <div class="card-body">
        <h2 class="my-4 text-4xl font-bold card-title">
          Başlamaya Hazırlanın !
        </h2>
        <div class="form-control mb-3">
          <label class="label">Adınız</label>
          <input v-model="state.userName" type="text" class="input" />
        </div>
        <button
          class="btn btn-primary mt-5"
          :disabled="!state.userName.length"
          @click="play"
        >
          Başla
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, reactive } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabaseClient";

const store = useStore();
const route = useRoute();
const router = useRouter();
const state = reactive({
  userName: localStorage.getItem("planning-batak-username") ?? "",
});

const getGame = async () => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", route.params.uuid);

  if (!data || error) {
    await router.push({ name: "CreateGame" });
  }
};

onBeforeMount(() => {
  getGame();
});

const play = async () => {
  store.commit("joinGame", {
    gameUUID: route.params.uuid,
    userName: state.userName,
  });
  localStorage.setItem("planning-batak-username", state.userName);

  await router.push({ name: "PlayGame", params: { uuid: route.params.uuid } });
};
</script>
