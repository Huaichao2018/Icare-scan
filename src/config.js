/**
 * IcareScan API Configuration
 *
 * By default, IcareScan transmits report images over HTTPS to a relay service
 * operated by Chengdu Qianli Zhiwai Technology Co., Ltd., which forwards
 * recognition requests to the external iFLYTEK Open Platform OCR API.
 *
 * To use a self-hosted OCR relay or custom backend, update `ocrApiUrl` below
 * before building the Android application.
 */
export default {
  ocrApiUrl: 'https://df.qlzwonline.com/api/SubDev/XfyunOcrService/xfyun',
  feedbackApiUrl: 'https://df.qlzwonline.com/api/SubDev/XfyunOcrService/feedback/'
}
