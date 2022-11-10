<!-- Page for user profile -->

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
          <span class="display-4">@{{ $route.params.username }}</span>
          <span
            v-if="$store.state.username && $route.params.username !== $store.state.username"
          >
            <button 
              v-if="!isFollowing()"
              class="btn btn-primary"
              @click="submitFollow($route.params.username, 'User')"
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
            <button class="nav-link" id="nav-profile-tab" data-toggle="tab" data-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Followers</button>
            <button class="nav-link" id="nav-contact-tab" data-toggle="tab" data-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Following</button>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
            <FreetComponent
              v-for="freet in $store.state.freets"
              :key="freet._id"
              :freet="freet"
            />
          </div>
          <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
            <div
              v-for="source in followers"
              :key="source.follower"
            >
              <UserComponent 
                v-if="source.sourceModel === 'User'"
                :username="source.follower"
                :followId="source._id"
              />
              <TagComponent 
                v-else
                :tag="source.follower"
                :followId="source._id"
              />
            </div>
          </div>
          <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">
            <div
              v-for="source in following"
              :key="source.following"
            >
              <UserComponent 
                v-if="source.sourceModel === 'User'"
                :username="source.following"
                :followId="source._id"
              />
              <TagComponent 
                v-else
                :tag="source.following"
                :followId="source._id"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import UserComponent from '@/components/Profile/UserComponent.vue';
import TagComponent from '@/components/Profile/TagComponent.vue';

export default {
  name: 'ProfilePage',
  components: {FreetComponent, UserComponent, TagComponent},
  data() {
    return {
      followers: [],
      following: [],
      fetching: true,
      id: null,
    }
  },
  watch: {
    async $route() {
      this.$store.commit('updateParams', null);
      this.$store.commit('updateViewing', this.$route.params.username);
      this.$store.commit('updateFilter', null);
      
      this.fetching = true;
      await this.fetchData();
      this.fetching = false;
    }
  },
  async created() {
    this.$store.commit('updateParams', null);
    this.$store.commit('updateViewing', this.$route.params.username);
    this.$store.commit('updateFilter', null);
    await this.fetchData();
  },
  methods: {
    isFollowing() {
      for (const f of this.$store.state.following) {
        if (f.following === this.$route.params.username) {
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

        // Get freets of requested user 
        url = `/api/freets?author=${this.$route.params.username}`
        r = await fetch(url, options);
        res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.$store.commit('updateFreets', res);

        // Get followers of requested user 
        url = `/api/follow?followersOf=${this.$route.params.username}`
        r = await fetch(url, options);
        res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.followers = res;

        // Get following of requested user 
        url = `/api/follow?followingOf=${this.$route.params.username}`
        r = await fetch(url, options);
        res = await r.json();
        if (!r.ok) {
          throw new Error(res.error);
        }
        this.following = res;

        this.fetching = false;
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
        this.$router.push({ path: '/404' });
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