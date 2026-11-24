<template>
	<view class="">
		<view style="width: 100%;background: rgb(0, 125, 255);" :style="{
			height:safeAreaTop+'px'
		}">
		</view>
		<view style="width: 100%;background: rgb(0, 125, 255);" :style="{
			height: '90upx'
		}">
		</view>
		<view class="flex nav-bar items-center justify-center" :style="{top:safeAreaTop + 'px'}">
			<image class="backIcon" v-if="isTab" src="../../static/left.png" mode="widthFix" @click="back"></image>
			{{title}}
			<image class="selIcon" v-if="isSel" src="../../static/select.png" mode="widthFix"></image>
		</view>

	</view>
</template>

<script>
	export default {
		name: "nav-bar",
		props: {
			title:{
				type:String,
				default:''
			},
			isTab:{
				type:Boolean,
				default:false
			},
			isSel:{
				type:Boolean,
				default:false
			}
		},
		data() {
			return {
				safeAreaTop: 0
			};
		},
		mounted() {
			this.safeAreaTop = uni.getSystemInfoSync().safeArea.top
		},
		methods:{
			back(){
				uni.navigateBack()
			}
		}
	}
</script>

<style scoped>
	.nav-bar {
		height: 90upx;
		position: fixed;
		width: 100%;
		top: 0;
		left: 0;
		box-shadow: 14px 10px 50px 0px rgba(174, 192, 204, 0.2);
		background: rgb(0, 125, 255);
		color: rgb(231, 236, 241);
		font-size: 32upx;
		font-weight: 700;
		text-align: center;
		z-index: 2;
	}

	.backIcon {
		width: 40upx;
		position: absolute;
		left: 33upx;
	}
	.selIcon {
		width: 40upx;
		position: absolute;
		right: 33upx;
	}
</style>