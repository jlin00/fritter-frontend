<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <form 
    class="border rounded p-4"
    @submit.prevent="submit"
  >
    <h3>{{ title }}</h3>
    <article
      v-if="fields.length"
    >
      <div
        v-for="field in fields"
        class="mb-2"
        :key="field.label"
      >
        <label :for="field.id"><i>{{ field.label }}:</i></label>
        <textarea
          v-if="field.id === 'content'"
          class="form-control"
          :name="field.id"
          :value="field.value"
          :placeholder="field.placeholder"
          @input="field.value = $event.target.value"
        />
        <div
          v-else
        >
          <div
            v-if="field.id === 'collection'"
          >
            <input
              class="form-control"
              :name="field.id"
              :value="field.value"
              :placeholder="field.placeholder"
              @input="field.value = $event.target.value"
              @keydown.enter.prevent="{
                addItem(field.label, field.collectionType, field.collection, $event.target.value);
                field.value = '';
              }"
            >
            <span
              v-for="item in field.collection"
              :key="item"
              class="badge badge-pill badge-secondary px-2 mx-1 py-1"
            >{{ item }}
              <span
                class="bi bi-x-circle"
                @click="removeItem(field.collection, item)"
              >
              </span>
            </span>
          </div>
          <input
            v-else
            class="form-control"
            :type="field.id === 'password' ? 'password' : 'text'"
            :name="field.id"
            :value="field.value"
            @input="field.value = $event.target.value"
          >
        </div>
      </div>
    </article>
    <article v-else>
      <p>{{ content }}</p>
    </article>
    <button
      type="submit"
      class="btn btn-block btn-primary"
    >
      {{ title }}
    </button>
  </form>
</template>

<script>

export default {
  name: 'BlockForm',
  data() {
    /**
     * Options for submitting this form.
     */
    return {
      url: '', // Url to submit form to
      method: 'GET', // Form request method
      hasBody: false, // Whether or not form request has a body
      setUsername: false, // Whether or not stored username should be updated after form submission
      refreshFreets: false, // Whether or not stored freets should be updated after form submission
      refreshFilters: false, // Whether or not stored filters should be updated after form submission
      keepFields: false, // Whether or not to reset fields after submission
      callback: null // Function to run after successful form submission
    };
  },
  methods: {
    addItem(label, itemType, collection, item) {
      const regex = /^\w+$/i;
      if (!regex.test(item)) {
        const formattingErrorMessage = `${label} must be nonempty, alphanumeric strings.`
        this.$store.commit('alert', {
          message: formattingErrorMessage, 
          status: 'danger'
        });
      } else if (collection.includes(item)) {
        const duplicateErrorMessage = `You have already added this ${itemType}!`;
        this.$store.commit('alert', {
          message: duplicateErrorMessage, 
          status: 'danger'
        });
      } else {
        collection.push(item);
      }
    },
    removeItem(collection, item) {
      const index = collection.indexOf(item);
      if (index !== -1) collection.splice(index, 1);
    },
    async submit() {
      /**
        * Submits a form with the specified options from data().
        */
      const options = {
        method: this.method,
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin' // Sends express-session credentials with request
      };
      if (this.hasBody) {
        options.body = JSON.stringify(Object.fromEntries(
          this.fields.map(field => {
            const {id} = field;
            if (id === 'collection') {
              const {collectionName, collection} = field;
              if (!this.keepFields) field.collection = [];
              return [collectionName, collection];
            } else {
              const {value} = field;
              if (!this.keepFields) field.value = '';
              return [id, value]
            }
          })
        ));
      }

      try {
        const r = await fetch(this.url, options);

        if (!r.ok) {
          // If response is not okay, we throw an error and enter the catch block
          const res = await r.json();
          throw new Error(res.error);
        }

        if (this.setUsername) {
          const text = await r.text();
          const res = text ? JSON.parse(text) : {user: null};
          this.$store.commit('setUsername', res.user ? res.user.username : null);
        }

        if (this.refreshFreets) {
          this.$store.commit('refreshFreets');
        }

        if (this.refreshFilters) {
          this.$store.commit('refreshFilters');
        }

        if (this.callback) {
          this.callback();
        }
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
form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
}

article > div {
  display: flex;
  flex-direction: column;
}

form > article p {
  margin: 0;
}

form h3,
form > * {
  margin: 0.3em 0;
}

form h3 {
  margin-top: 0;
}

textarea, input {
  font-family: inherit;
  font-size: inherit;
}
</style>
