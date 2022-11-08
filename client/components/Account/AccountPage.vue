<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>Account settings for @{{ $store.state.username }}</h2>
      </header>
      <div class="row">
        <div class="col-6">
          <ChangeUsernameForm />
        </div>
        <div class="col-6">
          <ChangePasswordForm />
        </div>
      </div>
    </section>
    <br/><br/>
    <section>
      <header>
        <h2>Account management</h2>
      </header>
      <div class="row">
        <div class="col-6">
          <LogoutForm />
        </div>
        <div class="col-6">
          <DeleteAccountForm />
        </div>
      </div>
    </section>
  </main>
</template>

<script>
import ChangeUsernameForm from '@/components/Account/ChangeUsernameForm.vue';
import ChangePasswordForm from '@/components/Account/ChangePasswordForm.vue';
import DeleteAccountForm from '@/components/Account/DeleteAccountForm.vue';
import LogoutForm from '@/components/Account/LogoutForm.vue';

export default {
  name: 'AccountPage',
  components: {
    ChangeUsernameForm,
    ChangePasswordForm,
    DeleteAccountForm,
    LogoutForm
  }
};
</script>
