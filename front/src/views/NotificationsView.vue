<script setup>
import { deleteNotification, updateNotification, useNotifications } from '@/utils/firebase'

const notifications = useNotifications();
const onReadNotification = (notification) => updateNotification(notification?.id, { read: !notification?.read })
const onDeleteNotification = (id) => confirm('Do you want to delete it?') && deleteNotification(id)
</script>

<template>
  <div class="page">
    <h1>This is an Notifications page</h1>

    <ul class='list'>
      <li v-for="notification in notifications" :key="notification.id">
        <div>
          <h2 class='green'>{{notification?.title}}</h2>
          <p>{{notification?.subtitle}}</p>
        </div>

        <div class='column'>
          <button :class="{read: notification?.read, unread: !notification.read}"
                  @click="onReadNotification(notification)">{{ notification?.read ? 'Unread' : 'Read' }}</button>
          <button class='red' @click="onDeleteNotification(notification.id)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang='scss'>
.page {
  &>h1 {
    margin-bottom: 60px;
  }

  @media (min-width: 1024px) {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    flex-direction: column;
    justify-content: center;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-left: 0;
    padding-left: 0;
    @media screen and (min-width: 1024px){
      min-height: 70vh;
    }
    &>li {
      display: flex;
      justify-content: space-between;
      padding-bottom: 5px;
      border-bottom: 1px solid red;
      .column {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
    };

    button {
      min-width: 100px;
      background-color: transparent;
      outline: none;
      cursor: pointer;
      transition: 03ms ease-in-out opacity;
      border-radius: 6px;
      padding: 5px 10px;
      border: 1px solid hsla(160, 100%, 37%, 1);;
      font-weight: 600;
      color: hsla(160, 100%, 37%, 1);
      &:hover {
        opacity: 0.6;
      }
    }
  }

  button {
    &.red {
      background-color: red;
      color: #ffffff;
    }

    &.read {
      color: red;
      border-color: red;
    }
  }
}
</style>
