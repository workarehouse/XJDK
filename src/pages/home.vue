<template>
    <div class="flex flex-col h-screen bg-[#f0f2f5] overflow-hidden">

        <!-- 分段 Tab -->
        <div class="mx-3 my-3 shrink-0">
            <div class="relative flex bg-[#e4e6eb] rounded-xl p-1">
                <!-- 滑动白色指示块 -->
                <div class="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm pointer-events-none" :style="{
                    width: `calc(${100 / tabs.length}% - 4px)`,
                    transform: `translateX(calc(${activeTabIndex * 100}% + ${activeTabIndex * 4}px))`,
                    transition: 'transform 0.25s cubic-bezier(0.35,0,0.25,1)',
                }"></div>
                <!-- Tab 按钮 -->
                <button v-for="(tab, i) in tabs" :key="tab.key" @click="switchTab(i)"
                    class="relative flex-1 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200 z-10"
                    :class="activeTabIndex === i ? 'text-gray-900' : 'text-gray-500'">
                    {{ tab.label }}
                </button>
            </div>
        </div>

        <!-- 主卡片：滑动容器 -->
        <div ref="cardWrap" class="mx-3 flex-1 min-h-0 overflow-hidden rounded-xl bg-white mb-2">
            <!-- 双面板横向排列，通过 translateX 左右滑动 -->
            <div class="flex h-full" :style="{
                width: '200%',
                transform: `translateX(-${activeTabIndex * 50}%)`,
                transition: 'transform 0.3s cubic-bezier(0.35,0,0.25,1)',
            }">
                <!-- ========== 面板 0：现场拍照 ========== -->
                <div class="flex flex-col" style="width: 50%">
                    <!-- 地图区域 -->
                    <div class="relative h-28 shrink-0 overflow-hidden">
                        <div class="absolute inset-0 bg-[#e8ecf0]">
                            <div class="absolute top-[38%] left-0 right-0 h-4 bg-white opacity-60"></div>
                            <div class="absolute top-[65%] left-0 right-0 h-2.5 bg-white opacity-40"></div>
                            <div class="absolute left-[40%] top-0 bottom-0 w-3 bg-white opacity-60"></div>
                            <div class="absolute left-[68%] top-0 bottom-0 w-2 bg-white opacity-40"></div>
                            <div class="absolute top-4 left-4 w-16 h-10 bg-[#dce3ea] rounded-sm"></div>
                            <div class="absolute top-2 right-6 w-20 h-12 bg-[#dce3ea] rounded-sm"></div>
                            <div class="absolute bottom-4 left-2 w-24 h-8 bg-[#dce3ea] rounded-sm"></div>
                            <div class="absolute bottom-6 right-4 w-14 h-10 bg-[#d4e1c8] rounded-sm"></div>
                        </div>
                        <!-- 地图定位标记 -->
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <div
                                class="w-3.5 h-3.5 rounded-full bg-white border border-[#b9cbe6] shadow-[0_1px_3px_rgba(0,0,0,0.12)] flex items-center justify-center">
                                <div class="w-1.5 h-1.5 rounded-full bg-[#7f9fc9]"></div>
                            </div>
                        </div>
                        <!-- 地图到底部内容的视觉过渡蒙层 -->
                        <div
                            class="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent via-white/70 to-white pointer-events-none">
                        </div>
                    </div>

                    <!-- 位置状态 -->
                    <!-- <div class="text-center pt-3 pb-1 shrink-0">
                        <p class="text-[#07c160] font-semibold text-base">{{ inRange ? '你已在打卡范围内' : '不在打卡范围内' }}</p>
                        <p class="text-[#07c160] text-sm mt-0.5">猪场 A 区</p>
                    </div> -->

                    <!-- 区域选择 -->
                    <div class="px-8 pt-12 pb-4 shrink-0">
                        <div class="relative" ref="areaDropdownRef">
                            <!-- 触发按钮 -->
                            <button type="button" @click="areaOpen = !areaOpen"
                                class="w-full flex items-center justify-between gap-2 bg-[#f7f8fa] rounded-md   px-4 py-3 cursor-pointer transition-colors duration-150 active:bg-[#eff0f2]">
                                <span class="text-sm text-gray-500 shrink-0">打卡区域</span>
                                <span class="text-sm font-medium"
                                    :class="selectedArea ? 'text-gray-800' : 'text-gray-400'">
                                    {{selectedArea ? areaOptions.find(a => a.value === selectedArea)?.label : '请选择区域'
                                    }}
                                </span>
                                <ChevronDownIcon
                                    class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
                                    :class="areaOpen ? 'rotate-180' : ''" />
                            </button>
                            <!-- 下拉选项面板 -->
                            <Transition enter-active-class="transition-all duration-200 ease-out"
                                enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
                                enter-to-class="opacity-100 translate-y-0 scale-100"
                                leave-active-class="transition-all duration-150 ease-in"
                                leave-from-class="opacity-100 translate-y-0 scale-100"
                                leave-to-class="opacity-0 -translate-y-1 scale-[0.98]">
                                <div v-if="areaOpen"
                                    class="absolute left-0 right-0 top-[calc(100%+6px)] z-20 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <button v-for="area in areaOptions" :key="area.value" type="button"
                                        @click="selectedArea = area.value; areaOpen = false"
                                        class="w-full flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors duration-150"
                                        :class="selectedArea === area.value
                                            ? 'text-[#1677ff] font-semibold bg-[#f0f7ff]'
                                            : 'text-gray-700 active:bg-gray-50'">
                                        <span>{{ area.label }}</span>
                                        <CheckIcon v-if="selectedArea === area.value" class="w-4 h-4 text-[#1677ff]" />
                                    </button>
                                </div>
                            </Transition>
                        </div>
                    </div>

                    <div class="flex-1"></div>

                    <!-- 打卡按钮 -->
                    <div class="flex flex-col items-center pb-4 shrink-0">
                        <div class="relative flex items-center justify-center">
                            <!-- conic-gradient 跑光圈（打卡中） -->
                            <div v-if="isPunching" class="ring-spin absolute rounded-full"></div>
                            <button @click="handlePunch" :disabled="isPunching"
                                class="relative w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-300 disabled:cursor-not-allowed overflow-hidden"
                                :class="isPunchSuccess ? 'punch-success-btn' : ''" :style="isPunching ? {} : ringStyle">
                                <div v-if="isPunchSuccess" class="success-glow absolute inset-0 pointer-events-none">
                                </div>
                                <Transition name="punch-success" mode="out-in">
                                    <div v-if="isPunchSuccess" key="success"
                                        class="flex flex-col items-center justify-center">
                                        <div
                                            class="w-12 h-12 rounded-full bg-[#07c1601a] border border-[#07c16055] flex items-center justify-center">
                                            <CheckIcon class="w-8 h-8 text-[#07c160]" :stroke-width="3" />
                                        </div>
                                        <span
                                            class="text-[#07c160] text-base font-semibold mt-2 tracking-[0.02em]">打卡成功</span>
                                    </div>
                                    <div v-else key="default" class="flex flex-col items-center justify-center">
                                        <span class="text-gray-900 text-base font-medium leading-none">拍照打卡</span>
                                        <span class="text-gray-900 text-lg font-bold leading-tight tabular-nums mt-2">
                                            {{ currentHour }}<span class="time-colon">:</span>{{ currentMinute }}
                                        </span>
                                    </div>
                                </Transition>
                            </button>
                        </div>

                        <!-- 打卡记录列表 -->
                        <div v-if="punchRecords.length" class="mt-5 w-full px-8 flex flex-col gap-2">
                            <div v-for="(r, i) in visiblePunchRecords" :key="i"
                                class="flex items-center justify-between text-sm">
                                <span class="text-gray-400">{{ r.area || '未设置区域' }}</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-700 font-medium tabular-nums">{{
                                        dayjs(r.clktim).format('HH:mm') }}</span>
                                </div>
                            </div>
                            <button v-if="punchRecords.length > 2" type="button" @click="router.push('/stat')"
                                class="text-xs text-gray-400 text-center mt-1 cursor-pointer">
                                查看更多
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ========== 面板 1：照片上传 ========== -->
                <div class="flex flex-col" style="width: 50%">
                    <!-- 区域选择（照片上传） -->
                    <div class="px-5 py-4 shrink-0">
                        <div class="relative" ref="uploadAreaDropdownRef">
                            <button type="button" @click="uploadAreaOpen = !uploadAreaOpen"
                                class="w-full flex items-center justify-between gap-2 bg-[#f7f8fa] rounded-md  px-4 py-3 cursor-pointer transition-colors duration-150 active:bg-[#eff0f2] border border-[#eef2f7]">
                                <span class="text-sm text-gray-500 shrink-0">打卡区域</span>
                                <span class="text-sm font-medium"
                                    :class="selectedArea ? 'text-gray-800' : 'text-gray-400'">
                                    {{selectedArea ? areaOptions.find(a => a.value === selectedArea)?.label : '请选择区域'
                                    }}
                                </span>
                                <ChevronDownIcon
                                    class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200"
                                    :class="uploadAreaOpen ? 'rotate-180' : ''" />
                            </button>
                            <Transition enter-active-class="transition-all duration-200 ease-out"
                                enter-from-class="opacity-0 -translate-y-1 scale-[0.98]"
                                enter-to-class="opacity-100 translate-y-0 scale-100"
                                leave-active-class="transition-all duration-150 ease-in"
                                leave-from-class="opacity-100 translate-y-0 scale-100"
                                leave-to-class="opacity-0 -translate-y-1 scale-[0.98]">
                                <div v-if="uploadAreaOpen"
                                    class="absolute left-0 right-0 top-[calc(100%+6px)] z-20 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    <button v-for="area in areaOptions" :key="`upload-${area.value}`" type="button"
                                        @click="selectedArea = area.value; uploadAreaOpen = false"
                                        class="w-full flex items-center justify-between px-4 py-3 text-sm cursor-pointer transition-colors duration-150"
                                        :class="selectedArea === area.value
                                            ? 'text-[#1677ff] font-semibold bg-[#f0f7ff]'
                                            : 'text-gray-700 active:bg-gray-50'">
                                        <span>{{ area.label }}</span>
                                        <CheckIcon v-if="selectedArea === area.value" class="w-4 h-4 text-[#1677ff]" />
                                    </button>
                                </div>
                            </Transition>
                        </div>
                    </div>

                    <!-- 图片预览 / 上传区域 -->
                    <div class="flex-1 flex flex-col px-5 py-4 min-h-0">
                        <!-- 无图片时的上传区 -->
                        <div v-if="!uploadPreview" @click="triggerUpload"
                            class="flex-1 border-2 border-dashed border-[#cfe2ff] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer bg-gradient-to-b from-[#fafcff] to-[#f4f8ff] active:from-[#f2f7ff] active:to-[#edf4ff] transition-colors">
                            <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                <ImagePlusIcon class="w-8 h-8 text-[#1677ff]" />
                            </div>
                            <div class="text-center">
                                <p class="text-[#1677ff] text-sm font-semibold">点击上传现场照片</p>
                            </div>
                        </div>

                        <!-- 已选图片预览 -->
                        <div v-else class="flex-1 relative rounded-2xl overflow-hidden bg-black">
                            <img :src="uploadPreview" class="w-full h-full object-contain" alt="上传预览" />
                            <div
                                class="absolute top-0 left-0 right-0 px-3 py-2 bg-gradient-to-b from-black/55 to-transparent">
                            </div>
                            <!-- 重新选择按钮 -->
                            <button @click="triggerUpload"
                                class="absolute top-3 right-3 h-8 px-3 bg-black/55 rounded-full flex items-center justify-center gap-1 cursor-pointer">
                                <RefreshCwIcon class="w-4 h-4 text-white" />
                                <span class="text-xs text-white">重选</span>
                            </button>
                        </div>

                        <!-- 上传说明灰字 -->
                        <p class="mt-2 text-xs text-gray-400 text-center">请上传现场照片作为打卡凭证，需清晰展示当前工作环境</p>

                        <!-- 识别结果 -->
                        <div v-if="isUploadPreparing || uploadRecognizeContent"
                            class="mt-3 rounded-lg border border-[#e8eef8] bg-[#f8fbff] px-3 py-2">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-xs font-medium text-[#1677ff]">识别内容</span>
                                <span v-if="isUploadPreparing" class="text-[10px] text-gray-400">处理中...</span>
                            </div>
                            <p v-if="uploadRecognizeContent"
                                class="mt-1 text-xs leading-5 text-gray-600 break-words whitespace-pre-wrap">
                                {{ uploadRecognizeContent }}
                            </p>
                        </div>
                    </div>

                    <!-- 隐藏 input -->
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

                    <!-- 提交按钮 -->
                    <div class="px-5 pb-6 shrink-0">
                        <button @click="handleUploadPunch"
                            :disabled="!uploadPreview || isUploadPunching || isUploadPreparing || !isRecognizedTimeValid || isUploadSuccess"
                            class="w-full py-3 rounded-md text-white font-semibold text-base transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                            :class="isUploadSuccess
                                ? 'bg-[#07c160] shadow-[#07c16033]'
                                : (uploadPreview ? 'bg-gradient-to-r from-[#1677ff] to-[#0f5fd1] shadow-[#1677ff33]' : 'bg-gray-300')">
                            <span v-if="isUploadPunching || isUploadPreparing"
                                class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <CheckIcon v-else-if="isUploadSuccess" class="w-4 h-4" :stroke-width="3" />
                            <span>{{ isUploadSuccess ? '上传成功' : (isUploadPreparing ? '处理中' : '上传') }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部 Tab 导航 -->
        <div class="shrink-0 bg-white border-t border-gray-100">
            <div class="flex justify-around py-1.5 pb-2">
                <button v-for="nav in bottomNavs" :key="nav.key" @click="handleNavClick(nav.key)"
                    class="flex flex-col items-center gap-0.5 py-1 px-3 cursor-pointer"
                    :class="activeNav === nav.key ? 'text-[#1677ff]' : 'text-[#bbbfc4]'">
                    <component :is="nav.icon" class="w-6 h-6" :stroke-width="activeNav === nav.key ? 2 : 1.5" />
                    <span class="text-[10px]">{{ nav.label }}</span>
                </button>
            </div>
            <div style="height: env(safe-area-inset-bottom, 0px)"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useSwipe } from '@vueuse/core'
import {
    MapPinIcon,
    PieChartIcon,
    ImagePlusIcon,
    RefreshCwIcon,
    ChevronDownIcon,
    CheckIcon,
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { uploadImageToServer } from '@/utils/upload'
import * as ww from '@wecom/jssdk'

// 组件命后用于 KeepAlive include 识别
defineOptions({ name: 'PunchPage' })

// ——— 分段 Tab ———
const tabs = [
    { key: 'photo', label: '现场拍照' },
    { key: 'upload', label: '照片上传' },
]
const activeTabIndex = ref(0)

const switchTab = (index: number) => {
    activeTabIndex.value = index
}

// ——— 左右滑动切换 Tab ———
const cardWrap = ref<HTMLElement | null>(null)
useSwipe(cardWrap, {
    onSwipeEnd(_, direction) {
        if (direction === 'left' && activeTabIndex.value < tabs.length - 1) {
            switchTab(activeTabIndex.value + 1)
        } else if (direction === 'right' && activeTabIndex.value > 0) {
            switchTab(activeTabIndex.value - 1)
        }
    },
    threshold: 50,
})

// ——— 底部导航 ———
const router = useRouter()
const bottomNavs = [
    { key: 'punch', label: '打卡', icon: MapPinIcon },
    { key: 'stat', label: '统计', icon: PieChartIcon },
]
const activeNav = ref('punch')

const handleNavClick = (key: string) => {
    if (key === 'stat') {
        router.push('/stat')
    } else {
        activeNav.value = key
    }
}

// ——— 实时时间 ———
const now = ref(dayjs())
const currentHour = computed(() => now.value.format('HH'))
const currentMinute = computed(() => now.value.format('mm'))

let timer: ReturnType<typeof setInterval>
let punchSuccessTimer: ReturnType<typeof setTimeout> | null = null
let uploadSuccessTimer: ReturnType<typeof setTimeout> | null = null

// ——— 位置 ———
const currentLat = ref('')   // 当前纬度
const currentLng = ref('')   // 当前经度

// 获取当前地理位置：仅使用企业微信定位
const fetchGeolocation = async () => {
    const setCoords = (latitude: number | string, longitude: number | string) => {
        currentLat.value = String(latitude)
        currentLng.value = String(longitude)
        console.log('[定位] 已更新坐标', {
            latitude: currentLat.value,
            longitude: currentLng.value,
        })
    }

    try {
        if (ww?.getLocation) {
            console.log('[定位] 开始调用企业微信 ww.getLocation')
            const res = await ww.getLocation({ type: ww.LocationType.wgs84 })
            console.log('[定位] ww.getLocation 返回结果', res)

            if (res?.latitude && res?.longitude) {
                setCoords(res.latitude, res.longitude)
                console.log('[定位] ww.getLocation 获取成功')
                return
            }
        }
    } catch (err) {
        console.warn('企业微信 ww.getLocation 失败:', err)
    }
}

// ——— 区域选择 ———
const areaOptions = ref<{ value: string; label: string }[]>([])
const selectedArea = ref('')
const areaOpen = ref(false)
const areaDropdownRef = ref<HTMLElement | null>(null)
const uploadAreaOpen = ref(false)
const uploadAreaDropdownRef = ref<HTMLElement | null>(null)

// 获取区域列表
const fetchAreaList = async () => {
    try {
        const response = await http.post('/xmsapi/xmsale/qw/findmyclksbyarea')
        if (response.data.code === 200 && response.data.result) {
            // 将接口返回的数据转换为下拉菜单格式
            areaOptions.value = response.data.result.map((item: any) => ({
                value: item.area,
                label: item.area,
            }))
        }
    } catch (error) {
    }
}

// 点击外部关闭下拉
onMounted(() => {
    timer = setInterval(() => { now.value = dayjs() }, 1000)
    document.addEventListener('click', handleOutsideClick)
    fetchAreaList()
    void fetchTodayPunchRecords()
    void fetchGeolocation()
})

onUnmounted(() => {
    clearInterval(timer)
    document.removeEventListener('click', handleOutsideClick)
    if (punchSuccessTimer) {
        clearTimeout(punchSuccessTimer)
        punchSuccessTimer = null
    }
    if (uploadSuccessTimer) {
        clearTimeout(uploadSuccessTimer)
        uploadSuccessTimer = null
    }
})

const handleOutsideClick = (e: MouseEvent) => {
    if (areaDropdownRef.value && !areaDropdownRef.value.contains(e.target as Node)) {
        areaOpen.value = false
    }
    if (uploadAreaDropdownRef.value && !uploadAreaDropdownRef.value.contains(e.target as Node)) {
        uploadAreaOpen.value = false
    }
}

const triggerPunchSuccessState = () => {
    isPunchSuccess.value = true
    if (punchSuccessTimer) {
        clearTimeout(punchSuccessTimer)
    }
    punchSuccessTimer = setTimeout(() => {
        isPunchSuccess.value = false
        punchSuccessTimer = null
    }, 3000)
}

// ——— 现场拍照打卡状态 ———
const punchRecords = ref<{ area?: string; clktim?: string }[]>([])  // 当天打卡记录
const isPunching = ref(false)
const isPunchSuccess = ref(false)
const visiblePunchRecords = computed(() => punchRecords.value.slice(0, 2))

const fetchTodayPunchRecords = async () => {
    try {
        const response = await http.post('/xmsapi/xmsale/qw/findmyclksbydat', {
            date: dayjs().format('YYYY-MM-DD'),
        })
        const records = Array.isArray(response?.data?.result) ? response.data.result : []
        punchRecords.value = records
            .filter((item: any) => item?.clktim)
            .sort((a: any, b: any) => dayjs(b.clktim).valueOf() - dayjs(a.clktim).valueOf())
    } catch {
        punchRecords.value = []
    }
}

const ringStyle = {
    border: '6px solid #f5a623',
    boxShadow: '0 0 0 2px #f5a62322',
}

// 统一读取企业微信本地图片 base64（iOS WKWebView）
const getLocalImgDataByWecom = async (localId: string) => {
    if (ww?.getLocalImgData) {
        const res = await ww.getLocalImgData({ localId })
        return String(res?.localData || '')
    }

    return ''
}

// 把 base64/localId 转为 File，便于走统一上传接口
const convertLocalImageToFile = async (localId: string) => {
    try {
        let localData = await getLocalImgDataByWecom(localId)
        if (localData) {
            localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')
            const dataUrl = localData.startsWith('data:') ? localData : `data:image/jpeg;base64,${localData}`
            const blob = await fetch(dataUrl).then((res) => res.blob())
            return new File([blob], `clock-${dayjs().valueOf()}.jpg`, { type: blob.type || 'image/jpeg' })
        }
    } catch (err) {
        console.warn('读取本地图片数据失败，将尝试 localId 画布转换:', err)
    }

    // Android 场景可尝试直接用 localId 作为图片地址转 Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth || img.width
            canvas.height = img.naturalHeight || img.height
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                reject(new Error('canvas 不可用'))
                return
            }
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((result) => {
                if (result) resolve(result)
                else reject(new Error('图片转换失败'))
            }, 'image/jpeg', 0.92)
        }
        img.onerror = () => reject(new Error('localId 图片加载失败'))
        img.src = localId
    })

    return new File([blob], `clock-${dayjs().valueOf()}.jpg`, { type: blob.type || 'image/jpeg' })
}

