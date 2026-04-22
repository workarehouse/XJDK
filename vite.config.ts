import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import legacy from '@vitejs/plugin-legacy'
import AutoImport from 'unplugin-auto-import/vite'
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import ViteRestart from 'vite-plugin-restart'
import { ClientSideLayout } from 'vite-plugin-vue-layouts'
import { webUpdateNotice } from '@plugin-web-update-notification/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Resolver from './src/utils/Resolver'
import zipPack from 'vite-plugin-zip-pack'

export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd())
    return {
        base: env.VITE_BASE,
        plugins: [
            VueRouter({ dts: 'types/typed-router.d.ts' }) /** 文件路由 */,
            vue(),
            ClientSideLayout({ defaultLayout: 'Default' }) /**布局 */,
            ViteRestart({ restart: ['*.config.[jt]s'] }) /**热加载配置文件*/,
            legacy({ targets: ['defaults', 'not IE 11'] }) /**兼容旧浏览器,使用会影响打包速度*/,
            webUpdateNotice({ versionType: 'build_timestamp', logVersion: true }) /**版本更新提示 */,

            /**自动vue引入 */
            AutoImport({
                dts: 'types/auto-imports.d.ts',
                resolvers: [ElementPlusResolver(), Resolver('http', '@/utils/http')],
                imports: [
                    'vue',
                    'pinia',
                    VueRouterAutoImports,
                    {
                        '@/hooks/useApi': ['useApi'],
                        '@/store': ['useStore']
                    }
                ]
            }),

            /**自动引入组件 */
            Components({ dts: 'types/components.d.ts', resolvers: [PrimeVueResolver(), HeadlessUiResolver(), ElementPlusResolver()] }),

            //打包文件压缩zip
            // zipPack({ outDir: 'dist' })
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        /**跨域 */
        server: {
            hmr: true,
            host: 'localhost',
            proxy: {
                '/_api': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/_api/, '')
                }
            }
        }
    }
})
