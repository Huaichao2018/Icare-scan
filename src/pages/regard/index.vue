<template>
  <view>
    <!-- 语言切换 -->
    <div class="card lang-section">
      <div class="lang-switch">
        <span class="lang-label">{{ $lang('language') }}</span>
        <view class="lang-btns">
          <button
            class="lang-btn"
            :class="{ active: currentLang === 'zh' }"
            @click.stop="switchLang('zh')"
          >{{ $lang('chinese') }}</button>
          <button
            class="lang-btn"
            :class="{ active: currentLang === 'en' }"
            @click.stop="switchLang('en')"
          >{{ $lang('english') }}</button>
        </view>
      </div>
    </div>

    <!-- 反馈部分 -->
    <div class="card feedback-section">
      <div class="card-title">
		  <span>{{ $lang('feedback') }}</span>
	  </div>
      <p>{{ $lang('feedbackDesc') }}</p>

      <div class="form-item" style="margin-top: 20px;">
        <label>{{ $lang('problemDesc') }}</label>
        <div class="textarea-wrapper">
          <div class="custom-placeholder" v-if="!feedback">
            <span>{{ $lang('feedbackPlaceholder') }}</span>
          </div>
          <textarea class="feedback-text" v-model="feedback"></textarea>
        </div>
      </div>

      <button class="btn btn-feedback" @click.stop="sendFeedback()">
        <span>{{ $lang('sendFeedback') }}</span>
      </button>

      <div class="contact-info">
        <p>{{ $lang('contactOr') }}<a href="mailto:luohc@uestc.edu.cn" class="email-link">luohc@uestc.edu.cn</a></p>
      </div>
    </div>

    <uni-popup ref="popup" type="center">
      <uni-popup-message :type="msgInfo.type" :message="msgInfo.message" :duration="1500"></uni-popup-message>
    </uni-popup>

  </view>
</template>

<script>
import config from '@/config.js'

export default {
  data () {
    return {
      title: 'Hello',
      Dates: undefined,
      show: false,
      feedback: undefined,
      msgInfo: {
        type: undefined,
        message: undefined,
      }, //弹窗消息
    }
  },
  onShow () {
    uni.setNavigationBarTitle({ title: this.$lang('navAbout') });
  },
  methods: {
    sendFeedback () {
      console.log("fankui")
      if (!this.feedback) {
        this.msgInfo.type = "warning";
        this.msgInfo.message = this.$lang('feedbackEmpty');
        this.$refs.popup.open();
        return;
      }

      uni.request({
        url: config.feedbackApiUrl + encodeURIComponent(this.feedback),
        method: 'GET',
        success: res => {
          console.log(JSON.stringify(res))
          if (res.data.msg) {
            uni.showToast({
              title: res.data.msg,
              icon: "info",
            });
            this.feedback = undefined
          } else {
            uni.showToast({
              title: this.$lang('feedbackFailed'),
              icon: "error",
            });
            
          }
        }
      })
    }

  }
}
</script>
<style scoped lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

body {
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.nav-bar .back-btn {
  font-size: 24px;
  margin-right: 15px;
  cursor: pointer;
}

.nav-bar h1 {
  font-size: 20px;
  font-weight: 600;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.datetime-picker {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fff;
}

.lang-section {
  margin-top: 20px;
}

.lang-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lang-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.lang-btns {
  display: flex;
  gap: 10px;
}

.lang-btn {
  padding: 6px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 20px;
  background: #f5f7fa;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  line-height: 1.5;
}

.lang-btn.active {
  background: #2979ff;
  color: #fff;
  border-color: #2979ff;
}

.feedback-section {
  margin-top: 10px;
}

.textarea-wrapper {
  position: relative;
}

.custom-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px;
  pointer-events: none;
  color: #999;
  font-size: 16px;
  line-height: 1.5;
}

.feedback-text {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  background: transparent;
  position: relative;
}

.btn {
  display: inline-block;
  padding: 12px 25px;
  background-color: #2979ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #2962ff;
}

.btn-open {
  margin-top: 15px;
  background-color: #4caf50;
}

.btn-open:hover {
  background-color: #43a047;
}

.btn-feedback {
  width: 100%;
  margin-top: 15px;
  background-color: #ff9800;
}

.btn-feedback:hover {
  background-color: #f57c00;
}

.contact-info {
  text-align: center;
  margin-top: 30px;
  color: #666;
  font-size: 14px;
}

.email-link {
  color: #2979ff;
  text-decoration: none;
  font-weight: 500;
}

.tab-bar {
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 0;
  border-top: 1px solid #e0e0e0;
}

.tab-item {
  text-align: center;
  color: #999;
  font-size: 12px;
}

.tab-item.active {
  color: #2979ff;
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
}
</style>