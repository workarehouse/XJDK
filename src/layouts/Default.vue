<!-- 默认布局 -->
<template>
    <main class="h-full">
        <RouterView v-slot="{ Component, route }">
            <!-- PunchPage 保活，防止切换底部 Tab 后顶部分段 Tab 重置 -->
            <KeepAlive include="PunchPage">
                <component :is="Component" :key="route.name + String(route.query.t ?? '')" />
            </KeepAlive>
        </RouterView>
    </main>
</template>

<script lang="ts" setup>
</script>