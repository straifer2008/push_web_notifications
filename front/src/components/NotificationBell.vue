<template>
    <div class="wrap">
        <span class="count" v-if="unread?.length">{{ unread.length }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width='100%' height='100%'>
            <g id="Group_1" data-name="Group 1" transform="translate(-480 -165)">
                <rect id="Rectangle_1" data-name="Rectangle 1" class="cls-1" width="21" height="21"
                      transform="translate(480 165)"/>
                <path id="bell-o_copy" data-name="bell-o copy" class="cls-2"
                      d="M17.3,15.7l-2.1-3.1v-4a6.421,6.421,0,0,0-4.6-6.1V1.7A1.685,1.685,0,0,0,8.9,0,1.844,1.844,0,0,0,7.1,1.7v.8A6.421,6.421,0,0,0,2.5,8.6v3.9L.4,15.6a1.669,1.669,0,0,0-.1,1.8,1.65,1.65,0,0,0,1.5.9H6A2.988,2.988,0,0,0,8.8,20h0a3.077,3.077,0,0,0,2.8-1.8h4.2a1.859,1.859,0,0,0,1.5-.9A1.348,1.348,0,0,0,17.3,15.7Zm-1,1.2a.55.55,0,0,1-.5.3H10.7l-.1.4a1.922,1.922,0,0,1-1.8,1.3A1.75,1.75,0,0,1,7,17.6l-.1-.4H1.8a.55.55,0,0,1-.5-.3.638.638,0,0,1,0-.6l2.4-3.5V8.6a5.127,5.127,0,0,1,4.1-5l.5-.1V1.7a.5.5,0,1,1,1,0V3.5l.5.1a5.127,5.127,0,0,1,4.1,5v4.3l2.3,3.5C16.4,16.5,16.4,16.7,16.3,16.9Z"
                      transform="translate(481.614 165.5)"/>
            </g>
        </svg>
    </div>
</template>

<script setup>
import { useUnreadNotifications } from '@/utils/firebase'

const unread = useUnreadNotifications()
</script>

<style scoped>
.wrap {
    width: 25px;
    height: 25px;
    position: relative;
    .count {
        position: absolute;
        top: -5px;
        right: 0;
        background-color: red;
        color: #ffffff;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 0;
        margin: 0;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
.cls-1 {
    fill: none;
}

.cls-2 {
    fill: #1d1d1d;
}
</style>
