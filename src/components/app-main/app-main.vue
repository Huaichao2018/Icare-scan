<template>
	<scroll-view @scrolltolower="$emit('onBottom')" @scroll="$emit('scroll')" lower-threshold="20" scroll-y="true"
		:style="`height: calc(100vh - 89rpx - ${hasTab ? '120rpx' : '0px'} - ${safeAreaTop}px);background: rgb(245, 245, 245);`">
		<view style="padding: 1rpx 0 0;">
			<slot></slot>
		</view>
	</scroll-view>
</template>

<script>
	export default {
		name: "app-main",
		props: {
			hasTab:{
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				safeAreaTop: 0
			};
		},
		mounted() {
			this.safeAreaTop = uni.getSystemInfoSync().safeArea.top
		}
	}
</script>

<style>

</style>