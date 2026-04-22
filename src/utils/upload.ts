import http from '@/utils/http'

export const uploadImageToServer = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const uploadRes = await http.post('/sys/common/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })

    return String(uploadRes.data.result || '')
}
