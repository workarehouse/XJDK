import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import Toast from '@/utils/Toast'
import store from 'store'

const instance: AxiosInstance = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? '/_api' : import.meta.env.VITE_API_BASE_URL,
    timeout: 10 * 1000, // 请求超时时间
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
})

// 添加请求拦截器
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = store.get('token')
    if (token) {
        config.headers['X-Access-Token'] = `${token}`
    }
    return config
})

// 添加响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        const { code, msg } = response.data
        if (code === 200) {
            return response
        } else {
            handleErrorCode(code, msg)
            return Promise.reject(msg)
        }
    },
    (error) => {
        const { status, response } = error
        handleErrorCode(response?.data?.code || status, response?.data?.msg)
        return Promise.reject(response?.data)
    }
)

// 错误处理
function handleErrorCode(code: number, msg: string = 'An error occurred') {
    switch (code) {
        case 401:
            console.error('Unauthorized: Please log in.')
            // 只在生产环境跳转到登录页面
            if (import.meta.env.MODE === 'production') {
                window.location.href = import.meta.env.VITE_LOGIN_URL
            }
            break
        case 500:
            Toast.error(msg || 'Server Error')
            break
        default:
            Toast.error(msg)
            break
    }
}

export default instance
