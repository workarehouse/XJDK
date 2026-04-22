import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes, handleHotUpdate } from 'vue-router/auto-routes'

/**
 * 基于文件的路由 https://uvr.esm.is/
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: setupLayouts(routes),
    // 滚动行为
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        else {
            if (to.hash) return { el: to.hash, behavior: 'smooth' }
        }
    }
})

router.beforeEach((to, from, next) => {
    document.title = (to.meta.title as string) || ''
    next()
})

/**
 * 路由热更新
 */
if (import.meta.hot) {
    handleHotUpdate(router)
}

export default router
