<template>
  <div class="contenedor">
    <v-card class="fondo">
      <div class="datos">
        <h1>Ingresa tus datos</h1>
        <form @submit.prevent="submitForm" class="datos">
          <div class="campo">
            <label for="username">Username: </label>
            <input class="input" type="text" id="username" v-model="username">
          </div>
          <div class="campo">
            <label for="password">Password: </label>
            <input class="input" type="password" id="password" v-model="password">
          </div>
          <div class="campo">
            <button class="input" type="submit">Iniciar sesión</button>
          </div>
        </form>
      </div>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authoritzationLogin } from '~/services/communicationManager';
const username = ref('');
const password = ref('');
const router = useRouter();

const submitForm = async() => {
  // Aquí puedes realizar acciones como enviar los datos al servidor, etc.
  // Por ahora, simplemente redirigiremos a otra página.
  
  const authoritzation = await authoritzationLogin(username.value, password.value);
  console.log(authoritzation);
  
  
  //router.push('/');
};
</script>


<style>
.datos {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
}

.contenedor {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-image: url('../juego.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.fondo {
  width: 400px;
  height: 200px;
  border-radius: 10px;
  background-color: aquamarine;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra suave */
}

.input {
  border-radius: 50px;
}
.campo{
  margin-bottom: 10px;
}
</style>