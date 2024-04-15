<template>
    <div class="back-home">
        <Navigation />
        <h1 style="display: flex; justify-content: center; font-family: 'gaming'; font-size: 60px; color: white;">N O T
            I C I A S</h1>
        <div class="container-elements">

            <div>
                <div v-for="(item, index) in info" :key="index" class="carditem">
                    <div class="cardInfo">
                        <div class="cardHeader">
                            <h3>{{ item.title }}</h3>
                        </div>
                        <div class="cardBody">
                            <p>{{ item.description }}</p>
                            <img :src="item.picture" class="cardImage" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-form">
                <div class="new-card-form">
                    <h3>Añadir Nueva Noticia</h3>
                    <form @submit.prevent="postInfo" enctype="multipart/form-data">
                        <div style="display: flex; flex-direction: column;">
                            <label for="title">Título</label>
                            <input type="text" id="title" v-model="newInfo.title" required>
                            <label for="description">Descripción:</label>
                            <textarea id="description" v-model="newInfo.description" required></textarea>
                            <label for="image">Imagen:</label>
                            <input type="file" id="image" @change="handleFileUpload" show-size accept="image/*"
                                required>
                            <button type="submit">Añadir Tarjeta</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import Navigation from '~/layouts/Navigation.vue'
import { useAppStore } from '@/store/loginStore';
import { useRouter } from 'vue-router';
import { getInfo, postInfo } from '~/services/communicationManager';

export default {
    components: {
        Navigation,
    },
    data() {
        return {
            info: [],
            newInfo: {
                title: '',
                description: '',
                image: null
            }
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
        handleFileUpload(event) {
            const file = event.target.files[0];
            this.newInfo.image = file;
            console.log(this.newInfo.image);
        },

        async postInfo(){

            console.log('Nueva info:', this.newInfo);
            await postInfo(this.newInfo);
            this.info = await getInfo();
        }
    },
};
</script>

<style>
.back-home {
    background-image: url('https://images4.alphacoders.com/995/995128.jpg');
    background-repeat: no-repeat;
    background-attachment: fixed;
}

.container-elements {
    display: flex;
    justify-content: center;
}

.carditem {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
}

.cardInfo {
    font-family: gaming;
    width: 80%;
    /* Establece un ancho máximo */
    border-radius: 30px;
    padding: 10px;
    /* Cambiado a auto para mantener la proporción */
    background: rgb(236, 236, 236);
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.new-card-form {
    font-family: gaming;
    border-radius: 30px;
    padding: 10px;
    background: rgb(236, 236, 236);
    box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.container-form {
    padding: 10px;
    width: 80%;
    height: 70%;
}

.cardContent {
    display: flex;
    /* Alinear elementos verticalmente */
    align-items: center;
    /* Alinear elementos horizontalmente */
    justify-content: space-between;
}

.cardHeader {
    /* Estilos para el título */

}

.cardBody {
    display: flex;
    align-items: center;

    /* Estilos adicionales si es necesario */
}

.cardImage {
    /* Estilos existentes... */
    width: 250px;
    height: 250%;
    object-fit: cover;
    border-radius: 10px;
}

.cardItem {
    padding: 20px;
    border-bottom: 1px solid #ccc;
}

/* Media query para dispositivos de pantalla más pequeños */
@media (max-width: 768px) {
    .cardInfo {
        width: 95%;
        /* Reducir el ancho para dispositivos más pequeños */
        max-width: none;
        /* Eliminar el ancho máximo */
        height: auto;
        /* Cambiar a auto para mantener la proporción */
    }
}

@font-face {
    font-family: gaming;
    src: url('../gaming.ttf');
}

.new-card-form {
    width: 40%;
}

.new-card-form form {
    /* Estilos para el formulario */
}
</style>