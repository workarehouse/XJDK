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
                                class="relative w-36 h-36 rounded-full bg-white flex flex-col items-center justify-center cursor-pointer transition-transform duration-150 disabled:cursor-not-allowed"
                                :style="isPunching ? {} : ringStyle">
                                <span class="text-gray-900  text-base font-medium leading-none">拍照打卡</span>
                                <span class="text-gray-900 text-lg font-bold leading-tight tabular-nums mt-2">
                                    {{ currentHour }}<span class="time-colon">:</span>{{ currentMinute }}
                                </span>
                            </button>
                        </div>

                        <!-- 打卡记录列表 -->
                        <div v-if="punchRecords.length" class="mt-5 w-full px-8 flex flex-col gap-2"
                            :class="showAllPunchRecords ? 'max-h-28 overflow-y-auto pr-1 overscroll-contain' : ''">
                            <div v-for="(r, i) in visiblePunchRecords" :key="i"
                                class="flex items-center justify-between text-sm">
                                <span class="text-gray-400">{{ r.area || '未设置区域' }}</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-gray-700 font-medium tabular-nums">{{ r.time }}</span>
                                </div>
                            </div>
                            <button v-if="punchRecords.length > 2" type="button"
                                @click="showAllPunchRecords = !showAllPunchRecords"
                                class="text-xs text-gray-400 text-center mt-1 cursor-pointer">
                                {{ showAllPunchRecords ? '收起' : '查看更多' }}
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
                    </div>

                    <!-- 隐藏 input -->
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

                    <!-- 提交按钮 -->
                    <div class="px-5 pb-6 shrink-0">
                        <button @click="handleUploadPunch" :disabled="!uploadPreview || isUploadPunching"
                            class="w-full py-3 rounded-md text-white font-semibold text-base transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                            :class="uploadPreview ? 'bg-gradient-to-r from-[#1677ff] to-[#0f5fd1] shadow-[#1677ff33]' : 'bg-gray-300'">
                            <span v-if="isUploadPunching"
                                class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                            <span>上传</span>
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

// ——— 位置 ———
const inRange = ref(true)
const currentLat = ref('')   // 当前纬度
const currentLng = ref('')   // 当前经度

// 获取当前地理位置：优先企业微信，失败后回退浏览器定位
const fetchGeolocation = async () => {
    const setCoords = (latitude: number | string, longitude: number | string) => {
        currentLat.value = String(latitude)
        currentLng.value = String(longitude)
    }

    try {
        const ww = (window as any).ww
        if (ww?.getLocation) {
            const res = await ww.getLocation({ type: 'wgs84' })
            if (res?.latitude && res?.longitude) {
                setCoords(res.latitude, res.longitude)
                return
            }
        }
    } catch (err) {
        console.warn('企业微信 ww.getLocation 失败:', err)
    }

    try {
        const wxSdk = (window as any).wx
        if (wxSdk?.getLocation) {
            await new Promise<void>((resolve, reject) => {
                wxSdk.getLocation({
                    type: 'wgs84',
                    success: (res: any) => {
                        if (res?.latitude && res?.longitude) {
                            setCoords(res.latitude, res.longitude)
                        }
                        resolve()
                    },
                    fail: (err: any) => reject(err),
                    cancel: () => reject(new Error('用户取消定位')),
                })
            })
            if (currentLat.value && currentLng.value) return
        }
    } catch (err) {
        console.warn('企业微信 wx.getLocation 失败:', err)
    }

    if (!navigator.geolocation) return
    await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords(pos.coords.latitude, pos.coords.longitude)
                resolve()
            },
            (err) => {
                console.warn('浏览器定位失败:', err.message)
                resolve()
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    })
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
        const response = await http.post('/findmyclksbyarea')
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
    void fetchGeolocation()
})
onUnmounted(() => {
    clearInterval(timer)
    document.removeEventListener('click', handleOutsideClick)
})

const handleOutsideClick = (e: MouseEvent) => {
    if (areaDropdownRef.value && !areaDropdownRef.value.contains(e.target as Node)) {
        areaOpen.value = false
    }
    if (uploadAreaDropdownRef.value && !uploadAreaDropdownRef.value.contains(e.target as Node)) {
        uploadAreaOpen.value = false
    }
}

// ——— 现场拍照打卡状态 ———
const punchRecords = ref<{ time: string; area: string }[]>([])  // 每次打卡记录
const isPunching = ref(false)
const showAllPunchRecords = ref(false)
const visiblePunchRecords = computed(() => showAllPunchRecords.value ? punchRecords.value : punchRecords.value.slice(0, 2))


const ringStyle = {
    border: '6px solid #f5a623',
    boxShadow: '0 0 0 2px #f5a62322',
}

// 统一读取企业微信本地图片 base64（iOS WKWebView）
const getLocalImgDataByWecom = async (localId: string) => {
    const ww = (window as any).ww
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

    const ww = (window as any).ww
    isPunching.value = true

    console.log('开始拍照打卡，调用企业微信 chooseImage 接口', ww.chooseImage)

    ww.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera'],
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
                .then((picurl) => http.post('/savefarmclock', {
                    area: selectedArea.value,
                    clksty: '1',
                    clktim: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    lat: currentLat.value,
                    lng: currentLng.value,
                    picurl,
                }))
                .then(() => {
                    const areaLabel = areaOptions.value.find((a: any) => a.value === selectedArea.value)?.label ?? ''
                    punchRecords.value.push({ time: dayjs().format('HH:mm:ss'), area: areaLabel })
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

const triggerUpload = () => {
    fileInput.value?.click()
}

const onFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    uploadFile.value = file
    uploadPreview.value = URL.createObjectURL(file)
    uploadPunchDone.value = false
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
    isUploadPunching.value = true
    try {
        // 第一步：上传图片，获取图片 URL
        const picurl = await uploadImageToServer(uploadFile.value)

        // 第二步：调用打卡接口
        await http.post('/savefarmclock', {
            area: selectedArea.value,
            clksty: '2',
            clktim: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            picurl,
        })
        uploadPunchDone.value = true
        uploadPreview.value = ''
        uploadFile.value = null
        if (fileInput.value) fileInput.value.value = ''
        selectedArea.value = ''
        areaOpen.value = false
        uploadAreaOpen.value = false
        ElMessage({ message: '照片打卡成功', type: 'success', duration: 2000 })
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