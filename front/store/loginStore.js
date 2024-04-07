import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    loginInfo: getStoredLoginInfo() || {
      loggedIn: false,
      username: '',
      mail: '',
    }
  }),
  actions: {
    setLoginInfo({ loggedIn, username, mail }) {
      this.loginInfo.loggedIn = loggedIn;
      this.loginInfo.username = username;
      this.loginInfo.mail = mail;
      setStoredLoginInfo(this.loginInfo);
    },
    isLoggedIn() {
      return this.loginInfo.loggedIn;
    },
    getLoginInfo() {
      return this.loginInfo;
    },
    SetUsername(newusername) {
      this.loginInfo.username = newusername;
      setStoredLoginInfo(this.loginInfo);
    },
    getUsername() {
      return this.loginInfo.username;
    },
    setMail(newmail) {
      this.loginInfo.mail = newmail;
      setStoredLoginInfo(this.loginInfo);
    },
    getMail() {
      return this.loginInfo.mail;
    },
  },
  persist: true
});

function getStoredLoginInfo() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return JSON.parse(localStorage.getItem('loginInfo'));
  }
  return null;
}

function setStoredLoginInfo(loginInfo) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
  }
}
