<template>
    <div class="button-container">
        <button class="button">
            <a href="/home" style="text-decoration: none;">HOME</a>
        </button>
        <button class="button">
            <a href="/characters" style="text-decoration: none;">CHARACTER</a>
        </button>
        <button class="button">
            <a href="/items" style="text-decoration: none;">ITEMS</a>
        </button>
    </div>

</template>
<script>
export default {
  name: 'Navigation',

}
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
  background-color: white;
  margin: 5px;
  color: black;
  border-radius: 10em;
  font-size: 10px;
  font-weight: 600;
  padding: 1em 2em;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border: 1px solid black;
  box-shadow: 0 0 0 0 black;
}

.button:hover {
  transform: translateY(-4px) translateX(-2px);
  box-shadow: 2px 5px 0 0 black;
};

.button:active {
  transform: translateY(2px) translateX(1px);
  box-shadow: 0 0 0 0 black;
};
</style>