<template>
  <div class="button-container">
    <NuxtLink class="button" to="/home" style="text-decoration: none;">HOME</NuxtLink>
    <NuxtLink class="button" to="/characters" style="text-decoration: none;">CHARACTER</NuxtLink>
    <NuxtLink class="button" to="/configuration" style="text-decoration: none;">CONFIGURATION</NuxtLink>
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
  width: 99.5%;
  background-color: #a8abac;
  height: 45px;
  align-items: center;
  justify-content: flex-end;
  border: 3px black solid;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px,
    rgba(86, 87, 88, 0.5) 5px 10px 15px;
}

@font-face {
  font-family:gaming;
  src: url('../gaming.ttf');
}
.button {
  background-color: white;
  margin: 5px;
  color: black;
  font-family:gaming;
  font-size: 10px;
  font-weight: 600;
  padding: 1em 2em;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  border: 2px solid black;
  box-shadow: 0 0 0 0 black;
}

.button:hover {
  transform: translateY(-4px) translateX(-2px);
  box-shadow: 2px 5px 0 0 black;
}


.button:active {
  transform: translateY(2px) translateX(1px);
  box-shadow: 0 0 0 0 black;
}

</style>