const handlePunch = () => {
    if (isPunching.value) return
    if (!selectedArea.value) {
        ElMessage({ message: '请先选择打卡区域', type: 'warning', duration: 1800 })
        return
    }

    isPunching.value = true

    // 测试/开发环境：使用浏览器选择图片，不走企业微信拍照
    const isTestEnv = import.meta.env.MODE === 'development'
    if (isTestEnv) {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'
        input.onchange = () => {
            const file = input.files?.[0]
            if (!file) {
                ElMessage({ message: '请完成拍照后再打卡', type: 'warning', duration: 2000 })
                isPunching.value = false
                return
            }

            uploadImageToServer(file)
                .then((picurl) => http.post('/xmsapi/xmsale/qw/savefarmclock', {
                    area: selectedArea.value,
                    clksty: '1',
                    clktim: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    lat: currentLat.value,
                    lng: currentLng.value,
                    picurl,
                }))
                .then(() => {
                    triggerPunchSuccessState()
                    void fetchTodayPunchRecords()
                    selectedArea.value = ''
                    areaOpen.value = false
                    uploadAreaOpen.value = false
                })
                .catch(() => {
                    ElMessage({ message: '打卡失败，请重试', type: 'error', duration: 2000 })
                })
                .finally(() => {
                    isPunching.value = false
                })
        }
        input.click()
        return
    }

    ww.chooseImage({
        count: 1,
        sizeType: [ww.SizeType.compressed],
        sourceType: [ww.SourceType.camera],
        success: (result: any) => {
            console.log('chooseImage result:', result)
            const localId = Array.isArray(result?.localIds) && result.localIds.length > 0
                ? String(result.localIds[0])
                : ''
            if (!localId) {
                ElMessage({ message: '请完成拍照后再打卡', type: 'warning', duration: 2000 })
                isPunching.value = false
                return
            }

            convertLocalImageToFile(localId)
                .then((photoFile) => uploadImageToServer(photoFile))
                .then((picurl) => {
                    if (!picurl) {
                        throw new Error('照片上传失败')
                    }
                    // 打卡前刷新一次定位
                    return fetchGeolocation().then(() => picurl)
                })
                .then((picurl) => http.post('/xmsapi/xmsale/qw/savefarmclock', {
                    area: selectedArea.value,
                    clksty: '1',
                    clktim: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    lat: currentLat.value,
                    lng: currentLng.value,
                    picurl,
                }))
                .then(() => {
                    triggerPunchSuccessState()
                    void fetchTodayPunchRecords()
                    selectedArea.value = ''
                    areaOpen.value = false
                    uploadAreaOpen.value = false
                })
                .catch(() => {
                    ElMessage({ message: '打卡失败，请重试', type: 'error', duration: 2000 })
                })
                .finally(() => {
                    isPunching.value = false
                })
        },
        complete: () => {
            isPunching.value = false
        },
    })
}

