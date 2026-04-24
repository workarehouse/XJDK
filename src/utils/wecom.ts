import * as ww from '@wecom/jssdk'
import store from 'store'

/**
 * 利用 Web Crypto API 对字符串进行 SHA-1 哈希
 * 签名算法参考：https://developer.work.weixin.qq.com/document/path/90506
 * 拼接格式：jsapi_ticket=X&noncestr=X&timestamp=X&url=X（按字母序，固定顺序）
 */
async function sha1(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

/**
 * 根据 ticket 和当前页面 url 生成 JSSDK 签名
 * @param ticket  企业 jsapi_ticket
 * @param url     当前页面 URL，不含 # 及后面部分
 */
async function generateSignature(ticket: string, url: string) {
    const nonceStr = Math.random().toString(36).slice(2, 18)
    const timestamp = Math.floor(Date.now() / 1000)
    // 按字母序拼接，顺序固定：jsapi_ticket → noncestr → timestamp → url
    const str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`
    const signature = await sha1(str)
    return { timestamp, nonceStr, signature }
}

/**
 * 统一处理签名 URL：必须是当前页面完整 URL（含路径和查询），但不包含 # 及后续片段
 */
function normalizeSignUrl(rawUrl: string) {
    const [urlWithoutHash] = rawUrl.split('#')
    return urlWithoutHash
}

/**
 * 动态读取最新 ticket，避免初始化时机导致使用空 ticket 或过期 ticket
 */
function getLatestTicket() {
    const cacheTicket = String(store.get('ticket') || '')
    if (cacheTicket) {
        return cacheTicket
    }

    const ticketFromQuery = new URL(window.location.href).searchParams.get('ticket')
    if (ticketFromQuery) {
        store.set('ticket', ticketFromQuery)
        return String(ticketFromQuery)
    }

    return ''
}

/**
 * 初始化企业微信 JS-SDK
 * ticket 由后端鉴权后通过 URL query 参数下发并缓存到本地
 * 签名在前端通过 Web Crypto API（SHA-1）计算，无需额外请求后端
 */
export function initWecomSDK(jsApiList: string[] = []) {
    const corpId = import.meta.env.VITE_WECOM_CORP_ID as string

    const registerOptions: ww.RegisterOptions = {
        corpId,
        jsApiList,
        // 企业签名：使用企业 jsapi_ticket
        async getConfigSignature(url: string) {
            const latestTicket = getLatestTicket()
            const signUrl = normalizeSignUrl(url)

            if (!latestTicket) {
                console.error('[企业微信签名] 未获取到可用的 jsapi_ticket，请先确认 ticket 是否正确下发并未过期')
            }

            const signatureData = await generateSignature(latestTicket, signUrl)

            // 便于排查：时间戳必须是秒级
            if (String(signatureData.timestamp).length !== 10) {
                console.warn('[企业微信签名] timestamp 不是秒级，请检查时间戳单位', signatureData.timestamp)
            }

            return signatureData
        },
    }

    ww.register(registerOptions)
}
