<template>
    <div class="button-container">
        <button class="button">
            <a href="/home">HOME</a>
        </button>
        <button class="button">
            <a href="/characters">CHARACTER</a>
        </button>
        <button class="button">
            <a href="/items">ITEMS</a>
        </button>

        <button class="button">

        </button>
    </div>

</template>
<script setup>
</script>
<style>
.button-container {
    display: flex;
    background-color: rgba(0, 73, 144);
    width: 100%;
    height: 40px;
    align-items: center;
    justify-content: flex-end;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px,
        rgba(0, 73, 144, 0.5) 5px 10px 15px;
    transition: all 0.5s;
}

.button {
    outline: 0 !important;
    border: 0 !important;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    display: flex;
    align-items: center;
    margin: 40px;
    color: #fff;
    transition: all ease-in-out 0.3s;
    cursor: pointer;
}

.button:hover {
    transform: translateY(-3px);
}

.icon {
    font-size: 20px;
}
</style>