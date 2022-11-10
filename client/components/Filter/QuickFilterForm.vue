\<!-- Form for filtering freets (block style) -->
<template>
  <form 
    class="row mb-5"
    @submit.prevent="submit"
  >
    <div class="col-2"></div>
    <div class="col-8">
      <div class="input-group">
        <div class="input-group-prepend">
          <select 
            class="custom-select left"
            v-model="select"
          >
            <option value="user" selected>User</option>
            <option value="tag">Tag</option>
          </select>
        </div>
        <input 
          type="text" 
          class="form-control" 
          :placeholder="'Filter by ' + this.select + '...'"
          @input="value = $event.target.value"
        >
        <div class="input-group-append">
          <button class="btn btn-dark right" type="submit">Search</button>
        </div>
      </div>
    </div>
    <div class="col-2"></div>
  </form>
</template>

<script>
export default {
  name: 'QuickFilterForm',
  data() {
    return {
      value: '',
      select: 'user'
    }
  },
  methods: {
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */
      const options = {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };

      try {
        if (this.value === '') {
          throw new Error("Query can't be empty!");
        }

        this.$store.commit('updateParams', { value: this.value, select: this.select });
        this.$store.commit('updateViewing', null);
        this.$store.commit('updateFilter', null);
        
        const username = this.select === 'user' ? this.value : '';
        const tag = this.select === 'tag' ? this.value : '';
        const url = `/api/content?usernames=${username}&tags=${tag}`

        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          throw new Error(res.error);
        }

        this.$store.commit('updateFreets', res);
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
.left {
  border-radius: 20px 0px 0px 20px;
}
.right {
  border-radius: 0px 20px 20px 0px;
}
</style>