<template>
    <RouterView />
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { initWecomSDK } from '@/utils/wecom'

onMounted(() => {
    // 初始化企业微信 JS-SDK，按需填写用到的 jsApiList
    initWecomSDK(['getLocation', 'openLocation', 'chooseImage', 'getLocalImgData'])
})
</script>