<!-- Default page that also displays freets -->

<template>
  <main>
    <QuickFilterForm />
    <section v-if="$store.state.username">
      <header>
        <p class="display-4">Welcome @{{ $store.state.username }}!</p>
      </header>
      <CreateFreetForm />
    </section>
    <section v-else>
      <header>
        <p class="display-4">Welcome to Fritter!</p>
      </header>
      <article>
        <h3>
          <i>
            <router-link to="/login">
              Sign in
            </router-link>
            to create, edit, and delete freets.
          </i>
        </h3>
      </article>
    </section>
    <hr/>
    <section>
      <section
        v-if="$store.state.freets.length"
      >
        <FreetComponent
          v-for="freet in $store.state.freets"
          :key="freet._id"
          :freet="freet"
        />
      </section>
      <article
        v-else
      >
        <h3>No freets found.</h3>
      </article>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';
import QuickFilterForm from '@/components/Filter/QuickFilterForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, CreateFreetForm, QuickFilterForm},
  async mounted() {
    const url = '/api/freets';

    try {
      const r = await fetch(url);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }
      this.$store.commit('updateFreets', res);
    } catch (e) {
      this.$store.commit('alert', {
        message: e, 
        status: 'danger'
      });
    }
  },
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}
</style>
