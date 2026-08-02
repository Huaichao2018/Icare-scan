/**
 * Global language switching mixin
 * Provides the $lang translation method and switchLang toggle method
 * Language preference is persisted to uni storage
 */
import messages from './i18n.js'

const LANG_KEY = 'app_language'

// Global reactive language state (shared across all components)
const langState = {
  current: uni.getStorageSync(LANG_KEY) || 'zh'
}

// List of event listeners
const listeners = []

const langMixin = {
  data() {
    return {
      _langCurrent: langState.current
    }
  },
  computed: {
    currentLang() {
      return this._langCurrent
    }
  },
  created() {
    const update = (lang) => {
      this._langCurrent = lang
    }
    listeners.push(update)
    this._langListener = update
  },
  beforeDestroy() {
    const idx = listeners.indexOf(this._langListener)
    if (idx > -1) listeners.splice(idx, 1)
  },
  methods: {
    /**
     * Translation method
     * @param {string} key - translation key
     * @returns {string} translated text
     */
    $lang(key) {
      const lang = this._langCurrent || 'zh'
      return (messages[lang] && messages[lang][key]) || key
    },
    /**
     * Switch language
     * @param {string} lang - 'zh' or 'en'
     */
    switchLang(lang) {
      if (lang !== 'zh' && lang !== 'en') return
      langState.current = lang
      uni.setStorageSync(LANG_KEY, lang)
      listeners.forEach(fn => fn(lang))
    }
  }
}

export default langMixin
