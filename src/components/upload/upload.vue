<template>
	<view class="files">
		<view class="item file" v-for="(it, idx) in list" :key="idx">
			<image class="img" mode="aspectFit" :src="`${domain}${it.url}`" @click="showImg(idx)" />
			<view class="del-icon" @click.stop="removeFile(idx)" v-if="canEdit"></view>
		</view>
		<view class="item btn" @click="chooseImage" v-if="canEdit">点击上传</view>
	</view>
</template>

<script>
	import {
		UploaderAnnex
	} from '@/db/action.js'

	export default {
		props: {
			domain: {
				type: String,
				//default: 'http://49.235.117.168:8096'
				default: 'http://124.243.175.128:8096' //测试地址
				//default: 'http://www.hfanhe.cn:8096' //正式地址
			},
			fileList: {
				type: Array,
				default: () => []
			},
			canEdit: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				list: [], // 已上传的文件列表
			}
		},
		watch: {
			fileList(val) {
				this.list = JSON.parse(JSON.stringify(val))
			}
		},
		mounted() {

		},
		methods: {
			chooseImage() {
				uni.chooseImage({
					count: 9, // 默认选择一张图片
					sourceType: ['album', 'camera'], // 支持相册和拍摄
					success: (res) => {
						res.tempFilePaths.forEach(i=>{
							const path =i// 获取选择的图片路径
							this.upload(path)
						})
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
					}
				});
			},
			upload(path) {
				uni.uploadFile({
					url: `${this.domain}/api/file/Uploader/annex`,
					filePath: path,
					name: 'file',
					formData: {},
					success: (res) => {
						const data = JSON.parse(res.data).data

						// 手动加一个fileId，因为PC端依赖这个字段
						data.fileId = data.url.split('/').pop()

						this.list.push(data)
					},
					fail: (err) => {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						})
					}
				})
			},
			showImg(idx) {
				const urls = this.list.map(it => `${this.domain}${it.url}`)
				uni.previewImage({
					current: urls[idx],
					urls
				});
			},
			removeFile(idx) {
				uni.showModal({
					title: '提示',
					content: '确定删除当前照片？',
					success: (res) => {
						if (res.confirm) {
							this.list.splice(idx, 1)
						}
					}
				});
			},
			getFiles() {
				return JSON.stringify(this.list)
			}
		}
	}
</script>

<style scoped lang="less">
	.files {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 20upx;

		.item {
			width: 200upx;
			height: 200upx;
			border: 1px solid #ddd;
			border-radius: 8upx;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
		}

		.file {
			position: relative;

			.img {
				display: block;
				width: 100%;
				height: 100%;
			}

			.del-icon {
				position: absolute;
				top: -15upx;
				right: -15upx;
				width: 34upx;
				height: 34upx;
				background-image: url('/static/del.png');
				background-size: 100%;
			}
		}

		.btn {
			color: #888;
			font-size: 12px;
		}
	}
</style>