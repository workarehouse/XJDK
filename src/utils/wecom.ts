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
 * 初始化企业微信 JS-SDK
 * ticket 由后端鉴权后通过 URL query 参数下发并缓存到本地
 * 签名在前端通过 Web Crypto API（SHA-1）计算，无需额外请求后端
 */
export function initWecomSDK(jsApiList: string[] = []) {
    const corpId = import.meta.env.VITE_WECOM_CORP_ID as string
    const corpTicket = String(store.get('ticket') || '')

    const registerOptions: ww.RegisterOptions = {
        corpId,
        jsApiList,
        // 企业签名：使用企业 jsapi_ticket
        async getConfigSignature(url: string) {
            return await generateSignature(corpTicket, url)
        },
    }

    ww.register(registerOptions)
}
