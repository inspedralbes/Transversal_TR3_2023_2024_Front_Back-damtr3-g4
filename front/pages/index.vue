<template>
  <main class="back">
    <div class="wrapper">
      <div class="card-switch">
        <label class="switch">
          <input type="checkbox" class="toggle">
          <span class="slider"></span>
          <span class="card-side"></span>
          <div class="flip-card__inner">
            <div class="flip-card__front">
              <div class="title">Log in</div>
              <form class="flip-card__form" @submit.prevent="submitForm" action="">
                <input class="flip-card__input" v-model="mail" placeholder="User name" type="mail">
                <input class="flip-card__input" v-model="password" placeholder="Password" type="password">
                <button class="flip-card__btn">Let's go!</button>
              </form>
            </div>
            <div class="flip-card__back">
              <div class="title">Sign up</div>
              <form class="flip-card__form" @submit.prevent="registerForm" action="">
                <input class="flip-card__input" v-model="username" placeholder="Name" type="name">
                <input class="flip-card__input" v-model="mail" placeholder="Email" type="email">
                <input class="flip-card__input" v-model="password" placeholder="Password" type="password">
                <button class="flip-card__btn">Confirm!</button>
              </form>
            </div>
          </div>
        </label>
      </div>
    </div>
  </main>
</template>
<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authoritzationLogin } from '~/services/communicationManager';
import { insertUser } from '~/services/communicationManager';
import { useAppStore } from '@/store/loginStore';

export default {
  setup() {
    const mail = ref('');
    const username = ref('');
    const password = ref('');
    const router = useRouter();
    const loginStore = useAppStore();

    const submitForm = async () => {
      if (mail.value.trim() !== "" && password.value.trim() !== "") {
        try {
          const response = await authoritzationLogin(mail.value, password.value);
          console.log(response.mail);
          if (response.authorization) {
            loginStore.setLoginInfo({
              loggedIn: true,
              mail: response.mail,
              username: response.name
            });
            router.push('/home');
          } else {
            window.alert("Error en la solicitud de inicio de sesión. Por favor, inténtalo de nuevo.")
          }
        } catch (error) {
          console.error("Error en la solicitud de inicio de sesión:", error);
          window.alert("Error en la solicitud de inicio de sesión. Por favor, inténtalo de nuevo.");
        }
      } else {
        window.alert("Error en la solicitud de inicio de sesión. Por favor, inténtalo de nuevo.")
      }
    };

    const registerForm = async () => {
      try {
        const insert = await insertUser(username.value, mail.value, password.value);
        console.log(insert);
        const response = await authoritzationLogin(mail.value, password.value);
        if (response.authorization) {
          loginStore.setLoginInfo({
            loggedIn: true,
            mail: response.mail,
            username: response.name
          });
          router.push('/home');
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
      }
    };

    return {
      mail,
      username,
      password,
      submitForm,
      registerForm,
      loginStore: computed(() => useAppStore())
    };
  },
}
</script>
<style>
.back {
  background-image: url('https://images6.alphacoders.com/129/1293302.jpg');
  background-repeat: no-repeat;
  background-attachment: fixed;

}

main {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-repeat: no-repeat;
  background-position: center;
}

.wrapper {
  --input-focus: #2d8cf0;
  --font-color: #7cacde;
  --font-color-sub: #666;
  --bg-color: #fff;
  --bg-color-alt: #666;
  --main-color: #323232;
  font-family: 'gaming';
  /* display: flex; */
  /* flex-direction: column; */
  /* align-items: center; */
}

/* switch card */
.switch {
  transform: translateY(-200px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  width: 50px;
  height: 20px;
}

.card-side::before {
  position: absolute;
  content: 'Log in';
  left: -70px;
  top: 0;
  width: 100px;
  text-decoration: underline;
  color: var(--font-color);
  font-weight: 600;
}

.card-side::after {
  position: absolute;
  content: 'Sign up';
  left: 70px;
  top: 0;
  width: 100px;
  text-decoration: none;
  color: var(--font-color);
  font-weight: 600;
}

.toggle {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  box-sizing: border-box;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  box-shadow: 4px 4px var(--main-color);
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-colorcolor);
  transition: 0.3s;
}

.slider:before {
  box-sizing: border-box;
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  border: 2px solid var(--main-color);
  border-radius: 5px;
  left: -2px;
  bottom: 2px;
  background-color: var(--bg-color);
  box-shadow: 0 3px 0 var(--main-color);
  transition: 0.3s;
}

.toggle:checked+.slider {
  background-color: var(--input-focus);
}

.toggle:checked+.slider:before {
  transform: translateX(30px);
}

.toggle:checked~.card-side:before {
  text-decoration: none;
}

.toggle:checked~.card-side:after {
  text-decoration: underline;
}

/* card */

.flip-card__inner {
  width: 550px;
  height: 350px;
  position: relative;
  background-color: transparent;
  perspective: 1000px;
  /* width: 100%;
      height: 100%; */
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.toggle:checked~.flip-card__inner {
  transform: rotateY(180deg);
}

.toggle:checked~.flip-card__front {
  box-shadow: none;
}

.flip-card__front,
.flip-card__back {
  padding: 20px;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  background: rgba(217, 217, 217, 0.318);
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
  gap: 20px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  box-shadow: 4px 4px var(--main-color);
}

.flip-card__back {
  width: 100%;
  transform: rotateY(180deg);
}

.flip-card__form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.title {
  margin: 20px 0 20px 0;
  font-size: 25px;
  font-weight: 900;
  text-align: center;
  color: var(--main-color);
}

.flip-card__input {
  width: 450px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
  padding: 5px 10px;
  outline: none;
  font-family: 'gaming';
}

.flip-card__input::placeholder {
  color: var(--font-color-sub);
  opacity: 0.8;
}

.flip-card__input:focus {
  border: 2px solid var(--input-focus);
}

.flip-card__btn:active,
.button-confirm:active {
  box-shadow: 0px 0px var(--main-color);
  transform: translate(3px, 3px);
}

.flip-card__btn {
  margin: 20px 0 20px 0;
  width: 120px;
  height: 40px;
  border-radius: 5px;
  border: 2px solid var(--main-color);
  background-color: var(--bg-color);
  box-shadow: 4px 4px var(--main-color);
  font-size: 17px;
  font-weight: 600;
  color: var(--font-color);
  cursor: pointer;
  font-family: 'gaming';
}
</style>