// ——— 照片上传打卡 ———
const fileInput = ref<HTMLInputElement | null>(null)
const uploadPreview = ref('')
const uploadFile = ref<File | null>(null)   // 保存原始文件，用于上传
const isUploadPunching = ref(false)
const uploadPunchDone = ref(false)
const isUploadPreparing = ref(false)
const uploadPicurl = ref('')
const uploadRecognizeContent = ref('')
const uploadRecognizeInfo = ref<{ date?: string; location?: string; type?: string } | null>(null)
const isUploadSuccess = ref(false)
const isRecognizedTimeValid = computed(() => {
    const recognizedDate = uploadRecognizeInfo.value?.date
    return Boolean(recognizedDate && dayjs(recognizedDate).isValid())
})

const resetUploadForm = () => {
    uploadPreview.value = ''
    uploadFile.value = null
    uploadPicurl.value = ''
    uploadRecognizeContent.value = ''
    uploadRecognizeInfo.value = null
    uploadPunchDone.value = false
    if (fileInput.value) fileInput.value.value = ''
    selectedArea.value = ''
    areaOpen.value = false
    uploadAreaOpen.value = false
}

const triggerUploadSuccessState = () => {
    isUploadSuccess.value = true
    if (uploadSuccessTimer) {
        clearTimeout(uploadSuccessTimer)
    }
    uploadSuccessTimer = setTimeout(() => {
        isUploadSuccess.value = false
        resetUploadForm()
        uploadSuccessTimer = null
    }, 1500)
}

