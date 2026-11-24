<template>
	<view class="custom-input">
		<view v-if="isSelect" :class="`click-node ${val?'':'full'}`" @click="clickInput"></view>
		<uni-easyinput :type="type" :value="val" :placeholder="placeholder" @change="changeVal" @clear="calerVal" @focus="focus" :disabled="disabled"/>
	</view>
</template>

<script>
	export default {
		props: {
			value: {
				type: [String, Number],
				default: ''
			},
			type: {
				type: String,
				default: ''
			},
			placeholder: {
				type: String,
				default: '请输入'
			},
			minNum: {
				type: Number,
				default: 0
			},
			maxNum: {
				type: Number,
				default: Infinity
			},
			isSelect: {
				type: Boolean,
				default: false
			},
			isInteger: {
				type: Boolean,
				default: false
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				val: ''
			}
		},
		mounted() {
			this.updateVal()
		},
		watch: {
			value(val) {
				this.updateVal()
			}
		},
		methods: {
			updateVal() {
				this.val = this.value
			},
			clickInput() {
				this.$emit('handle')
			},
			changeVal(val) {
				if (this.type === 'number') {
					val = Number(val)
					if (val < this.minNum) {
						val = this.minNum
					}
					if (val > this.maxNum) {
						val = this.maxNum
					}
					if (this.isInteger) {
						val = Math.floor(val)
					}
				}

				// 防止输入框中的值不更新
				this.val = ''
				this.$nextTick(() => {
					this.val = val
				})
				this.$emit('input', val)
				this.$emit('change', val)
			},
			calerVal() {
				if (!this.isSelect) {
					this.$emit('input', '')
					this.$emit('change', '')
				}

				this.$emit('caler')
			},
			focus(){
				this.$emit('focus')
			}
		}
	}
</script>

<style scoped lang="less">
	.custom-input {
		position: relative;

		.click-node {
			position: absolute;
			top: 0;
			left: 0;
			z-index: 2;
			width: 85%;
			height: 100%;

			&.full {
				width: 100%;
			}
		}
	}
</style>