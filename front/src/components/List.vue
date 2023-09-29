<script lang='ts'>
defineProps<{
  items: {
    title: string;
    subtitle: string;
    read: boolean;
    id: string;
  }[];
  readAction: (item?: any) => void;
  deleteAction: (item?: any) => void;
}>()
</script>

<template>
  <ul class='list'>
    <li v-for="item in items" :key="item.id">
      <div>
        <h2 class='green'>{{item?.title}}</h2>
        <p>{{item?.subtitle}}</p>
      </div>

      <div class='column'>
        <button :class="{read: item?.read, unread: !item.read}"
                @click="readAction(notification)">{{ item?.read ? 'Unread' : 'Read' }}</button>
        <button class='red' @click="readAction(notification)">Delete</button>
      </div>
    </li>
  </ul>
</template>

<style scoped lang='scss'>
</style>
