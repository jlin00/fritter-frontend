<!-- Form for changing username (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'ChangeUsernameForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users',
      method: 'PATCH',
      hasBody: true,
      setUsername: true,
      fields: [
        {id: 'username', label: 'Username', value: ''}
      ],
      title: 'Change Username',
      callback: () => {
        const message = 'Successfully changed username!';
        this.$store.commit('alert', {
          message: message, 
          status: 'success'
        });
      }
    };
  }
};
</script>
