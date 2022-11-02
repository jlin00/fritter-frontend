<!-- Reusable component representing a form in a block style -->
<!-- This is just an example; feel free to define any reusable components you want! -->

<template>
  <form @submit.prevent="submit">
    <h3>{{ title }}</h3>
    <article
      v-if="fields.length"
    >
      <div
        v-for="field in fields"
        :key="field.id"
      >
        <label :for="field.id">{{ field.label }}:</label>
        <textarea
          v-if="field.id === 'content'"
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
              :name="field.id"
              :value="field.value"
              :placeholder="field.placeholder"
              @input="field.value = $event.target.value"
              @keydown.enter.prevent="{
                addItem(field.label, field.collectionType, field.collection, $event.target.value);
                field.value = '';
              }"
            >
            <div
              v-for="item in field.collection"
              :key="item"
              class="enum"
            >
              {{ item }}
              <button 
                @click="removeItem(field.collection, item)"
                class="remove"
              >
                ✖️
              </button>
            </div>
          </div>
          <input
            v-else
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
    >
      {{ title }}
    </button>
    <section class="alerts">
      <article
        v-for="(status, alert, index) in alerts"
        :key="index"
        :class="status"
      >
        <p>{{ alert }}</p>
      </article>
    </section>
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
      auxiliaryUrl: '', // If form needs to be submitted to an additional url
      method: 'GET', // Form request method
      hasBody: false, // Whether or not form request has a body
      setUsername: false, // Whether or not stored username should be updated after form submission
      refreshFreets: false, // Whether or not stored freets should be updated after form submission
      alerts: {}, // Displays success/error messages encountered during form submission
      callback: null // Function to run after successful form submission
    };
  },
  methods: {
    addItem(label, itemType, collection, item) {
      const regex = /^\w+$/i;
      if (!regex.test(item)) {
        const formattingErrorMessage = `${label} must be nonempty, alphanumeric strings.`
        this.$set(this.alerts, formattingErrorMessage, 'error');
        setTimeout(() => this.$delete(this.alerts, formattingErrorMessage), 1500);
      } else if (collection.includes(item)) {
        const duplicateErrorMessage = `You have already added this ${itemType}!`;
        this.$set(this.alerts, duplicateErrorMessage, 'error');
        setTimeout(() => this.$delete(this.alerts, duplicateErrorMessage), 1500);
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
              field.collection = [];
              return [collectionName, collection];
            } else {
              const {value} = field;
              field.value = '';
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

        if (this.auxiliaryUrl != '') {
          const text = await r.text();
          const id = text ? JSON.parse(text).freet._id : undefined;
          
          const url = `${this.auxiliaryUrl}/${id}`;
          const s = await fetch(url, options);
          console.log(options);
          console.log(url);
          if (!s.ok) {
            // If response is not okay, we throw an error and enter the catch block
            const res = await s.json();
            throw new Error(res.error);
          }
        }

        if (this.setUsername) {
          const text = await r.text();
          const res = text ? JSON.parse(text) : {user: null};
          this.$store.commit('setUsername', res.user ? res.user.username : null);
        }

        if (this.refreshFreets) {
          this.$store.commit('refreshFreets');
        }

        if (this.callback) {
          this.callback();
        }
      } catch (e) {
        this.$set(this.alerts, e, 'error');
        setTimeout(() => this.$delete(this.alerts, e), 3000);
      }
    }
  }
};
</script>

<style scoped>
form {
  border: 1px solid #111;
  padding: 0.5rem;
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

.enum {
  border: 1px solid black;
  border-radius: 5px;
  padding: 0.5rem;
  margin: 0.5rem;
}

.remove {
  float: right;
}
</style>
