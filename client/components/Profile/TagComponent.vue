<!-- Reusable component representing a single tag -->

<template>
  <article
    class="border rounded my-2 p-4"
  >
    <header>
      <router-link
        :to="'/tags/' + tag" 
      >
        #{{ tag }}
      </router-link>
      <span v-if="$store.state.username">
        <button 
          v-if="!isFollowing(tag)"
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
  name: 'TagComponent',
  props: {
    tag: {
      type: String,
      required: true
    },
    followId: {
      type: String,
      required: true
    }
  },
  methods: {
    isFollowing(tag) {
      return this.$store.state.following.some(f => f.following === tag);
    },
    async submitFollow() {
      try {
        const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
          body: JSON.stringify({source: this.tag, type: 'Tag'}),
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