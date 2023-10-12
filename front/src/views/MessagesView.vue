<script setup>
import { useTestData } from '@/utils/firebase'
import { toRaw, watch } from 'vue'

const data = useTestData();

watch(data, () => {
  console.log({
    testData: toRaw(data?.value),
    length: data?.value?.length,
  })
})
</script>

<template>
  <div class="about">
    <h1>This is an Messages page</h1>
    <ul>
      <li v-for="item in data" :key="item.id">
        <h2>ID: {{item?.id}}</h2>
        <code>{{item}}</code>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
    .about {
      min-height: 100vh;
      display: flex;
      align-items: stretch;
      flex-direction: column;
      justify-content: center;
    }
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 60vh;
  overflow-y: auto;
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
code {
  white-space: pre;
  font-size: 14px;
}
</style>
