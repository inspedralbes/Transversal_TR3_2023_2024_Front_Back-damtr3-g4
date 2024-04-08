<template>
    <div>
        <Navigation />
    </div>
    <main>
        <div class="container-broadcast">
            <div class="row">
                <div v-for="personatge in personatges" cols="12" md="4">
                    <div v-for="(phrase, index) in phrases" cols="12" md="4">
                        <div class="cardSettings">
                            <div>
                                <div class="container-phrase">
                                    <!-- Mostrar el texto si no estamos editando esta frase -->
                                    <h2 v-if="editingPhraseIndex !== index">{{ phrase.message }}</h2>
                                    <!-- Mostrar el campo de entrada si estamos editando esta frase -->
                                    <input v-else v-model="editedPhrase" type="text">
                                </div>
                                <div>
                                    <!-- Pasa el índice de la frase al método openModal -->
                                    <button v-if="editingPhraseIndex == null" class="edit-button"
                                        @click="openModal(index)">Editar</button>
                                    <button v-if="editingPhraseIndex == null" class="delet-button">Eliminar</button>
                                    <!-- Mostrar botón de confirmación solo cuando estamos editando una frase -->
                                    <button v-if="editingPhraseIndex === index" class="edit-button"
                                        @click="saveEditedPhrase(phrase._id)">Guardar</button>
                                    <button v-if="editingPhraseIndex === index" class="edit-button"
                                        @click="closeModal()">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-audio">
            <!-- Sección de menú -->
            <div class="container-menu">
                <h3 style="font-family: gaming; display: flex; justify-content: center;">Menú</h3>
                <div v-for="(menuAudio, index) in menuAudios" :key="index" class="audio-item">
                    <input type="radio" v-model="selectedMenuAudio" :value="menuAudio"
                        @change="selectMenuAudio(menuAudio)">
                    <audio :src="menuAudio" type="audio/mpeg" controls>
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            </div>
            <!-- Sección de batalla -->
            <div class="container-battle">
                <h3 style="font-family: gaming; display: flex; justify-content: center;">Batalla</h3>
                <div v-for="(battleAudio, index) in battleAudios" :key="index" class="audio-item">
                    <input type="radio" v-model="selectedBattleAudio" :value="battleAudio"
                        @change="selectBattleAudio(battleAudio)">
                    <audio :src="battleAudio" type="audio/mpeg" controls>
                        Tu navegador no soporta el elemento de audio.
                    </audio>
                </div>
            </div>
        </div>
        <div class="container-odoo">
            <div class="buttons-odoo">
                <div class="button_pair">
                </div>
                <div class="button_pair">
                    <div class="btn">
                        <button class="button4" @click="statusOdoo(true)">
                            <span class="button_text">PLAY</span>
                        </button>
                    </div>
                    <div class="btn">
                        <button class="button3" @click="statusOdoo(false)">
                            <span class="button_text">STOP</span>
                        </button>
                    </div>
                    <div class="btn">
                        <button class="button4" @click="updateUser()">
                            <span class="button_text">SYNCOdoo</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
<script>
import Navigation from '~/layouts/Navigation.vue';
import { useAppStore } from '@/store/loginStore';
import { useRouter } from 'vue-router';
import { getData,getBroadcast, getAudios, sendAudio, procesOdoo, editMessage, syncOdoo } from '~/services/communicationManager';

export default {
    components: {
        Navigation,
    },

    data() {
        return {
            personatges: [],
            phrases: [],
            menuAudios: [], // Array para audios del menú
            battleAudios: [], // Array para audios de batalla
            selectedMenuAudio: [], // Audio del menú seleccionado
            selectedBattleAudio: [], // Audio de batalla seleccionado
            isActive: false,
            editingPhraseIndex: null,
            editedPhrase: ''
        }
    },

    mounted() {
        const loginStore = useAppStore();
        const router = useRouter();

        if (!loginStore.isLoggedIn()) {
            router.push('/');
            alert("Debes iniciar sessión!")
        }
    },
    async created() {
        this.personatges = await getData();
        console.log(this.personatges)
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
            const res = await sendAudio({ audioUrl: audio });
            console.log(res);
        },
        // Método para cambiar la selección del audio de batalla
        async selectBattleAudio(audio) {
            this.selectedBattleAudio = audio;
            console.log(audio);
            const res = await sendAudio({ audioUrl: audio });
            console.log(res);
        },
        async statusOdoo(isActive) {
            const proces = await procesOdoo(isActive);
            console.log(isActive);
        },
        openModal(index) {
            // Establece el índice de la frase que se está editando
            this.editingPhraseIndex = index;
            // Copia el texto actual de la frase al campo de entrada
            this.editedPhrase = this.phrases[index].message;
        },
        async saveEditedPhrase(id) {
            console.log(id);
            // Actualiza el mensaje de la frase con el texto editado
            const update = await editMessage(id ,this.editedPhrase);
            this.editedPhrase = '';
            this.closeModal();
        },
        closeModal() {
            this.editingPhraseIndex = null;
        },
        async updateUser() {
            const proces = await syncOdoo();
        }
    }

}
</script>
<style>
main {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.container-broadcast {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10px;
    border: 2px black solid;
    position: relative;
    margin: 30px;
    width: 80%;
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
    width: 80%;
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
    height: 220px;
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

.container-odoo {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 10px;
    margin-top: 10px;
    border: 2px black solid;
    position: relative;
    width: 80%;
}

.container-odoo:before {
    content: "Odoo proces";
    position: absolute;
    font-family: gaming;
    top: -10px;
    left: 8%;
    transform: translateX(-50%);
    background-color: #ffffff;
    padding: 0 10px;
}

.buttons-odoo {
    display: flex;
    flex-direction: column;
    row-gap: 1.5em;
}

.button_pair {
    display: flex;
    column-gap: 1.5em;
}

.button_pair1 {
    display: flex;
    flex-direction: column;
    row-gap: 0.9em;
}

.button3 {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 5.7em;
    height: 5.7em;
    border-radius: 10px;
    border: none;
    outline: none;
    background-color: #d42a02;
    box-shadow: rgba(0, 0, 0, 0.377) 10px 10px 8px, #fb702c 2px 2px 10px 0px inset,
        #d42a02 -4px -4px 1px 0px inset;
    cursor: pointer;
    font-family: Montserrat;
    transition: 0.1s ease-in-out;
}

.button4 {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 5.7em;
    height: 5.7em;
    border-radius: 10px;
    border: none;
    outline: none;
    background-color: #545251;
    box-shadow: rgba(0, 0, 0, 0.377) 10px 10px 8px,
        #a8a6a4 1.5px 1.5px 1px 0px inset, #545251 -3.2px -3.2px 8px 0px inset;
    cursor: pointer;
    font-family: Montserrat;
    transition: 0.1s ease-in-out;
}

.button_text {
    color: white;
    font-family: gaming;
    padding-top: 0.9em;
    letter-spacing: 0.075em;
    font-size: 0.85em;
    transition: 0.1s ease-in-out;
}

.button3:active {
    box-shadow: rgba(0, 0, 0, 0.377) 0px 0px 0px, inset 0.5px 0.5px 4px #000000,
        #d42a02 -3.2px -3.2px 8px 0px inset;
}

.button3:active .button_text {
    transform: translateY(0.5px);
}

.button4:active {
    box-shadow: rgba(0, 0, 0, 0.377) 0px 0px 0px, inset 0.5px 0.5px 4px #000000,
        #545251 -3.2px -3.2px 8px 0px inset;
}

.button4:active .button_text {
    transform: translateY(0.5px);
}
</style>