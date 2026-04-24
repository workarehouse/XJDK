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
            <div class="overflow-hidden transition-all duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
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
            @scroll="onContentScroll" @touchstart="onContentTouchStart" @touchmove="onContentTouchMove"
            @touchend="onContentTouchEnd" @touchcancel="onContentTouchEnd">

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
                        <p class="text-xs text-gray-400 mt-0.5">{{ dayjs(selectedDate).format('YYYY-MM-DD') }}</p>
                    </div>
                </div>

                <!-- 时间线 -->
                <div v-if="punchRecords.length" class="flex flex-col gap-0">
                    <div v-for="(record, index) in punchRecords" :key="`${record.clktim || ''}-${index}`"
                        class="flex items-start gap-4">
                        <div class="relative w-14 shrink-0 pt-0.5">
                            <span class="block text-left text-base font-semibold tabular-nums text-gray-900">
                                {{ dayjs(record.clktim).format('HH:mm') }}
                            </span>
                            <div v-if="index !== punchRecords.length - 1"
                                class="absolute left-1/2 top-7 bottom-0 w-px -translate-x-1/2 bg-gray-200"></div>
                        </div>
                        <div class="flex-1">
                            <div class="pb-2">
                                <p class="text-sm font-medium text-gray-800">
                                    {{ record.area || '未设置区域' }}
                                </p>
                                <p v-if="record.addr" class="text-xs text-gray-500 mt-0.5 break-all">
                                    {{ record.addr }}
                                </p>
                                <div v-else-if="record.lat || record.lng" class="mt-0.5 text-xs text-gray-500">
                                    <p>经度：{{ formatGeoValue(record.lng) }}</p>
                                    <p class="mt-0.5">纬度：{{ formatGeoValue(record.lat) }}</p>
                                </div>
                                <p class="text-xs text-gray-400 mt-0.5">
                                    {{ record.clksty === '2' ? '照片上传' : '现场拍照' }}
                                </p>
                            </div>
                            <div v-if="index !== punchRecords.length - 1" class="py-2">
                                <div class="h-px bg-gray-50"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="py-6 text-center text-sm text-gray-400">
                    当日暂无打卡记录
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
import http from '@/utils/http'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    MapPinIcon,
    PieChartIcon,
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
let lastToggleAt = 0
let touchStartY = 0
let touchMoved = false

const SCROLL_DELTA_THRESHOLD = 4
const COLLAPSE_TRIGGER_TOP = 18
const EXPAND_TRIGGER_TOP = 2
const TOGGLE_COOLDOWN_MS = 240

const onContentScroll = () => {
    const el = contentRef.value
    if (!el) return
    // iOS 回弹时可能出现极小抖动，先做下限保护并忽略微小位移
    const st = Math.max(0, el.scrollTop)
    const delta = st - lastScrollTop
    const now = Date.now()
    const inCooldown = now - lastToggleAt < TOGGLE_COOLDOWN_MS

    if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) {
        lastScrollTop = st
        return
    }

    if (!inCooldown && !calendarCollapsed.value && delta > 0 && st > COLLAPSE_TRIGGER_TOP) {
        // 向下浏览内容：收起日历
        calendarCollapsed.value = true
        lastToggleAt = now
    } else if (!inCooldown && calendarCollapsed.value && delta < 0 && st <= EXPAND_TRIGGER_TOP) {
        // 明确回到顶部附近再展开，避免弹簧效果来回触发
        calendarCollapsed.value = false
        lastToggleAt = now
    }

    lastScrollTop = st
}

const onContentTouchStart = (event: TouchEvent) => {
    touchStartY = event.touches[0]?.clientY ?? 0
    touchMoved = false
}

const onContentTouchMove = (event: TouchEvent) => {
    const el = contentRef.value
    if (!el || !calendarCollapsed.value) return

    const currentY = event.touches[0]?.clientY ?? 0
    const deltaY = currentY - touchStartY

    if (deltaY > 6) {
        touchMoved = true
    }

    if (el.scrollTop <= 0 && deltaY > 28 && Date.now() - lastToggleAt >= TOGGLE_COOLDOWN_MS) {
        // 折叠状态下，在顶部明显下拉时展开日历
        calendarCollapsed.value = false
        lastToggleAt = Date.now()
        lastScrollTop = 0
        touchStartY = currentY
        touchMoved = false
    }
}

const onContentTouchEnd = () => {
    if (!touchMoved) {
        touchStartY = 0
        return
    }
    touchStartY = 0
    touchMoved = false
}

type PunchRecord = {
    addr?: string
    area?: string
    lat?: string | number
    lng?: string | number
    clktim?: string
    clksty?: string
}

const formatGeoValue = (value?: string | number) => {
    return value == null || value === '' ? '-' : String(value)
}

const punchRecords = ref<PunchRecord[]>([])

const fetchPunchRecordsByDate = async (date: string) => {
    try {
        const response = await http.post('/xmsapi/xmsale/qw/findmyclksbydat', { date })
        const records = Array.isArray(response?.data?.result) ? response.data.result : []
        punchRecords.value = records
            .filter((item: PunchRecord) => item?.clktim)
            .sort((a: PunchRecord, b: PunchRecord) => dayjs(a.clktim).valueOf() - dayjs(b.clktim).valueOf())
    } catch {
        punchRecords.value = []
    }
}

watch(selectedDate, (date) => {
    void fetchPunchRecordsByDate(date)
}, { immediate: true })

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
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-left-leave-active {
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
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
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.slide-right-leave-active {
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1);
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
