// src/utils/usePrimeVue.js

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import type { App } from 'vue'
import colors from 'tailwindcss/colors'
import ConfirmationService from 'primevue/confirmationservice'
import 'primeicons/primeicons.css'

export default {
    install(app: App<Element>, options = {}) {
        // 定义自定义主题
        const MyPreset = definePreset(Aura, {
            semantic: {
                primary: colors.indigo,
                colorScheme: {
                    dark: {
                        surface: {
                            800: colors.gray[950],
                            900: colors.gray[950], // 使用 TailwindCSS 的颜色
                            950: colors.gray[950]
                        }
                    }
                }
            }
        })

        // 配置 PrimeVue
        app.use(PrimeVue, {
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: '.dark' // 暗黑模式选择器
                }
            },
            ...options // 接收额外的配置参数
        })

        // 确认弹窗
        app.use(ConfirmationService)
    }
}
