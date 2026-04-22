import type { App } from 'vue'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

export default {
    install(app: App<Element>, options = {}) {
        app.use(ElementPlus)
    },
}