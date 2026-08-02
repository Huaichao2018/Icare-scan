<template>
  <view>
    <!-- Language switch -->
    <div class="card lang-section">
      <div class="lang-switch">
        <span class="lang-label">{{ $lang('language') }}</span>
        <view class="lang-btns">
          <button class="lang-btn" :class="{ active: currentLang === 'zh' }" @click.stop="switchLang('zh')">
            {{ $lang('chinese') }}
          </button>
          <button class="lang-btn" :class="{ active: currentLang === 'en' }" @click.stop="switchLang('en')">
            {{ $lang('english') }}
          </button>
        </view>
      </div>
    </div>

    <!-- Feedback section -->
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
        <p>{{ $lang('contactOr') }}<a href="mailto:forcontinue@outlook.com" class="email-link">forcontinue@outlook.com</a></p>
      </div>
    </div>
    <uni-popup ref="popup" type="center">      <uni-popup-message :type="msgInfo.type" :message="msgInfo.message" :duration="1500"></uni-popup-message>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedback: undefined,
      msgInfo: { type: undefined, message: undefined },
    }
  },
  onShow() {
    uni.setNavigationBarTitle({ title: this.$lang('navAbout') });
  },
  methods: {
    sendFeedback() {
      if (!this.feedback) {
        this.msgInfo.type = "warning";
        this.msgInfo.message = this.$lang('feedbackEmpty');
        this.$refs.popup.open();
        return;
      }
      uni.request({
        url: "https://df.qlzwonline.com/api/SubDev/XfyunOcrService/feedback/" + this.feedback,
        method: 'GET',
        success: res => {
          if (res.data.msg) {
            uni.showToast({ title: res.data.msg, icon: "info" });
            this.feedback = undefined;
          } else {
            uni.showToast({ title: this.$lang('feedbackFailed'), icon: "error" });
          }
        }
      })
    }
  }
}
</script>
<style scoped lang="less">
.card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
.lang-switch { display: flex; align-items: center; justify-content: space-between; }
.lang-btn { padding: 6px 20px; border: 1px solid #dcdfe6; border-radius: 20px; background: #f5f7fa; }
.lang-btn.active { background: #2979ff; color: #fff; border-color: #2979ff; }
.feedback-text { width: 100%; min-height: 120px; padding: 15px; border: 1px solid #dcdfe6; border-radius: 8px; }
.btn-feedback { width: 100%; margin-top: 15px; background-color: #ff9800; }
</style>
