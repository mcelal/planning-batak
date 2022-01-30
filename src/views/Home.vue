<template>
  <div class="text-center">
    <p class="py-10 text-2xl font-bold">Oyuna Var mısın?</p>


    <i-button
        type="help"
        @click="$router.push({name: 'CreateGame'})"
    >
      Oyun Oluştur
    </i-button>

  </div>
</template>
