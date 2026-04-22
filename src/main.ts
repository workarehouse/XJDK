import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style/main.css'
import App from './App.vue'
import router from './router'
import { DataLoaderPlugin } from 'unplugin-vue-router/data-loaders'
import usePrimeVue from '@/boot/usePrimeVue'
import ElementPlus from '@/boot/useElementPlus'
import useDirective from '@/utils/useDirective'

const app = createApp(App)
app.use(createPinia())

app.use(DataLoaderPlugin, { router })
app.use(router)

// 第三方组件库
app.use(usePrimeVue)
app.use(ElementPlus)

// 自定义指令
app.use(useDirective)

app.use(ElementPlus)
app.mount('#app')

// 屏幕调试
if (import.meta.env.MODE === 'development') {
    document.body.classList.add('debug-screens')
}
