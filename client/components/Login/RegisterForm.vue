<!-- Form for registering an account (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'RegisterForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users',
      method: 'POST',
      hasBody: true,
      setUsername: true,
      fields: [
        {id: 'username', label: 'Username', value: ''},
        {id: 'password', label: 'Password', value: ''}
      ],
      title: 'Create Account',
      callback: () => {
        const message = 'Successfully created an account!';
        this.$router.push({name: 'Home'});
        this.$store.commit('alert', {
          message: message, 
          status: 'success'
        });
      }
    };
  }
};
</script>
