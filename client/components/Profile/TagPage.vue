<!-- Page for tag profile -->

<template>
  <div>
    <div 
      v-if="fetching"
    >
      <strong>Loading...</strong>
    </div>
    <main v-else>
      <section>
        <header>
          <span class="display-4">#{{ $route.params.tag }}</span>
          <span
            v-if="$store.state.username"
          >
            <button 
              v-if="!isFollowing()"
              class="btn btn-primary"
              @click="submitFollow($route.params.tag, 'Tag')"
            >
              <i class="bi bi-plus"></i>
              Follow
            </button>
            <button 
              v-else
              class="btn btn-danger"
              @click="submitUnfollow()"
            >
              <i class="bi bi-dash"></i>
              Unfollow
            </button>
          </span>
        </header>
      </section>
      <br/>
      <section>
        <nav>
          <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button class="nav-link active" id="nav-home-tab" data-toggle="tab" data-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Freets</button>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
            <FreetComponent
              v-for="freet in freets"
              :key="freet._id"
              :freet="freet"
            />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';

export default {
  name: 'TagPage',
  components: {FreetComponent},
  data() {
    return {
      freets: [],
      fetching: true,
      id: null,
    }
  },
  watch: {
    async $route() {
      this.fetching = true;
      await this.fetchData();
      this.fetching = false;
    }
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    isFollowing() {
      for (const f of this.$store.state.following) {
        if (f.following === this.$route.params.tag) {
          this.id = f._id;
          return true;
        }
      }
      return false;
    },
    async fetchData() {
      this.fetching = true; 

      const options = {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };

      try {
        let url;
        let r;
        let res;

        // Refresh following list of logged in user.
        if (this.$store.state.username) {
          url = `/api/follow?followingOf=${this.$store.state.username}`;
          r = await fetch(url, options);
          res = await r.json();
          if (!r.ok) {
            throw new Error(res.error);
          }
          this.$store.commit('updateFollowing', res);
        }

        // Get freets of requested tag 
        url = `/api/content?usernames=&tags=${this.$route.params.tag}`
        r = await fetch(url, options);
        res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.freets = res;

        this.fetching = false;
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
    },
    async submitFollow(source, type) {
      try {
        const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
          body: JSON.stringify({source, type}),
        };

        const url = '/api/follow/';
        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$store.commit('refreshFollowing');
        await this.fetchData();
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
    },
    async submitUnfollow() {
      if (this.id !== null) {
        try {
          const options = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            credentials: 'same-origin', // Sends express-session credentials with request
          };

          const url = `/api/follow/${this.id}`;
          const r = await fetch(url, options);
          const res = await r.json();

          if (!r.ok) {
            throw new Error(res.error);
          }

          this.$store.commit('refreshFollowing');
          await this.fetchData();
        } catch (e) {
          this.$store.commit('alert', {
            message: e, 
            status: 'danger'
          });
        }
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

button {
  height: max-content;
}

.nav-link {
  background-color: white;
}
</style>