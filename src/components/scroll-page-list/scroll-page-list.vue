<template>
    <scroll-view class="list-view" scroll-y="true" :style="{ height: scprllHeight + 'rpx' }" :refresher-threshold="100"
        @refresherrefresh="refresherrefreshFun" @refresherpulling="refresherpullingFun"
        :refresher-triggered="isRefresher" @scrolltolower="scrolltolowerFun" refresher-enabled="true"
        refresher-default-style="none">
        <view class="content-box">
            <slot></slot>
        </view>
    </scroll-view>
</template>
<script>
export default {
    data() {
        return {
            isRefresher: false,
        }
    },
    methods: {
        refresherrefreshFun() {
            this.isRefresher = true;
            this.$emit('refresh');
        },
        refresherpullingFun() {
            this.isRefresher = false;
        },
        scrolltolowerFun() {
            this.$emit('scrolltolower');
        }
    }
}
</script>
<style>
.list-view {
    padding: 2%;
    margin-bottom: 150rpx;
}
</style>