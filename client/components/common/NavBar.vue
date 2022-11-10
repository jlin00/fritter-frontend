<!-- A basic navigation bar component -->
<!-- Example of a component which is included on all pages (via App.vue) -->
<!-- This navbar takes advantage of both flex and grid layouts for positioning elements; feel free to redesign as you see fit! -->

<template>
  <div 
    class="sidebar d-flex flex-column flex-shrink-0 p-4 text-white bg-dark" 
  >
    <router-link 
      class="text-white"
      to="/"
    >
      <h1 class="fs-4 mb-4">
        <img class="mx-2" src="../../public/logo.svg">
        Fritter
      </h1>
    </router-link>
    <br/>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item mb-3">
        <router-link 
          class="text-white"
          to="/"
        >
          <i class="bi bi-house mx-2"></i>
          <span class="fs-4">Home</span>
        </router-link>
      </li>
      <li class="nav-item mb-3" v-if="$store.state.username">
        <router-link 
          class="text-white"
          to="/account"
        >
          <i class="bi bi-speedometer2 mx-2"></i>
          <span class="fs-4">Account</span>
        </router-link>
      </li>
      <li class="nav-item mb-3" v-if="$store.state.username">
        <router-link 
          class="text-white"
          to="/filters"
        >
          <i class="bi bi-funnel mx-2"></i>
          <span class="fs-4">Filters</span>
        </router-link>
      </li>
    </ul>
    <div v-if="$store.state.username">
      <router-link 
        class="text-white"
        :to="'/users/' + $store.state.username" 
      >
        <i class="bi bi-person-circle mx-2"></i>
        <span class="fs-4">{{ $store.state.username }}</span>
      </router-link>
    </div>
    <div v-else>
      <router-link 
        class="text-white"
        to="/login"
      >
        <i class="bi bi-person-circle mx-2"></i>
        <span class="fs-4">Sign In</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
img {
    height: 36px;
}

.sidebar {
  height: 100vh;
  width: 100%;
}
</style>
