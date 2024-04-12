<template>
    <div class="back-home">
        <div>
            <Navigation />
            <div v-for="(item, index) in info" :key="index" class="card-item" cols="12" md="4">
                <div class="card">
                    <div>
                        <div class="card-item">
                            <h3>{{ item.title }}</h3>
                        </div>
                        <img :src="item.picture" :alt="personatge.name_character" class="card-image" />
                        <div class="card-item">
                            <p>{{ item.description }}</p>
                        </div>
                    </div>
                </div>
        </div>
    </div>
    <main></main>
    </div>
</template>

<script>
import Navigation from '~/layouts/Navigation.vue'
import { useAppStore } from '@/store/loginStore';
import { useRouter } from 'vue-router';
import { getInfo } from '~/services/communicationManager';

export default {
    components: {
        Navigation,
    },
    data() {
        return {
            info: [],
        };
    },
    mounted() {
        const loginStore = useAppStore();
        const router = useRouter();

        if (!loginStore.isLoggedIn()) {
            router.push('/');
            alert("Debes iniciar sesión!")
        } else {
            this.fetchData();
        }
    },
    methods: {
        async fetchData() {
            try {
                const info = await getInfo();
                this.info = info;
                console.log(this.info);
            } catch (error) {
                console.error(error);
            }
        },
    },
};
</script>

<style>
.back-home {
    background-image: url('https://cdn1.epicgames.com/ue/product/Screenshot/Screenshot11-1920x1080-9cd976fd185dbf1d32c0b6e5c1ff87e3.jpg?resize=1&w=1920');
    background-repeat: no-repeat;
    background-attachment: fixed;
}

.card {
    width: 90%;
    /* Cambiado a porcentaje para que se ajuste al ancho del contenedor */
    max-width: 100%;
    /* Establece un ancho máximo */
    height: 20%;
    /* Cambiado a auto para mantener la proporción */
    background: rgb(236, 236, 236);
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.card-item {
    padding: 20px;
    border-bottom: 1px solid #ccc;
}

/* Media query para dispositivos de pantalla más pequeños */
@media (max-width: 768px) {
    .card {
        width: 95%;
        /* Reducir el ancho para dispositivos más pequeños */
        max-width: none;
        /* Eliminar el ancho máximo */
        height: auto;
        /* Cambiar a auto para mantener la proporción */
    }
}
</style>