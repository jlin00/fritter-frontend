<!-- Reusable component representing a single user -->

<template>
  <article
    class="border rounded my-2 p-4"
  >
    <header>
      <router-link
        :to="'/user/' + username" 
      >
        @{{ username }}
      </router-link>
      <span v-if="$store.state.username && username !== $store.state.username">
        <button 
          v-if="!isFollowing(username)"
          class="btn btn-primary"
          @click="submitFollow"
        >
          <i class="bi bi-plus"></i>
          Follow
        </button>
        <button 
          v-else
          class="btn btn-danger"
          @click="submitUnfollow"
        >
          <i class="bi bi-dash"></i>
          Unfollow
        </button>
      </span>
    </header>
  </article>
</template>

<script>
export default {
  name: 'UserComponent',
  props: {
    username: {
      type: String,
      required: true
    },
    followId: {
      type: String,
      required: true
    }
  },
  methods: {
    isFollowing(username) {
      return this.$store.state.following.some(f => f.following === username);
    },
    async submitFollow() {
      try {
        const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
          body: JSON.stringify({source: this.username, type: 'User'}),
        };

        const url = '/api/follow/';
        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$store.commit('refreshFollowing');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
    },
    async submitUnfollow() {
      try {
        const options = {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
        };

        const url = `/api/follow/${this.followId}`;
        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$store.commit('refreshFollowing');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
    }
  }
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

a {
  color: inherit;
  font-weight: bold;
}
</style>