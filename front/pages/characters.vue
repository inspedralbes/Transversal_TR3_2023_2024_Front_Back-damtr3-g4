<template>
    <Navigation />
    <v-main>
        <v-container class="container">
            <v-row>
                <v-colum v-for="personatge in personatges" cols="12" md="4">
                    <v-card class="card">
                        <v-sheet>
                            <img :src="personatges[0].picture" :alt="personatges[0].name_character"
                                class="card-image" />
                            <v-card-tittle>
                                <h2>{{ personatges[0].name_character }}</h2>
                            </v-card-tittle>
                        </v-sheet>
                    </v-card>
                </v-colum>
            </v-row>
        </v-container>
    </v-main>
</template>
<script>
import Navigation from '~/components/Navigation.vue'
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
    padding: 10px;
}
.card {
    box-sizing: border-box;
    width: 190px;
    height: 254px;
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
}

.card:hover {
    border: 1px solid black;
    transform: scale(1.05);
}

.card:active {
    transform: scale(0.95) rotateZ(1.7deg);
}

.card-image {
    max-width: 80%;
    max-height: 80%;
    border-radius: 17px 17px 0 0;
    object-fit: cover;

}
</style>