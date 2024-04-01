<template>
    <Navigation />
    <main>
        <div class="container-broadcast">
            <div class="row">
                <div v-for="phrase in phrases" cols="12" md="4">
                    <div class="cardSettings">
                        <div>
                            <div class="container-phrase">
                                <h2>{{ phrase.message }}</h2>
                            </div>
                            <div>
                                <button class="edit-button">Editar</button>
                                <button class="delet-button">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-audio">
    <!-- Sección de menú -->
    <div class="container-menu">
        <h3 style="font-family: gaming;">Menú</h3>
        <div v-for="(menuAudio, index) in menuAudios" :key="index" class="audio-item">
            <input type="radio" v-model="selectedMenuAudio" :value="menuAudio" @change="selectMenuAudio(menuAudio)">
            <audio :src="menuAudio" type="audio/mpeg" controls>
                Tu navegador no soporta el elemento de audio.
            </audio>
        </div>
    </div>
    <!-- Sección de batalla -->
    <div class="container-battle">
        <h3 style="font-family: gaming;">Batalla</h3>
        <div v-for="(battleAudio, index) in battleAudios" :key="index" class="audio-item">
            <input type="radio" v-model="selectedBattleAudio" :value="battleAudio" @change="selectBattleAudio(battleAudio)">
            <audio :src="battleAudio" type="audio/mpeg" controls>
                Tu navegador no soporta el elemento de audio.
            </audio>
        </div>
    </div>
</div>
    </main>
</template>
<script>
import Navigation from '~/layouts/Navigation.vue';
import { getBroadcast, getAudios, sendAudio } from '~/services/communicationManager';
export default {
    components: {
        Navigation,
    },

    data() {
        return {
            phrases: [],
            menuAudios: [], // Array para audios del menú
            battleAudios: [], // Array para audios de batalla
            selectedMenuAudio: [], // Audio del menú seleccionado
            selectedBattleAudio: [], // Audio de batalla seleccionado
        }
    },
    async created() {
        this.phrases = await getBroadcast();
        console.log(this.phrases)
        const audios = await getAudios();

        // Filtrar audios por tipo (menú vs. batalla)
        this.menuAudios = audios.filter(audio => audio.includes('menu'));
        this.battleAudios = audios.filter(audio => audio.includes('battle'));
    },
    methods: {
        // Método para cambiar la selección del audio del menú
        async selectMenuAudio(audio) {
            this.selectedMenuAudio = audio;
            console.log(audio);
            const res = await sendAudio(audio);
            console.log(res);
        },
        // Método para cambiar la selección del audio de batalla
        async selectBattleAudio(audio) {
            this.selectedBattleAudio = audio;
            console.log(audio);
            const res = await sendAudio(audio);
            console.log(res);
        }
    }

}
</script>
<style>
.container-broadcast {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10px;
    border: 2px black solid;
    position: relative;
    margin-top: 30px;
}

.container-broadcast:before {
    content: "Broadcast";
    position: absolute;
    font-family: gaming;
    top: -10px;
    left: 8%;
    transform: translateX(-50%);
    background-color: #ffffff;
    padding: 0 10px;
}

.container-audio {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10px;
    margin-top: 10px;
    border: 2px black solid;
    position: relative;
}

.container-audio:before {
    content: "Audio";
    position: absolute;
    font-family: gaming;
    top: -10px;
    left: 8%;
    transform: translateX(-50%);
    background-color: #ffffff;
    padding: 0 10px;
}

.row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-bottom: 20px;
    /* Espacio entre las filas */
}

.cardSettings {
    width: 250px;
    /* Puedes ajustar según tu diseño */
    height: 220px;
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
    font-family: gaming;
    src: url('../gaming.ttf');
}

.container-phrase {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: gaming;
}

.edit-button {
    padding: 5px;
    margin: 5px;
    cursor: pointer;
    border: 0;
    background-color: rgba(6, 31, 249, 0.8);
    box-shadow: rgb(0 0 0 / 5%) 0 0 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-size: 12px;
    transition: all 0.5s ease;
    font-family: gaming;
}

.edit-button:hover {
    letter-spacing: 3px;
    background-color: rgba(6, 31, 249, 0.8);
    color: hsl(0, 0%, 100%);
    box-shadow: rgba(0, 0, 0, 0.8) 0px 7px 29px 0px;
}

.delet-button {
    padding: 5px;
    margin: 5px;
    cursor: pointer;
    border: 0;
    background-color: rgba(255, 0, 0, 0.8);
    box-shadow: rgb(0 0 0 / 5%) 0 0 8px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    font-size: 12px;
    transition: all 0.5s ease;
    font-family: gaming;
}

.delet-button:hover {
    letter-spacing: 3px;
    background-color: rgba(255, 0, 0, 0.8);
    color: hsl(0, 0%, 100%);
    box-shadow: rgba(0, 0, 0, 0.8) 0px 7px 29px 0px;
}
</style>