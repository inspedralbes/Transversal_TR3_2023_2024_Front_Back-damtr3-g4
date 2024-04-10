<template>
    <Navigation />
    <div>
        <h1>Items</h1>
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