const triggerUpload = () => {
    fileInput.value?.click()
}

const extractRecognizeInfo = (payload: any): { date?: string; location?: string; type?: string } | null => {
    if (!payload) return null

    const arrayData = Array.isArray(payload?.data)
        ? payload.data
        : (Array.isArray(payload) ? payload : null)

    if (!arrayData || arrayData.length === 0) {
        return null
    }

    const lastItem = arrayData[arrayData.length - 1]
    if (!lastItem || typeof lastItem !== 'object') {
        return null
    }

    return {
        date: lastItem.date ? String(lastItem.date) : undefined,
        location: lastItem.location ? String(lastItem.location) : undefined,
        type: lastItem.type ? String(lastItem.type) : undefined,
    }
}

const extractRecognizeContent = (payload: any): string => {
    if (!payload) return ''
    if (typeof payload === 'string') return payload

    // 接口返回 data 为数组时，默认只取最后一条
    const arrayData = Array.isArray(payload?.data)
        ? payload.data
        : (Array.isArray(payload) ? payload : null)
    if (arrayData && arrayData.length > 0) {
        const lastItem = arrayData[arrayData.length - 1]
        if (typeof lastItem === 'string') return lastItem
        if (lastItem && typeof lastItem === 'object') {
            const parts = [lastItem.date, lastItem.location, lastItem.type].filter(Boolean)
            if (parts.length) return parts.join('\n')
            return JSON.stringify(lastItem)
        }
        return String(lastItem)
    }

    const result = payload.result ?? payload.data?.result ?? payload.data ?? payload.message ?? payload.content
    if (typeof result === 'string') return result
    if (Array.isArray(result) && result.length > 0) {
        const lastItem = result[result.length - 1]
        if (typeof lastItem === 'string') return lastItem
        if (lastItem && typeof lastItem === 'object') {
            const parts = [lastItem.date, lastItem.location, lastItem.type].filter(Boolean)
            if (parts.length) return parts.join('\n')
            return JSON.stringify(lastItem)
        }
        return String(lastItem)
    }
    if (result == null) return ''
    return String(result)
}

