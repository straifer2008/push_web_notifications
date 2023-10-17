<script setup>
import {
  useBaseNotifications,
  updateBaseNotification,
  deleteBaseNotification, readAll, useUnreadBaseNotifications
} from '@/utils/firebase'
import { Timestamp } from 'firebase/firestore'

const data = useBaseNotifications();
const unread = useUnreadBaseNotifications()

const onRead = (notification) => updateBaseNotification(notification?.id, {readTime: notification?.readTime ? null : Timestamp.now()})
const onDelete = (id) => confirm('Do you want to delete it?') && deleteBaseNotification(id)
const onClick = (notification) => updateBaseNotification(notification?.id, {clickTime: notification?.clickTime ? null : Timestamp.now()});

</script>

<template>
  <div class="about">
    <h1 class='margin-y'>
      This is an Messages page
      <button class='btn' @click='readAll()' :disabled='!unread?.length'>Read all</button>
    </h1>
    <ul>
      <li v-for="item in data" :key="item.id">
        <h2>ID: {{item?.id}}</h2>

        <div class='flex-around'>
          <button class='btn' @click='onRead(item)'>
            {{item?.readTime ? 'Unread' : 'Read'}}
          </button>
          <button class='btn btn-red' @click='onDelete(item.id)'>Delete</button>
          <button class='btn btn-blue' @click='onClick(item)'>
            {{item?.clickTime ? 'UnClick' : 'Click'}}
          </button>
        </div>

        <code>{{item}}</code>
      </li>
    </ul>
  </div>
</template>

<style scoped lang='scss'>
@media (min-width: 1024px) {
    .about {
      min-height: 100vh;
      display: flex;
      align-items: stretch;
      flex-direction: column;
      justify-content: center;
    }
}

.margin {
  margin: 20px;

  &-y {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  &-x {
    margin-left: 20px;
    margin-right: 20px;
  }
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 60vh;
  overflow-y: auto;
}

.flex-around {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  row-gap: 20px;
  margin: 20px 0;
}

li {
  background-color: #000000;
  color: #ffffff;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 5px solid #ffffff;
  &>h2 {
    border-bottom: 1px solid #ffffff;
  }
}

.btn {
  background-color:#44c767;
  border-radius:28px;
  border:1px solid #18ab29;
  display:inline-block;
  cursor:pointer;
  color:#ffffff;
  font-size:17px;
  padding:16px 31px;
  text-decoration:none;
  text-shadow:0 1px 0 #2f6627;
  transition: opacity 0.3s ease-in-out;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    &:hover {
      opacity: 0.3;
    }
  }

  &:hover {
    opacity: 0.5;
  }

  &-red {
    background-color: red;
    border:1px solid red;
    text-shadow:0 1px 0 red;
  }

  &-blue {
    background-color: blue;
    border:1px solid blue;
    text-shadow:0 1px 0 blue;
  }
}
code {
  white-space: pre-wrap;
  font-size: 14px;
}
</style>
