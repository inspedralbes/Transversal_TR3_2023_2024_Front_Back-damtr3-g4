<template>
    <Navigation />
    <main>
        <div class="container">
            <div class="row">
                <div v-for="personatge in personatges" cols="12" md="4">
                    <div class="card">
                        <div>
                            <div class="container-names">
                                <h2>{{ personatge.name_character }}</h2>
                            </div>
                            <img :src="personatge.picture" :alt="personatge.name_character" class="card-image" />
                            <div class="container-buttons">
                                <div class="buttons">
                                    <button :class="{ red: !personatge.isActive }" @click="changeStatus(personatge)">{{ personatge.isActive ?
                                        'Active' : 'Desactive'}}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
<script>
import Navigation from '~/layouts/Navigation.vue';
import { getData, selectCharacter } from '~/services/communicationManager';

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
    methods: {
        async changeStatus(personatge) {
            
            personatge.isActive = !personatge.isActive;
                await selectCharacter(personatge._id, personatge.isActive);
            },
    }
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
    width: 250px;
    /* Puedes ajustar según tu diseño */
    height: 420px;
    /* Puedes ajustar según tu diseño */
    background: rgba(217, 217, 217, 0.58);
    box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(6px);
    text-align: center;
    cursor: pointer;
    transition: all 0.5s;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    font-weight: bolder;
    margin: 20px;
    border: 2px black solid;
}
@font-face {
  font-family:gaming;
  src: url('../gaming.ttf');
}

.card-image {
    max-width: 70%;
    max-height: 80%;
    object-fit: cover;
    border-radius: 17px 17px 0 0;
    object-fit: cover;
    aspect-ratio: 2/3;
}

.container-buttons {
    position: absolute;
    bottom: 10px; /* Ajusta la distancia desde el borde inferior según tu preferencia */
    width: 100%; /* Para que los botones ocupen todo el ancho de la tarjeta */
    display: flex;
    justify-content: center;
    align-items: center;
}
.container-names {
    position: absolute;
    top:0px; /* Ajusta la distancia desde el borde inferior según tu preferencia */
    width: 100%; /* Para que los botones ocupen todo el ancho de la tarjeta */
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: gaming;
}
.buttons {
    display: flex;
    justify-content: center;
}

button {
    padding: 5px;
    margin: 5px;
    cursor: pointer;
    border: 0;
    background-color:rgba(0, 73, 144, 0.8);
    box-shadow: rgb(0 0 0 / 5%) 0 0 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-size: 12px;
    transition: all 0.5s ease;
    font-family: gaming;
}

button:hover {
    letter-spacing: 3px;
    background-color: rgba(0, 73, 144, 0.8);
    color: hsl(0, 0%, 100%);
    box-shadow: rgba(0, 0, 0, 0.8) 0px 7px 29px 0px;
}

button:active {
    letter-spacing: 3px;
    background-color: rgba(0, 73, 144, 0.8);
    color: hsl(0, 0%, 100%);
    box-shadow: rgba(0, 0, 0, 0.8) 0px 0px 0px 0px;
    transform: translateY(10px);
    transition: 100ms;
}

button.red{
    background-color: red;
    color: white;
}

</style>