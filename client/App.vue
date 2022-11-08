<template>
  <div id="app">
    <div class="row">
      <div class="col-2">
        <NavBar class="sticky-top" />
      </div>
      <div class="col-10">
        <div
          class="sticky-top"
          v-for="(status, alert, index) in $store.state.alerts"
          role="alert"
          :key="index"
          :class="'alert alert-' + status"
        >
          {{ alert }}
        </div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/common/NavBar.vue';

export default {
  name: 'App',
  components: {NavBar},
  beforeCreate() {
    // Sync stored username to current session
    fetch('/api/users/session', {
      credentials: 'same-origin' // Sends express-session credentials with request
    }).then(res => res.json()).then(res => {
      const user = res.user;
      this.$store.commit('setUsername', user ? user.username : null);
    });

    // Clear alerts on page refresh
    this.$store.state.alerts = {};
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  height: 100vh;
  flex-direction: column;
  display: flex;
  padding: 0;
  margin: 0;
  font-size: 1.2em;
}

main {
  padding: 3em 5em;
}
</style>
