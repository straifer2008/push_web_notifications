<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import { useUnreadBaseNotifications } from '@/utils/firebase'

const unreadMessages = useUnreadBaseNotifications()
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="Hermes" />

      <nav class='nowrap'>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/notifications">Notifications <NotificationBell /></RouterLink>
        <RouterLink to="/messages">
          Messages
          <span class='noty' v-if='unreadMessages?.length'>{{unreadMessages.length}}</span>
        </RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.nowrap {
  white-space: nowrap;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.noty {
  margin-left: -10px;
  margin-top: -10px;
  color: #ffffff;
  background: red;
  width: 20px;
  height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  border-radius: 50%;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
