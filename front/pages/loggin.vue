<template>
    <div class="contenedor">
      <h1>Ingresa tus datos</h1>
      <form @submit.prevent="submitForm">
        <div>
          <label for="username">Username: </label>
          <input type="text" id="username" v-model="username">
        </div>
        <div>
          <label for="password">Password: </label>
          <input type="text" id="password" v-model="password">
        </div>
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  const username = ref('');
  const password = ref('');
  const router = useRouter();
  
  const submitForm = () => {
    // Aquí puedes realizar acciones como enviar los datos al servidor, etc.
    // Por ahora, simplemente redirigiremos a otra página.
    router.push('/');
  };
  </script>

  <style>
  .contenedor{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-image: url('../juego.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
</style>