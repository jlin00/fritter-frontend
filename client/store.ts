 import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various components.
 */
const store = new Vuex.Store({
  state: {
    freets: [], // All freets created in the app
    alerts: {}, // global success/error messages encountered during submissions to non-visible forms,
    username: null, // Username of the logged in user,
    following: [], // Following of logged in user
    filters: [], // Filters of logged in user
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    updateFilters(state, filters) {
      state.filters = filters;
    },
    updateFollowing(state, following) {
      state.following = following;
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = '/api/freets';
      const res = await fetch(url).then(async r => r.json());
      state.freets = res;
    },
    async refreshFollowing(state) {
      if (state.username) {
        const url = `/api/follow?followingOf=${state.username}`;
        const res = await fetch(url).then(async r => r.json());
        state.following = res;
      }
    },
    async refreshFilters(state) {
      const url = '/api/filters';
      const res = await fetch(url).then(async r => r.json());
      state.filters = res;
    }
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
