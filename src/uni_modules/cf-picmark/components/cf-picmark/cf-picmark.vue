<template>
	<canvas ref="canvas" @click.stop="" id="my-canvas" canvas-id="my-canvas"></canvas>
</template>
<script>
	export default {
		props: {

		},
		data() {
			return {
				canvasW: 0,
				canvasH: 0
			}
		},
		onReady() {

		},
		methods: {
			/**
			 * @param {Object} options{imageSrc:图片路径,text:水印内容，FontSize:默认50，fillstyle:默认red,complete回调方法}
			 */
			getmark(options) {
				let that = this
				uni.createSelectorQuery().select('#my-canvas').boundingClientRect(data => {
					const {
						width,
						height
					} = data;
					let {
						fontsize = 24, fillstyle = 'red'
					} = options;


					uni.getImageInfo({
						src: options.imageSrc,
						success: async function(res) {
							that.canvasW = `${res.width}px`
							that.canvasH = `${res.height}px`
							const bol = res.width < res.height
							let waterW = res.width
							console.log(res.width, 'res.width');
							console.log(res.height, "res.height");
							await that.sleep(200)
							const ctx = uni.createCanvasContext('my-canvas', that);
							ctx.clearRect(0, 0, width, height)
							// console.log(res.width);
							ctx.beginPath()
							// 加载图片
							ctx.drawImage(res.path, 0, 0, width, height); //加载并缩放
							// 设置水印样式
							ctx.beginPath()
							ctx.setFontSize(fontsize);
							ctx.setFillStyle(fillstyle);
							ctx.setGlobalAlpha(1);
							ctx.fillText(options.text[0], 5, height - fontsize - 10);
							ctx.setFontSize(12);
							ctx.setFillStyle(fillstyle);
							
							ctx.fillText(options.text[1], 5, 30);
							// console.log(3, "res")
							ctx.draw(false, async () => {
								await that.sleep(500) // 某些平台 canvas 渲染慢，需要等待
								// 导出图片
								uni.canvasToTempFilePath({
									canvasId: 'my-canvas',
									width: res.width, // 画布宽  
									height: res.height, // 画布高
									// destWidth: res.width, //输出图片宽度
									// destHeight: res.height,
									fileType: 'jpg',
									quality: 0.8,
									success: (res) => {
										options.complete(res.tempFilePath)
									},
									fail: (err) => {
										console.error(
											'Error drawing watermark:', err
											);
									},
									complete: (res) => {
										// that.img = res.tempFilePath;
									}
								});

							});
						}
					})
				}).exec();
				// 获取画布的宽高


			},
			sleep(millisecond) {
				return new Promise((resolve) => {
					setTimeout(resolve, millisecond)
				})
			}

		}
	}
</script>
<style scoped>
	.full {
		height: 100%;
		width: 100%;
	}
</style>