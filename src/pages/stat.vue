<template>
    <div class="flex flex-col h-screen bg-[#f0f2f5] overflow-hidden">
        <div ref="calendarRef" class="shrink-0 bg-white px-4 py-2.5">
            <!-- 月份 + 翻月箭头 -->
            <div class="flex items-center justify-between mb-2">
                <button @click="prevMonth"
                    class="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:bg-gray-100">
                    <ChevronLeftIcon class="w-4 h-4 text-gray-500" />
                </button>
                <span class="text-sm font-semibold text-gray-900">{{ monthLabel }}</span>
                <button @click="nextMonth"
                    class="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:bg-gray-100">
                    <ChevronRightIcon class="w-4 h-4 text-gray-500" />
                </button>
            </div>

            <!-- 星期头 + 月历格子（带滑动过渡，可折叠） -->
            <div class="overflow-hidden transition-all duration-300 ease-in-out"
                :style="calendarCollapsed ? 'max-height:0;opacity:0;margin-top:0' : 'max-height:400px;opacity:1'">
                <div class="relative overflow-hidden">
                    <Transition :name="slideDirection === 'next' ? 'slide-left' : 'slide-right'">
                        <div :key="currentMonth.format('YYYY-MM')">
                            <!-- 星期头 -->
                            <div class="grid grid-cols-7 mb-0.5">
                                <span v-for="wl in ['日', '一', '二', '三', '四', '五', '六']" :key="wl"
                                    class="text-center text-[10px] text-gray-400">{{ wl }}</span>
                            </div>

                            <!-- 月历格子 -->
                            <div class="grid grid-cols-7">
                                <div v-for="d in monthDays" :key="d.date" class="flex flex-col items-center py-px">
                                    <button @click="d.isCurrent && (selectedDate = d.date)"
                                        class="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs transition-all duration-150"
                                        :class="[
                                            !d.isCurrent ? 'text-gray-200 cursor-default' : 'cursor-pointer',
                                            d.isCurrent && isToday(d.date) && isSelected(d.date) ? 'bg-[#1677ff] text-white font-bold' :
                                                d.isCurrent && isSelected(d.date) ? 'bg-[#e8f0fe] text-[#1677ff] font-semibold' :
                                                    d.isCurrent && isToday(d.date) ? 'text-[#1677ff] font-semibold' :
                                                        d.isCurrent ? 'text-gray-800' : ''
                                        ]">
                                        {{ d.day }}
                                    </button>
                                    <!-- 打卡点 -->
                                    <div class="h-0.5 w-0.5 rounded-full mt-px"
                                        :class="d.hasPunch ? 'bg-[#1677ff]' : 'bg-transparent'"></div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>

        <!-- 内容区 -->
        <div ref="contentRef" class="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-3"
            @scroll="onContentScroll">

            <!-- 导出报表 -->
            <!-- <div class="bg-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm">
                <span class="text-base font-semibold text-gray-900">导出报表</span>
                <button class="flex items-center gap-1.5 cursor-pointer">
                    <TableIcon class="w-4 h-4 text-[#07c160]" />
                    <span class="text-sm text-[#07c160]">我的考勤汇总</span>
                    <ChevronRightIcon class="w-4 h-4 text-[#07c160]" />
                </button>
            </div> -->

            <!-- 打卡详情卡片 -->
            <div class="bg-white rounded-xl px-4 py-4 shadow-sm">
                <!-- 标题行 -->
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-base font-bold text-gray-900">巡检打卡
                        </p>
                        <p class="text-xs text-gray-400 mt-0.5">打卡时间</p>
                    </div>
                </div>

                <!-- 时间线 -->
                <div class="flex flex-col gap-0">
                    <div v-for="value in 10" class="flex items-start gap-4">
                        <span class="w-12 text-right text-base font-semibold tabular-nums"
                            :class="checkInRecord ? 'text-gray-900' : 'text-gray-300'">
                            {{ checkInRecord?.time ?? checkInExpected }}
                        </span>
                        <div class="flex-1 pb-4">
                            <p class="text-sm font-medium" :class="checkInRecord ? 'text-gray-800' : 'text-gray-300'">
                                区域
                            </p>
                            <p v-if="checkInRecord" class="text-xs text text-gray-400 mt-0.5">
                                现场拍照
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部 Tab 导航 -->
        <div class="shrink-0 bg-white border-t border-gray-100">
            <div class="flex justify-around py-1.5">
                <button v-for="nav in bottomNavs" :key="nav.key" @click="handleNavClick(nav.key)"
                    class="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer"
                    :class="nav.key === 'stat' ? 'text-[#1677ff]' : 'text-[#bbbfc4]'">
                    <component :is="nav.icon" class="w-6 h-6" :stroke-width="nav.key === 'stat' ? 2 : 1.5" />
                    <span class="text-[10px]">{{ nav.label }}</span>
                </button>
            </div>
            <div style="height: env(safe-area-inset-bottom, 0px)"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useSwipe } from '@vueuse/core'
import { useRouter } from 'vue-router'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MapPinIcon,
    PieChartIcon,
    TableIcon,
} from 'lucide-vue-next'

const router = useRouter()

// ——— 顶部统计切换 ———
const statTabs = [
    { key: 'team', label: '团队统计' },
    { key: 'mine', label: '我的统计' },
]
const statTab = ref('mine')

