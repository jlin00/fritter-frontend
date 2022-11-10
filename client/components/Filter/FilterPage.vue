<template>
  <div>
    <ExtendedFilterForm />
    <hr/>
    <div class="accordion" id="accordionExample">
      <div 
        v-for="filter in $store.state.filters"
        :key="filter._id"
        class="card"
      >
        <div class="card-header">
          <h2 class="mb-0">
            <button class="btn btn-link btn-block text-left" type="button" data-toggle="collapse" :data-target="'#' + filter.name" aria-expanded="true">
              <h3>
                {{ filter.name }}
                <i class="bi bi-caret-down-fill right"></i>
            </h3>
            </button>
          </h2>
        </div>

        <div :id="filter.name" class="collapse" data-parent="#accordionExample">
          <div class="card-body">
            <FilterComponent 
              :filter="filter"
            />
            <router-link
              type="button"
              class="btn btn-block btn-success"
              :to="'/filters/' + filter.name"
            >
              Run Filter
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExtendedFilterForm from '@/components/Filter/ExtendedFilterForm.vue';
import FilterComponent from '@/components/Filter/FilterComponent.vue';

export default {
  name: 'FreetPage',
  components: {ExtendedFilterForm, FilterComponent},
  async mounted() {
    const url = '/api/filters';

    try {
      const r = await fetch(url);
      const res = await r.json();
      if (!r.ok) {
        throw new Error(res.error);
      }
      this.$store.commit('updateFilters', res);
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
.btn-link {
  color: inherit;
}

.right {
  float:right;
}
</style>