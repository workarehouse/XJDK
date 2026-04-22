import { useAxios, type StrictUseAxiosReturn, type UseAxiosOptions } from '@vueuse/integrations/useAxios'
import AxiosInstance from '@/utils/http'
import type { AxiosResponse } from 'axios'

interface ApiResponse<T> extends StrictUseAxiosReturn<T, AxiosResponse<T>, {}> {}

export function useApi<T>(url: string, data?: object, useAxiosOptions?: UseAxiosOptions): ApiResponse<T> {
    return useAxios(url, { method: 'POST', data }, AxiosInstance, useAxiosOptions)
}
