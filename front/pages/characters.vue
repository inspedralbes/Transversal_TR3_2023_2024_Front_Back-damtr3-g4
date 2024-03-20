<template>
    <Navigation />
    <v-main>
        <v-container class="container">
            <v-row class="row">
                <v-colum v-for="personatge in personatges" cols="12" md="4">
                    <v-card class="card">
                        <v-sheet>
                            <img :src="personatge.picture" :alt="personatge.name_character" class="card-image" />
                            <v-card-tittle>
                                <h2>{{ personatge.name_character }}</h2>
                            </v-card-tittle>
                            <div class="buttons">
                                <button class="blue">Active</button>
                                <button class="red">Desactive</button>
                            </div>
                        </v-sheet>
                    </v-card>
                </v-colum>
            </v-row>
        </v-container>
    </v-main>
</template>
<script>
import Navigation from '~/layouts/Navigation.vue'
import { getData } from '~/services/communicationManager';

export default {
    components: {
        Navigation,
    },
    data() {
        return {
            personatges: [],
        }
    },
    async created() {
        this.personatges = await getData();
        console.log(this.personatges)
    },
}
</script>
<style>
.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10px;
}

.row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-bottom: 20px;
    /* Espacio entre las filas */
}

.card {
    box-sizing: border-box;
    width: 250px;
    /* Puedes ajustar según tu diseño */
    height: 420px;
    /* Puedes ajustar según tu diseño */
    background: rgba(217, 217, 217, 0.58);
    border: 1px solid white;
    box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(6px);
    border-radius: 17px;
    text-align: center;
    cursor: pointer;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    font-weight: bolder;
    color: black;
    margin: 20px;
}

.card-image {
    max-width: 80%;
    max-height: 80%;
    border-radius: 17px 17px 0 0;
    object-fit: cover;

}

.buttons {
    display: flex;
    justify-content: center;
}

button {
    padding: 5px; 
    margin: 5px;
    border-radius: 50px;
    cursor: pointer;
    border: 0;
    background-color: white;
    box-shadow: rgb(0 0 0 / 5%) 0 0 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-size: 12px;
    transition: all 0.5s ease;
}
button:hover {
  letter-spacing: 3px;
  background-color: rgba(0, 73, 144, 0.8);
  color: hsl(0, 0%, 100%);
  box-shadow: rgba(0, 73, 144, 0.8) 0px 7px 29px 0px;
}
button:active {
  letter-spacing: 3px;
  background-color: rgba(0, 73, 144, 0.8);
  color: hsl(0, 0%, 100%);
  box-shadow: rgba(0, 73, 144, 0.8) 0px 0px 0px 0px;
  transform: translateY(10px);
  transition: 100ms;
}

</style>