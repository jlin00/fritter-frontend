<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet border rounded my-2 p-4"
  >
    <header>
      <router-link
        :to="'/users/' + freet.author" 
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
          Save Changes
        </button>
        <button
          class="btn btn-danger btn-sm my-2 mr-2 bi bi-x"
          v-if="editing"
          @click="stopEditing"
        >
          Discard Changes
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
        placeholder="What's on your mind?"
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
        placeholder="Type tag and press enter..."
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
      <router-link
        v-for="tag in freet.tags"
        :key="tag"
        class="badge badge-pill badge-secondary px-2 mx-1 py-1"
        :to="'/tags/' + tag"
      >
        {{ tag }}
      </router-link>
    </div>
    <small class="text-secondary">
      <p class="info mt-3">
        Last modified {{ freet.dateModified }}
        <i v-if="freet.dateModified !== freet.dateCreated">(edited)</i>
      </p>
    </small>
    <hr/>
    <div>
      <span class="mr-4">
        <i 
          v-if="!hasUpvoted && !hasDownvoted"
          class="bi bi-hand-thumbs-up mr-1 open"
          @click="submitVote(true)"
        >
        </i>
        <span v-else>
          <i 
            v-if="hasUpvoted"
            class="bi bi-hand-thumbs-up mr-1 upvoted"
            @click="removeVote()"
          >
          </i>
          <i 
            v-else
            class="bi bi-hand-thumbs-up mr-1 closed"
          >
          </i>
        </span>
        {{ numUpvotes }}
      </span>
      <span class="mr-4">
        <i 
          v-if="!hasUpvoted && !hasDownvoted"
          class="bi bi-hand-thumbs-down mr-1 open"
          @click="submitVote(false)"
        >
        </i>
        <span v-else>
          <i 
            v-if="hasDownvoted"
            class="bi bi-hand-thumbs-down mr-1 downvoted"
            @click="removeVote()"
          >
          </i>
          <i 
            v-else
            class="bi bi-hand-thumbs-down mr-1 closed"
          >
          </i>
        </span>
        {{ numDownvotes }}
      </span>
      <button
        class="btn btn-link float-right"
        data-toggle="modal" 
        :data-target="'#' + freet._id"
      >
        View reference links
      </button>
    </div>
    <form 
      class="input-group mt-3"
      @submit.prevent="addReferenceLink()"
    >
      <input
        class="form-control"
        type="url"
        placeholder="Add reference link..."
        :value="link"
        @input="link = $event.target.value"
      >
      <button
        type="submit"
        class="btn btn-info input-group-append px-4"
      >
        Add
      </button>
    </form>

    <!-- Modal -->
    <div class="modal fade" :id="freet._id" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Reference Links</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p
              v-if="!freet.links.length"
            >
              There are currently no reference links for this freet.
            </p>
            <div v-else>
              <p
                v-for="link in freet.links"
                :key="link._id"
              >
                <a
                  class="btn btn-link refLink"
                  :href="link.link"
                >
                  {{ link.link }}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      draftTag: '',
      link: ''
    };
  },
  computed: {
    numUpvotes() {
      return this.freet.upvotes.length;
    },
    numDownvotes() {
      return this.freet.downvotes.length;
    },
    hasUpvoted() {
      return this.freet.upvotes.includes(this.$store.state.username);
    },
    hasDownvoted() {
      return this.freet.downvotes.includes(this.$store.state.username);
    }
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
    async submitVote(credible) {
      try {
        const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
          body: JSON.stringify({credible: credible})
        }

        const url = `/api/credibility/${this.freet._id}/votes`
        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
    },
    async removeVote() {
      try {
        const options = {
          method: 'DELETE',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
        }

        const url = `/api/credibility/${this.freet._id}/votes`
        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
    },
    async addReferenceLink() {
      try {
        const options = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          credentials: 'same-origin', // Sends express-session credentials with request
          body: JSON.stringify({link: this.link})
        }

        const url = `/api/credibility/${this.freet._id}/links`
        const r = await fetch(url, options);
        const res = await r.json();

        if (!r.ok) {
          throw new Error(res.error);
        }

        this.$store.commit('refreshFreets');
        this.$store.commit('alert', {
          message: 'Successfully added a reference link!', 
          status: 'success'
        });
        this.link = '';
      } catch (e) {
        this.$store.commit('alert', {
          message: e, 
          status: 'danger'
        });
      }
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

.badge-pill {
  color: white;
}

.refLink {
  color: #007bff;
}

.open:hover {
  color: #007bff;
}

.upvoted {
  color: green;
}

.upvoted:hover {
  color: darkgreen;
}

.downvoted {
  color: red;
}

.downvoted:hover {
  color: darkred;
}

.closed {
  color: gray;
}
</style>
