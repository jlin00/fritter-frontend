<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'FilterComponent',
  props: {
    filter: {
      type: Object,
      required: true
    }
  },
  mixins: [BlockForm],
  data() {
    return {
      url: `/api/filters/${this.filter._id}`,
      method: 'PATCH',
      hasBody: true,
      fields: [
        {id: 'name', label: 'Name', value: this.filter.name, placeholder: 'Enter filter name...'},
        {id: 'collection', label: 'Usernames', value: '', placeholder: 'Type tag and press enter...', collectionName: 'usernames', collectionType: 'username', collection: [...this.filter.usernames]},
        {id: 'collection', label: 'Tags', value: '', placeholder: 'Type tag and press enter...', collectionName: 'tags', collectionType: 'tag', collection: [...this.filter.tags]}
      ],
      title: 'Update Filter',
      refreshFilters: true,
      keepFields: true,
      callback: () => {
        this.$store.commit('alert', {
          message: 'Successfully updated filter!', 
          status: 'success'
        });
      }
    };
  }
};
</script>