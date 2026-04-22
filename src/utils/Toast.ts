// toast.ts

type ToastType = 'success' | 'info' | 'error'

interface ToastOptions {
    message: string
    delay?: number // 延迟时间，以毫秒为单位
}

type ToastInput = string | ToastOptions

const Toast = {
    success: (input: ToastInput) => {
        if (typeof input === 'string') {
            showToast('success', { message: input })
        } else {
            showToast('success', input)
        }
    },
    info: (input: ToastInput) => {
        if (typeof input === 'string') {
            showToast('info', { message: input })
        } else {
            showToast('info', input)
        }
    },
    error: (input: ToastInput) => {
        if (typeof input === 'string') {
            showToast('error', { message: input })
        } else {
            showToast('error', input)
        }
    }
}

const showToast = (type: ToastType, { message, delay = 3000 }: ToastOptions) => {
    const container = getToastContainer()
    const toastElement = document.createElement('div')
    toastElement.className = getToastClasses(type)

    toastElement.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                ${getIcon(type)}
            </div>
            <div class="ml-3">
                <p class="text-sm ${getTextColor(type)}">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                    <button type="button" class="inline-flex rounded-md p-1.5 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonFocusRing(type)}" onclick="this.closest('.toast').remove();">
                        <span class="sr-only">关闭</span>
                        <svg class="h-5 w-5 ${getIconColor(type)}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `

    // 添加标识类以便移除
    toastElement.classList.add('toast')

    container.appendChild(toastElement)

    // 指定延迟时间后自动移除通知
    setTimeout(() => {
        toastElement.remove()
    }, delay)
}

// 辅助函数，根据通知类型获取相应的类和图标
const getToastClasses = (type: ToastType): string => {
    let bgColor = 'bg-green-50'
    if (type === 'info') bgColor = 'bg-blue-50'
    if (type === 'error') bgColor = 'bg-red-50'

    return `toast rounded-md ${bgColor} p-4 shadow-lg fixed top-4 left-1/2 transform -translate-x-1/2 w-80 z-50`
}

const getTextColor = (type: ToastType): string => {
    if (type === 'success') return 'text-green-800'
    if (type === 'info') return 'text-blue-800'
    if (type === 'error') return 'text-red-800'
    return 'text-gray-800'
}

const getIcon = (type: ToastType): string => {
    if (type === 'success') {
        return `
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">  
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
            </svg>
        `
    } else if (type === 'info') {
        return `
        <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
        </svg>
        `
    } else if (type === 'error') {
        return `
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
        `
    }
    return ''
}

const getIconColor = (type: ToastType): string => {
    if (type === 'success') return 'text-green-500'
    if (type === 'info') return 'text-blue-500'
    if (type === 'error') return 'text-red-500'
    return 'text-gray-500'
}

const getButtonFocusRing = (type: ToastType): string => {
    if (type === 'success') return 'focus:ring-green-600 focus:ring-offset-green-50'
    if (type === 'info') return 'focus:ring-blue-600 focus:ring-offset-blue-50'
    if (type === 'error') return 'focus:ring-red-600 focus:ring-offset-red-50'
    return 'focus:ring-gray-600 focus:ring-offset-gray-50'
}

// 创建或获取通知容器
const getToastContainer = (): HTMLElement => {
    let container = document.getElementById('toast-container')
    if (!container) {
        container = document.createElement('div')
        container.id = 'toast-container'
        container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50'
        document.body.appendChild(container)
    }
    return container
}

export default Toast
