<template>
    <Navigation />
    <div>
        <h1>Items</h1>
    </div>
    <Footer />
</template>
<script>
import Navigation from '~/components/Navigation.vue'
import Footer from '~/components/Footer.vue'

export default {
    components: {
        Navigation,
        Footer
    },
}
</script>