// ——— 日期 ———
const today = dayjs()
const selectedDate = ref(today.format('YYYY-MM-DD'))
// 当前浏览月份（独立于选中日期，用于翻月）
const currentMonth = ref(today.startOf('month'))

const monthLabel = computed(() => currentMonth.value.format('YYYY年M月'))

const slideDirection = ref<'next' | 'prev'>('next')

const prevMonth = () => {
    slideDirection.value = 'prev'
    currentMonth.value = currentMonth.value.subtract(1, 'month')
}
const nextMonth = () => {
    slideDirection.value = 'next'
    currentMonth.value = currentMonth.value.add(1, 'month')
}

// 滑动切换月
const calendarRef = ref<HTMLElement | null>(null)
useSwipe(calendarRef, {
    onSwipeEnd(_, direction) {
        if (direction === 'left') nextMonth()
        else if (direction === 'right') prevMonth()
    },
    threshold: 50,
})

// 上滑收起日历
const calendarCollapsed = ref(false)
const contentRef = ref<HTMLElement | null>(null)
let lastScrollTop = 0

const onContentScroll = () => {
    const el = contentRef.value
    if (!el) return
    const st = el.scrollTop
    if (st > lastScrollTop && st > 8) {
        // 向上滚动：收起日历
        calendarCollapsed.value = true
    } else if (st < 8) {
        // 回到顶部：展开日历
        calendarCollapsed.value = false
    }
    lastScrollTop = st
}

// 月历所有格子（含前后补位）
const monthDays = computed(() => {
    const first = currentMonth.value.startOf('month')
    const startPad = first.day() // 0=周日
    const daysInMonth = first.daysInMonth()
    const cells: { day: number; date: string; isCurrent: boolean; hasPunch: boolean }[] = []
    // 前补
    for (let i = startPad - 1; i >= 0; i--) {
        const d = first.subtract(i + 1, 'day')
        cells.push({ day: d.date(), date: d.format('YYYY-MM-DD'), isCurrent: false, hasPunch: false })
    }
    // 当月
    for (let i = 0; i < daysInMonth; i++) {
        const d = first.add(i, 'day')
        cells.push({
            day: d.date(),
            date: d.format('YYYY-MM-DD'),
            isCurrent: true,
            hasPunch: !d.isAfter(today, 'day') && d.day() !== 0 && d.day() !== 6,
        })
    }
    // 后补（补满 7 的倍数）
    const remain = (7 - (cells.length % 7)) % 7
    for (let i = 1; i <= remain; i++) {
        const d = first.add(daysInMonth - 1 + i, 'day')
        cells.push({ day: d.date(), date: d.format('YYYY-MM-DD'), isCurrent: false, hasPunch: false })
    }
    return cells
})

const isToday = (date: string) => date === today.format('YYYY-MM-DD')
const isSelected = (date: string) => date === selectedDate.value

// ——— 打卡规则（模拟） ———
const punchRule = '猪场 A 区现场打卡'

// ——— 当日打卡数据（模拟） ———
const checkInExpected = '08:30'
const checkOutExpected = '17:30'

// 模拟：今天有上班打卡，未下班
const checkInRecord = computed(() => {
    if (selectedDate.value === today.format('YYYY-MM-DD')) {
        return { time: '08:30' }
    }
    // 工作日模拟有记录
    const d = dayjs(selectedDate.value)
    if (!d.isAfter(today, 'day') && d.day() !== 0 && d.day() !== 6) {
        return { time: '08:' + String(25 + (d.date() % 10)).padStart(2, '0') }
    }
    return null
})

const checkOutRecord = computed(() => {
    const d = dayjs(selectedDate.value)
    // 今天未下班，其他工作日有记录
    if (selectedDate.value === today.format('YYYY-MM-DD')) return null
    if (!d.isAfter(today, 'day') && d.day() !== 0 && d.day() !== 6) {
        return { time: '17:' + String(28 + (d.date() % 5)).padStart(2, '0') }
    }
    return null
})

// ——— 底部导航 ———
const bottomNavs = [
    { key: 'punch', label: '打卡', icon: MapPinIcon },
    { key: 'stat', label: '统计', icon: PieChartIcon },
]

const handleNavClick = (key: string) => {
    if (key === 'punch') router.push('/home')
}
</script>

<style scoped>
button {
    -webkit-tap-highlight-color: transparent;
}

/* 向左滑（下一月） */
.slide-left-enter-active {
    transition: transform 0.28s ease, opacity 0.28s ease;
}

.slide-left-leave-active {
    transition: transform 0.28s ease, opacity 0.28s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

.slide-left-enter-from {
    transform: translateX(100%);
    opacity: 0.3;
}

.slide-left-leave-to {
    transform: translateX(-100%);
    opacity: 0.3;
}

/* 向右滑（上一月） */
.slide-right-enter-active {
    transition: transform 0.28s ease, opacity 0.28s ease;
}

.slide-right-leave-active {
    transition: transform 0.28s ease, opacity 0.28s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

.slide-right-enter-from {
    transform: translateX(-100%);
    opacity: 0.3;
}

.slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0.3;
}
</style>

<route lang="yaml">
meta:
    title: 统计
    layout: Default
</route>
