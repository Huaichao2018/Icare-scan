<template>
	<uni-popup class="custom-popup" ref="customPopup" type="bottom" background-color="#fff" @maskClick="cancel">
		<view class="popup-title">{{title}}</view>
		<view class="treeSelect-search" v-if="isShowfilter">
			<uni-easyinput placeholder="输入关键字进行过滤" v-model="filterText" />
		</view>
		<scroll-view scroll-y="true" :style="`height: ${height};`">
			<slot />
		</scroll-view>
		<template v-if="customBtns">
			<slot name="btns" />
		</template>
		<view class="bottom-btns" v-else>
			<button class="btn" @click="cancel">取消</button>
			<button class="btn" type="primary" @click="confim">确定</button>
		</view>
	</uni-popup>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: ''
			},
			height: {
				type: String,
				default: '40vh'
			},
			customBtns: {
				type: Boolean,
				default: false
			},
			isShowfilter: {
				type: Boolean,
				default: true
			},
		},
		data() {
			return {
				filterText: '',
				moving: false
			};
		},
		watch: {
			filterText(val) {
				this.$emit('filter',val)
			}
		},
		mounted() {},
		methods: {
			swithShow(show) {
				if (show) {
					this.$refs.customPopup.open('bottom')
				} else {
					this.$refs.customPopup.close()
				}
			},
			cancel() {
				this.$emit('cancel')
				this.swithShow(false)
			},
			confim() {
				this.$emit('confim')
				this.swithShow(false)
			}
		}
	}
</script>

<style lang="less">
	.custom-popup {
		.popup-title {
			text-align: center;
			font-weight: bold;
			padding: 20upx 0;
		}
	}
</style>