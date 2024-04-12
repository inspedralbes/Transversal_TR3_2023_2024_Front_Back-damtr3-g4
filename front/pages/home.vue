<template>
    <div class="back-home">
        <div>
            <Navigation />
            HOME
        </div>
        <main>

        </main>
    </div>
</template>

<script>
import Navigation from '~/layouts/Navigation.vue'
import { useAppStore } from '@/store/loginStore';
import { useRouter } from 'vue-router';

export default {
    components: {
        Navigation,
    },
    mounted() {
        const loginStore = useAppStore();
        const router = useRouter();

        if (!loginStore.isLoggedIn()) {
            router.push('/');
            alert("Debes iniciar sessión!")
        }
    }
}
</script>
<style>
.back-home {
    background-image: url('hhttps://cdn1.epicgames.com/ue/product/Screenshot/Screenshot11-1920x1080-9cd976fd185dbf1d32c0b6e5c1ff87e3.jpg?resize=1&w=1920');
    background-repeat: no-repeat;
    background-attachment: fixed;
}
</style>
