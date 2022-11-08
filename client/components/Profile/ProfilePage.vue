<!-- Page for user profile -->

<template>
  <main>
    <section>
      <header>
        <h2>Profile for @{{ $route.params.username }}</h2>
      </header>
    </section>
  </main>
</template>

<script>
export default {
  name: 'ProfilePage',
  components: {},
  data() {
    return {
      value: this.$route.params.username
    };
  },
  mounted() {}
};
</script>
