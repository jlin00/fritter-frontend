<!-- Form for creating freets (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateFreetForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/freets',
      auxiliaryUrl: '/api/tags',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: '', placeholder: 'What\'s on your mind?'},
        {id: 'collection', label: 'Tags', value: '', placeholder: 'Enter tag here...', collectionName: 'tags', collectionType: 'tag', collection: []}
      ],
      title: 'Create a freet',
      refreshFreets: true,
      callback: () => {
        const message = 'Successfully created a freet!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>
