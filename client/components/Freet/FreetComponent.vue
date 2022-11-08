<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet border rounded my-2 p-4"
  >
    <header>
      <router-link
        :to="'/user/' + freet.author" 
      >
        <h3>@{{ freet.author }}</h3>
      </router-link>
      <hr/>
      <div
        v-if="$store.state.username === freet.author"
        class="actions"
      >
        <button 
          class="btn btn-primary btn-sm my-2 mr-2 bi bi-check"
          v-if="editing"
          @click="submitEdit"
        >
          Save changes
        </button>
        <button
          class="btn btn-danger btn-sm my-2 mr-2 bi bi-x"
          v-if="editing"
          @click="stopEditing"
        >
          Discard changes
        </button>
        <button 
          class="btn btn-primary btn-sm my-2 mr-2 bi bi-pencil"
          v-if="!editing"
          @click="startEditing"
        >
          Edit
        </button>
        <button 
          v-if="!editing"
          class="btn btn-danger btn-sm my-2 mr-2 bi bi-trash"
          @click="deleteFreet"
        >
          Delete
        </button>
      </div>
    </header>
    <div
      v-if="editing"
    >
      <i>Content:</i><textarea
        class="form-control content mb-2"
        :value="draft"
        @input="draft = $event.target.value"
      />
    </div>
    <p
      v-else
      class="content"
    >
      {{ freet.content }}
    </p>
    <i>Tags:</i>
    <div
      v-if="editing"
    >
      <input
        class="form-control"
        :value="draftTag"
        placeholder="Type tag and press enter"
        @input="draftTag = $event.target.value"
        @keydown.enter.prevent="event => {
          addTag(draftTag);
          draftTag = '';
        }"
      >
      <span
        v-for="tag in draftTags"
        :key="tag"
        class="badge badge-pill badge-secondary px-2 mx-1 py-1"
      >{{ tag }}
        <span
          class="bi bi-x-circle"
          @click="removeTag(tag)"
        />
      </span>
    </div>
    <div v-else>
      <span
        v-for="tag in freet.tags"
        :key="tag"
        class="badge badge-pill badge-secondary px-2 mx-1 py-1"
      >
        {{ tag }}
      </span>
    </div>
    <hr/>
    <small class="text-secondary"><p class="info">
      Last modified {{ freet.dateModified }}
      <i v-if="freet.dateModified !== freet.dateCreated">(edited)</i>
    </p></small>
  </article>
</template>

<script>
export default {
  name: 'FreetComponent',
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      draftTags: [...this.freet.tags],
      draftTag: ''
    };
  },
  methods: {
    addTag(tag) {
      const regex = /^\w+$/i;
      if (!regex.test(tag)) {
        const formattingErrorMessage = `Tags must be nonempty, alphanumeric strings.`
        this.$store.commit('alert', {
          message: formattingErrorMessage, 
          status: 'danger'
        });
      } else if (this.draftTags.includes(tag)) {
        const duplicateErrorMessage = `You have already added this tag!`;
        this.$store.commit('alert', {
          message: duplicateErrorMessage, 
          status: 'danger'
        });
      } else {
        this.draftTags.push(tag);
      }
    },
    removeTag(tag) {
      const index = this.draftTags.indexOf(tag);
      if (index !== -1) this.draftTags.splice(index, 1);
    },
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
      this.draftTags = [...this.freet.tags];
      this.draftTag = '';
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
      this.draftTags = [...this.freet.tags];
      this.draftTag = '';
    },
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params, `/api/freets/${this.freet._id}`);
    },
    sameSet() {
      if (this.freet.tags.length !== this.draftTags.length) {
        return false 
      }
      return [...this.draftTags].every(i => this.freet.tags.includes(i))
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft && this.sameSet()) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$store.commit('alert', {
          message: error, 
          status: 'danger'
        });
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft, tags: this.draftTags}),
        callback: () => {
          this.$store.commit('alert', {
            message: params.message, 
            status: 'success'
          });
        }
      };
      this.request(params, `/api/freets/${this.freet._id}`);
    },
    async request(params, url) {
      /**
       * Submits a request to the freet's endpoint
       * @param params - Options for the request
       * @param params.body - Body for the request, if it exists
       * @param params.callback - Function to run if the the request succeeds
       */
      const options = {
        method: params.method, headers: {'Content-Type': 'application/json'}
      };
      if (params.body) {
        options.body = params.body;
      }

      try {
        const r = await fetch(url, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');

        params.callback();
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
a {
  color: inherit;
}
</style>
