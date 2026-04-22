<template>
    <div class="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-white">

        <!-- 光晕装饰 -->
        <div
            class="pointer-events-none absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#267EF0]/6 blur-3xl">
        </div>
        <div class="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#267EF0]/4 blur-3xl">
        </div>

        <!-- 卡片主体 -->
        <div
            class="relative z-10 flex w-[18rem] flex-col items-center rounded-3xl border border-slate-100 bg-white px-8 py-10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.10),0_2px_8px_-2px_rgba(0,0,0,0.06)]">

            <!-- 脉冲光圈 + 图标 -->
            <div class="relative mb-7 flex items-center justify-center">
                <span class="absolute h-20 w-20 animate-ping rounded-full bg-[#267EF0]/12"></span>
                <span class="absolute h-16 w-16 animate-ping rounded-full bg-[#267EF0]/8 [animation-delay:0.4s]"></span>
                <div
                    class="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#267EF0] to-[#1a6ad4] shadow-[0_8px_24px_-4px_rgba(38,126,240,0.35)]">
                    <!-- 剪贴板图标 -->
                    <svg class="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <!-- 标题 -->
            <h1 class="mb-0.5 text-xl font-bold tracking-tight text-slate-900">巡检打卡</h1>
            <p class="mb-7 text-xs text-slate-400">正在登陆...</p>

            <!-- 进度条 -->
            <div class="w-full overflow-hidden rounded-full bg-slate-100">
                <div
                    class="h-0.5 animate-progress rounded-full bg-gradient-to-r from-[#267EF0] via-sky-400 to-[#267EF0]">
                </div>
            </div>
        </div>

        <!-- 底部版权 -->
        <p class="absolute bottom-6 text-[11px] text-slate-300">© {{ year }} 巡检打卡</p>
    </div>
</template>

<script setup lang="ts">
import store from 'store'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { token, ticket } = route.query

const year = new Date().getFullYear()

onMounted(() => {
    if (token) {
        store.set('token', token)
        store.set('ticket', ticket)
        router.replace('/home')
    }
})
</script>

<style scoped>
@keyframes progress {
    0% {
        width: 0%;
        margin-left: 0;
    }

    50% {
        width: 60%;
        margin-left: 20%;
    }

    100% {
        width: 0%;
        margin-left: 100%;
    }
}

.animate-progress {
    animation: progress 1.6s ease-in-out infinite;
}
</style>