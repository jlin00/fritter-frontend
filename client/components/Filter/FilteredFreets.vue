<template>
  <div>
    <FreetComponent
      v-for="freet in freets"
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
  data() {
    return {
        freets: []
    }
  },
  async mounted() {
    const url = `/api/content?name=${this.$route.params.filter}`;
    
    try {
      const r = await fetch(url);
      const res = await r.json();

      if (!r.ok) {
        throw new Error(res.error);
      }

      this.freets = res;
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