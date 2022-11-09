<!-- Form for creating freets (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFreetForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/freets',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: '', placeholder: 'What\'s on your mind?'},
        {id: 'collection', label: 'Tags', value: '', placeholder: 'Type tag and press enter...', collectionName: 'tags', collectionType: 'tag', collection: []}
      ],
      title: 'Create a Freet',
      refreshFreets: true,
      callback: () => {
        const message = 'Successfully created a freet!';
        this.$store.commit('alert', {
          message: message, 
          status: 'success'
        });
      }
    };
  }
};
</script>