const callImageRecognize = async (imageUrl: string) => {
    const response = await http.get('https://devenv.luoniushan.com/lxmpapi/lxmp/chat', {
        params: {
            apikey: 'dQ4ZldbmhNlmVqlBq9ivoyi34hf5sgT2IOEZMw7Igxql8iTCsGAsyk8ZoI8lUO3riYi80ckRvLZ4lQDid',
            imageUrl,
        },
    })
    const payload = response?.data ?? response
    uploadRecognizeInfo.value = extractRecognizeInfo(payload)
    uploadRecognizeContent.value = extractRecognizeContent(payload) || '未识别到有效内容'
}

const prepareUploadAndRecognize = async (file: File) => {
    isUploadPreparing.value = true
    uploadPicurl.value = ''
    uploadRecognizeContent.value = ''
    uploadRecognizeInfo.value = null
    try {
        const picurl = await uploadImageToServer(file)
        const imageUrl = String(picurl || '')
        if (!imageUrl) {
            throw new Error('图片上传失败')
        }
        uploadPicurl.value = imageUrl
        await callImageRecognize(imageUrl)
    } catch {
        uploadPicurl.value = ''
        uploadRecognizeContent.value = ''
        uploadRecognizeInfo.value = null
        ElMessage({ message: '图片处理失败，请重试', type: 'error', duration: 2000 })
    } finally {
        isUploadPreparing.value = false
    }
}

