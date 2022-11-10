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
    filter: null,
    params: null,
    viewing: null,
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
    updateFilter(state, filter) {
      state.filter = filter;
    },
    updateParams(state, params) {
      state.params = params;
    },
    updateFollowing(state, following) {
      state.following = following;
    },
    updateViewing(state, viewing) {
      state.viewing = viewing
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      let url;
      if (state.params) {
        const username = state.params.select === 'user' ? state.params.value : '';
        const tag = state.params.select === 'tag' ? state.params.value : '';
        url = `/api/content?usernames=${username}&tags=${tag}`
      } else if (state.filter) {
        url = `/api/content?name=${state.filter}`
      } else if (state.viewing) {
        url = `/api/freets?author=${state.viewing}`
      } else {
        url = '/api/filters'
      }

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
