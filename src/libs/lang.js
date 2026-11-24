/**
 * 全局语言切换 mixin
 * 提供 $lang 翻译方法和 switchLang 切换方法
 * 语言偏好持久化到 uni storage
 */
import messages from './i18n.js'

const LANG_KEY = 'app_language'

// 全局响应式语言状态（所有组件共享）
const langState = {
  current: uni.getStorageSync(LANG_KEY) || 'zh'
}

// 事件监听器列表
const listeners = []

const langMixin = {
  data() {
    return {
      // 每个组件实例都引用全局语言状态
      _langCurrent: langState.current
    }
  },
  computed: {
    // 当前语言，响应式
    currentLang() {
      return this._langCurrent
    }
  },
  created() {
    // 注册监听器，语言变化时更新本组件
    const update = (lang) => {
      this._langCurrent = lang
    }
    listeners.push(update)
    this._langListener = update
  },
  beforeDestroy() {
    // 移除监听器
    const idx = listeners.indexOf(this._langListener)
    if (idx > -1) listeners.splice(idx, 1)
  },
  methods: {
    /**
     * 翻译方法
     * @param {string} key - 翻译键
     * @returns {string} 翻译后的文本
     */
    $lang(key) {
      const lang = this._langCurrent || 'zh'
      return (messages[lang] && messages[lang][key]) || key
    },
    /**
     * 切换语言
     * @param {string} lang - 'zh' 或 'en'
     */
    switchLang(lang) {
      if (lang !== 'zh' && lang !== 'en') return
      langState.current = lang
      uni.setStorageSync(LANG_KEY, lang)
      // 通知所有组件更新
      listeners.forEach(fn => fn(lang))
    },
    /**
     * 状态值翻译
     * @param {string} status - 数据库中的状态值（中文）
     * @returns {string} 翻译后的状态文本
     */
    statusText(status) {
      const statusMap = {
        '待选图': 'PENDING',
        '识别中': 'RECOGNIZING',
        '识别完成': 'COMPLETED'
      }
      const key = statusMap[status]
      return key ? this.$lang(key) : status
    }
  }
}

export default langMixin