const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    uploadFile.value = file
    uploadPreview.value = URL.createObjectURL(file)
    uploadPunchDone.value = false
    void prepareUploadAndRecognize(file)
}


const handleUploadPunch = async () => {
    if (!uploadPreview.value || isUploadPunching.value || uploadPunchDone.value) return
    if (!selectedArea.value) {
        ElMessage({ message: '请先选择打卡区域', type: 'warning', duration: 1800 })
        return
    }
    if (!uploadFile.value) {
        ElMessage({ message: '请先选择照片', type: 'warning', duration: 1800 })
        return
    }
    if (!isRecognizedTimeValid.value) {
        ElMessage({ message: '识别时间为空或格式无效，不能上传', type: 'warning', duration: 2200 })
        return
    }
    isUploadPunching.value = true
    try {
        // 第一步：优先复用选图后已上传的图片地址
        let picurl = uploadPicurl.value
        if (!picurl) {
            picurl = String(await uploadImageToServer(uploadFile.value))
            uploadPicurl.value = picurl
            await callImageRecognize(picurl)
        }

        const recognizedDate = uploadRecognizeInfo.value?.date as string
        const clktim = dayjs(recognizedDate).format('YYYY-MM-DD HH:mm:ss')
        const addr = uploadRecognizeInfo.value?.location || ''

        // 第二步：调用打卡接口
        await http.post('/xmsapi/xmsale/qw/savefarmclock', {
            area: selectedArea.value,
            clksty: '2',
            clktim,
            addr,
            picurl,
        })
        void fetchTodayPunchRecords()
        triggerUploadSuccessState()
    } catch {
        ElMessage({ message: '打卡失败，请重试', type: 'error', duration: 2000 })
    } finally {
        isUploadPunching.value = false
    }
}
</script>

