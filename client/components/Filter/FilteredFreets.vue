<template>
  <div>
    <FreetComponent
      v-for="freet in $store.state.freets"
      :key="freet._id"
      :freet="freet"
    />
  </div>
</template>
<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';

export default {
  name: 'FilteredFreets',
  components: {FreetComponent},
  async mounted() {
    const url = `/api/content?name=${this.$route.params.filter}`;

    this.$store.commit('updateParams', null);
    this.$store.commit('updateViewing', null);
    this.$store.commit('updateFilter', this.$route.params.filter);
    
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
      this.$router.push({ path: '/404' });
    }
  }
}
</script>