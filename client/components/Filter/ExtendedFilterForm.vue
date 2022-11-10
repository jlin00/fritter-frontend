<!-- Form for creating freets (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'ExtendedFilterForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/filters',
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'name', label: 'Name', value: '', placeholder: 'Enter filter name...'},
        {id: 'collection', label: 'Usernames', value: '', placeholder: 'Type tag and press enter...', collectionName: 'usernames', collectionType: 'username', collection: []},
        {id: 'collection', label: 'Tags', value: '', placeholder: 'Type tag and press enter...', collectionName: 'tags', collectionType: 'tag', collection: []}
      ],
      title: 'Create a Filter',
      refreshFilters: true,
      callback: () => {
        const message = 'Successfully created a filter!';
        this.$store.commit('alert', {
          message: message, 
          status: 'success'
        });
      }
    };
  }
};
</script>