<style scoped>
button {
    -webkit-tap-highlight-color: transparent;
}

.time-colon {
    display: inline-block;
    animation: colon-blink 1s steps(1, end) infinite;
}

.punch-success-btn {
    border: 1px solid #22c55e66;
    box-shadow: 0 0 0 4px #22c55e14, 0 10px 24px -14px #22c55e99;
}

.success-glow {
    background: radial-gradient(circle at 50% 35%, #22c55e1f 0%, transparent 62%);
    animation: success-glow-fade 0.6s ease-out;
}

.punch-success-enter-active,
.punch-success-leave-active {
    transition: opacity 0.24s ease, transform 0.24s ease;
}

.punch-success-enter-from,
.punch-success-leave-to {
    opacity: 0;
    transform: translateY(4px) scale(0.96);
}

@keyframes success-glow-fade {
    0% {
        opacity: 0;
        transform: scale(0.92);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* conic-gradient 跑光圈 */
.ring-spin {
    /* 比按钮大 12px，内边贴合按钮边框中心 */
    width: 156px;
    height: 156px;
    background: conic-gradient(#f5a623 0deg,
            #ffe49a 60deg,
            #f5a623 120deg,
            rgba(245, 166, 35, 0.15) 180deg,
            rgba(245, 166, 35, 0.15) 360deg);
    animation: ring-rotate 0.9s linear infinite;
    /* 中心派出白色圆 —— 形成“环形”视觉 */
    -webkit-mask: radial-gradient(circle, transparent 64px, black 65px);
    mask: radial-gradient(circle, transparent 64px, black 65px);
}

@keyframes ring-rotate {
    to {
        transform: rotate(360deg);
    }
}

@keyframes colon-blink {

    0%,
    49% {
        opacity: 1;
    }

    50%,
    100% {
        opacity: 0.2;
    }
}
</style>

<route lang="yaml">
meta:
    title: 巡检打卡
    layout: Default
</route>