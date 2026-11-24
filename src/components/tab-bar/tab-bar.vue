<template>
	<view>
		<view v-if="isTab" class="flex tab-bar justify-around items-center">
			<view @click="navTo('/pages/report/index')" :class="{
				'item-active': page == 0
			}" class="items  flex justify-center items-center">
				<!-- 报告记录 -->
				<image src="../../static/report.png" mode="widthFix"></image>
			</view>

			<view @click="navTo('/pages/discern/ocr-process')" :class="{
				'item-active': page == 1
			}" class="items  flex justify-center items-center">
				<!-- 报告识别 -->
				<image src="../../static/discern.png" mode="widthFix"></image>
			</view>

			<view @click="navTo('/pages/regard/index')" :class="{
				'item-active': page == 2
			}" class="items flex justify-center items-center">
				<!-- 关于 -->
				<image src="../../static/setting.png" mode="widthFix"></image>
			</view>

		</view>
		<view class="tab-bar" style="height: 120rpx;" v-else>
			<slot></slot>
		</view>
		<view v-if="isTab" style="height: 120rpx;">

		</view>
	</view>
</template>

<script>
export default {
	name: "tab-bar",
	props: {
		page: {
			type: Number,
			default: 1
		},
		isTab: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			windowBottom: 0
		};
	},
	methods: {
		navTo(url) {
			uni.switchTab({
				url
			})
		}
	},
	mounted() {
		const data = uni.getSystemInfoSync()
		this.windowBottom = data.windowBottom
	}
}
</script>

<style lang="less" scoped>
.tab-bar {
	height: calc(120rpx + env(safe-area-inset-bottom));
	background: rgb(0, 125, 255);
	position: fixed;
	bottom: v-bind(windowBottom); // 使用绑定的安全区域底部距离
	left: 0;
	width: 100%;
	box-shadow: 0px -10px 20px 0px rgba(141, 167, 215, 0.1);
	z-index: 999;
}

.items {
	width: 88rpx;
	height: 88rpx;
	border-radius: 20rpx;

	image {
		width: 55rpx;
		height: 50rpx;
	}
}

.item-active {
	box-shadow: inset 10rpx 10rpx 20rpx 0rpx rgba(174, 192, 204, 0.5), inset -10rpx -10rpx 30rpx 0rpx rgb(255, 255, 255);
	background: rgb(192, 192, 192);
}
</style>