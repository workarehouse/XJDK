import { defineStore } from 'pinia'
import store from 'store'

export const useUserStore = defineStore('user', () => {
    const router = useRouter()
    const userInfo = ref(store.get('userInfo') || {})

    // 登陆
    const login = async (param: any) => {
        const { data } = await http.post('/auth/login', param)
        store.set('token', data.token)
        fetchUserInfo()
    }

    // 注册
    const register = async (param: any) => {
        const { data } = await http.post('/auth/register', param)
        store.set('token', data.token)
        fetchUserInfo()
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
        const { data }: { data: any } = await http.post('/user/info')

        userInfo.value = data
        store.set('userInfo', data)
    }

    // 退出
    const logout = () => {
        store.clearAll()
        router.push('/')
    }

    return { userInfo, login, register, logout, fetchUserInfo }
})
