<template>
	<view class="add_page">
		<uni-forms :model="dataForm" labelWidth="80px">
			<uni-forms-item :label="$lang('billNo')">
				<uni-easyinput v-model="dataForm.billNo" :placeholder="$lang('inputBillNo')" />
			</uni-forms-item>
			<uni-forms-item :label="$lang('imageCount')">
				<uni-easyinput v-model="dataForm.imageCount" :disabled="true" />
			</uni-forms-item>
			<uni-forms-item :label="$lang('remark')">
				<uni-easyinput v-model="dataForm.remark" :placeholder="$lang('inputRemark')" />
			</uni-forms-item>
			<uni-forms-item :label="$lang('status')">
				<view class="status-display">{{ displayStatus }}</view>
			</uni-forms-item>
		</uni-forms>
		<!-- 图片上传区域 -->
		<view class="upload-section">
			<view class="section-title">{{ $lang('imageUpload') }}</view>
			<view class="image-list">
				<!-- 已上传的图片 -->
				<view v-for="(image, index) in uploadedImages" :key="index" class="image-item">
					<image :src="image.path" mode="aspectFill" class="uploaded-image" />
					<view class="image-mask">
						<text class="image-index">{{ index + 1 }}</text>
						<view class="delete-btn" @click="deleteImage(index)">×</view>
					</view>
				</view>

				<!-- 添加图片按钮 -->
				<view v-if="uploadedImages.length < maxImageCount" class="image-item add-image-btn"
					@click="chooseImage">
					<view class="add-icon">+</view>
					<text>{{ $lang('addImage') }}</text>
				</view>
			</view>
		</view>

		<view class="btn-box" v-if="dataForm.status === STATUS.PENDING">
			<button type="warn" @click="handleClick('cancel')" :disabled="isDisabled">{{ $lang('cancel') }}</button>
			<button type="default" @click="handleClick('save')" :disabled="isDisabled">{{ $lang('saveTemp') }}</button>
			<button type="primary" @click="handleClick('discern')" :disabled="isDisabled">{{ $lang('startDiscern') }}</button>
		</view>
	</view>
</template>

<script>
import {
	InsertReportList,
	UpdateReportList,
	InsertReportSource,
	DeleteReportSource
} from '@/db/action.js'
import DB from '@/db/sqlite.js'
import config from '@/config.js'
import { pathToBase64, base64ToPath } from 'image-tools'

// 状态常量（与数据库存储一致，显示时通过 statusText() 翻译）
const STATUS = {
	PENDING: '待选图',
	RECOGNIZING: '识别中',
	COMPLETED: '识别完成'
}

export default {
	data() {
		return {
			maxImageCount: 100,
			isDisabled: false,
			dataForm: {
				id: '',
				billNo: '',
				imageCount: 0,
				remark: '',
				createTime: '',
				status: STATUS.PENDING
			},
			uploadedImages: [], // 存储已上传的图片
			imageStoragePath: '',
		}
	},
	watch: {
		uploadedImages: {
			handler(newVal) {
				// 当上传图片数组变化时，更新图片数量显示
				this.dataForm.imageCount = `${newVal.length}/${this.maxImageCount}`;
			},
			deep: true
		},
		'dataForm.status': {
			handler(newVal) {
				// 当状态变化时，更新按钮显示
				if (this.dataForm.imageCount >= 1) {
					this.dataForm.status = STATUS.RECOGNIZING;
				}
			}
		}
	},
	computed: {
		// 状态显示值（翻译后的）
		displayStatus() {
			return this.statusText(this.dataForm.status);
		}
	},
	onLoad(options) {
		uni.setNavigationBarTitle({ title: this.$lang('navAddRecord') });
		const id = options.id;
		if (id) {
			this.getReportDetail(id);
		}
	},
	async created() {
		this.dataForm.billNo = await this.generateUniqueCode();
	},
	methods: {
		async getReportDetail(id) {
			try {
				const result = await DB.selectTableData('report_record_new', `where id=${id}`);
				const childRecord = await this.getReportSource(id);
				const data = result[0];
				if (data) {
					this.dataForm = {
						id: data.id || '',
						billNo: data.billNo || '',
						imageCount: data.imageCount || '',
						remark: data.remark || '',
						status: data.status || STATUS.PENDING
					};
				}
				if (childRecord) {
					this.uploadedImages = childRecord.map(item => ({
						path: item.img,
						imgName: item.img_name
					}));
					console.log("获取到数据childRecord", childRecord);
				}
			}
			catch (e) {
				console.log("获取数据失败", e)
			}
		},
		async getReportSource(id) {
			const childRecord = await DB.selectTableData('report_record_img', `where info_id='${id}'`)
			// console.log("获取到数据", childRecord);
			return childRecord;
		},
		async getUsedBillNo() {
			const data = await DB.selectTableData('report_record_new');
			console.log('data', data);

			const billNoArray = data.map(item => {
				return item.billNo;
			})
			return billNoArray;

		},
		async getAvailableCount() {
			const totalPossible = 999999 - 100000 + 1;
			const usedCount = await this.getUsedBillNo() || 0;

			console.log('usedCount', usedCount);

			return new Promise((resolve, reject) => {
				resolve({
					total: totalPossible,
					used: usedCount.length,
					available: totalPossible - usedCount.length
				})
			})
		},
		async generateUniqueCode() {
			const countInfo = await this.getAvailableCount();
			if (countInfo.available <= 0) {
				uni.showToast({
					title: this.$lang('randomCodeUsedUp'),
					icon: 'error'
				})
				return;
			}

			console.log('countInfo', countInfo);

			const usedCodes = await this.getUsedBillNo();
			console.log('usedCodes', usedCodes);

			const maxAttempts = Math.min(1000, countInfo.available);
			let attempts = 0;

			console.log('maxAttempts', maxAttempts);
			console.log('attempts', attempts);

			while (attempts < maxAttempts) {
				attempts++;
				// 生成100000到999999之间的随机整数
				const randomNum = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
				// 转换为字符串（确保是6位，不会有前导零问题，因为起始是100000）
				const code = randomNum.toString();
				console.log('code', code);
				// 检查是否为6位字符串且未被使用
				if (code.length === 6 && !usedCodes.includes(code)) {
					return code; // 返回字符串格式的随机码
				}
			}
		},
		/** 检查并申请权限 */
		async checkPermission(permission) {
			// 在Android上才需要动态申请
			// #ifdef APP-PLUS
			if (plus.os.name === 'Android') {
				const status = await new Promise((resolve) => {
					plus.android.requestPermissions(permission, (e) => {
						resolve(e);
					}, (e) => {
						resolve(e);
					});
				});
				if (status.deniedAlways && status.deniedAlways.length > 0) {
					uni.showModal({
						title: this.$lang('permissionRequest'),
						content: this.$lang('permissionDenied'),
						success: (res) => {
							if (res.confirm) {
								plus.runtime.openURL(plus.android.getPackageName());
							}
						}
					});
					return false;
				}
			}
			// #endif
			return true;
		},
		// 新增方法：将图片复制到应用私有目录
		copyImageToPrivateDirectory(tempFilePath) {
			return new Promise((resolve, reject) => {
				// #ifdef APP-PLUS
				plus.io.resolveLocalFileSystemURL(tempFilePath, (entry) => {
					// 获取应用私有目录
					const targetDirectory = `_doc/images/`;

					// 创建目标目录（如果不存在）
					plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
						fs.root.getDirectory('images', { create: true }, (dirEntry) => {
							// 生成目标文件名
							const fileName = `${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}.png`;
							const targetPath = targetDirectory + fileName;

							// 复制文件
							entry.copyTo(dirEntry, fileName, (copyEntry) => {
								console.log("文件复制成功: " + copyEntry.fullPath);
								resolve(copyEntry.fullPath);
							}, (error) => {
								console.error("文件复制失败:", error);
								// 如果复制失败，仍然使用原始路径
								resolve(tempFilePath);
							});
						}, (error) => {
							console.error("创建目录失败:", error);
							resolve(tempFilePath);
						});
					}, (error) => {
						console.error("获取文件系统失败:", error);
						resolve(tempFilePath);
					});
				}, (error) => {
					console.error("解析源文件路径失败:", error);
					resolve(tempFilePath);
				});
				// #endif

				// 非App环境直接使用原路径
				// #ifndef APP-PLUS
				resolve(tempFilePath);
				// #endif
			});
		},
		// 选择图片
		async chooseImage() {
			const remainCount = this.maxImageCount - this.uploadedImages.length;

			if (remainCount <= 0) {
				uni.showToast({
					title: this.$lang('maxImageReached'),
					icon: 'none'
				});
				return;
			}

			const hasPermission = this.checkPermission(['android.permission.READ_EXTERNAL_STORAGE']);
			if (!hasPermission) return;

			uni.chooseImage({
				count: remainCount, // 最多还能上传的数量
				sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机
				extension: ['png', 'jpg', 'jpeg', '.bmp'],
				success: async (res) => {
					console.log('res', res);

					if (res.tempFiles && res.tempFiles.length > 0) {

						// 使用 Promise.all 等待所有转换完成
						const promises = res.tempFiles.map(async (file, index) => {
							const fullPath = file.path;
							const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);
							file.name = fileName;

							console.log(`开始转换base64图片${index + 1}`)
							try {
								const base64 = await pathToBase64(file.path);
								console.log(`转换base64图片${index + 1}成功`)
								return { path: base64, imgName: fileName };
							} catch (error) {
								console.error(`转换base64图片${index + 1}失败:`, error);
								return null;
							}
						});

						// 等待所有转换完成
						const images = await Promise.all(promises);

						// 过滤掉转换失败的图片并添加到列表
						const validImages = images.filter(img => img !== null);
						this.uploadedImages.push(...validImages);
					}

					// 更新图片数量显示
					this.dataForm.imageCount = `${this.uploadedImages.length}/${this.maxImageCount}`;

					// console.log('this.newImages', this.newImages)
					console.log('this.uploadedImages', this.uploadedImages)
				},
				fail: (err) => {
					console.error('选择图片失败:', err);
				}
			});
		},
		// 删除图片
		deleteImage(index) {
			uni.showModal({
				title: this.$lang('tip'),
				content: this.$lang('confirmDeleteImage'),
				success: (res) => {
					if (res.confirm) {
						this.uploadedImages.splice(index, 1);
						// 更新图片数量显示
						this.dataForm.imageCount = `${this.uploadedImages.length}/${this.maxImageCount}`;
					}
				}
			});
		},
		async handleClick(type) {
			switch (type) {
				case 'cancel':
					this.cancelFunc();
					break;
				case 'save':
					this.saveFunc();
					break;
				case 'discern':
					console.log('开始识别');
					await this.discernFunc();
					console.log('识别完成');
					break;
			}
		},
		cancelFunc() {
			uni.navigateBack({
				delta: 1
			})
		},
		saveFunc() {
			let record = {
				id: Date.now(),
				billNo: this.dataForm.billNo,
				imageCount: this.dataForm.imageCount,
				remark: this.dataForm.remark,
				createTime: Date.now(),
			}
			if (this.dataForm.id) {
				// if (this.uploadedImages.length > 0) {
				// 	this.dataForm.status = "识别中"
				// }
				// else {
				// 	this.dataForm.status = "待选图"
				// }
				this.dataForm.status = STATUS.PENDING

				UpdateReportList(this.dataForm);
				DeleteReportSource(this.dataForm.id)

				this.uploadedImages.forEach((image, index) => {
					// 生成001~100的3位顺序码
					const sequenceCode = (index + 1).toString().padStart(3, '0'); // 生成001, 002, ..., 100格式
					console.log('sequenceCode', sequenceCode)

					let childRecord = {
						id: Date.now(),
						info_id: this.dataForm.id,
						img_billNo: record.billNo + '_' + sequenceCode,
						img_name: image.imgName,
						img: image.path,
						reportRes: ''
					}
					console.log('childRecord', childRecord);
					InsertReportSource(childRecord);
				});
			} else {
				// if (this.uploadedImages.length > 0) {
				// 	record.status = "识别中"
				// } else {
				// 	record.status = "待选图"
				// }
				record.status = STATUS.PENDING

				InsertReportList(record);

				this.uploadedImages.forEach((image, index) => {
					// 生成001~100的3位顺序码
					const sequenceCode = (index + 1).toString().padStart(3, '0'); // 生成001, 002, ..., 100格式
					console.log('sequenceCode', sequenceCode)

					let childRecord = {
						id: Date.now(),
						info_id: record.id,
						img_billNo: record.billNo + '_' + sequenceCode,
						img_name: image.imgName,
						img: image.path,
						reportRes: ''
					}
					console.log('childRecord', childRecord);
					InsertReportSource(childRecord);
				});
			}

			console.log('record', record);
			console.log('this.dataForm', this.dataForm);

			uni.navigateBack({ delta: 1 })
		},
		async discernFunc() {
			const apiUrl = config.ocrApiUrl;
			if (this.uploadedImages.length === 0) {
				uni.showToast({
					title: this.$lang('pleaseSelectImage'),
					icon: 'none'
				});
				return;
			}

			this.isDisabled = true;
			uni.showLoading({
				title: this.$lang('identifying')
			})
			try {
				let record = {
					id: this.dataForm.id || Date.now(),
					billNo: this.dataForm.billNo,
					imageCount: this.dataForm.imageCount,
					remark: this.dataForm.remark,
					createTime: this.dataForm.createTime || Date.now(),
					status: STATUS.RECOGNIZING,
				}
				console.log('开始插入数据...', record);
				if (this.dataForm.id) {
					this.dataForm.imageCount = this.dataForm.imageCount
					this.dataForm.remark = this.dataForm.remark
					UpdateReportList(this.dataForm);
				}
				else {
					const result1 = InsertReportList(record);
					if (result1) {
						console.log('主表数据插入成功...');
					} else {
						console.log('主表数据插入失败...');
					}
				}

				if (this.dataForm.id) {
					DeleteReportSource(this.dataForm.id)
				}

				for (let i = 0; i < this.uploadedImages.length; i++) {
					let img = this.uploadedImages[i];
					console.log('开始上传图片...', img);

					// 生成001~100的3位顺序码
					const sequenceCode = (i + 1).toString().padStart(3, '0'); // 生成001, 002, ..., 100格式
					console.log('sequenceCode', sequenceCode)

					// 将base64转换为文件路径
					// let filePath = img.path;
					let filePath = await base64ToPath(img.path);
					console.log('filePath', filePath);

					const uploadRes = await uni.uploadFile({
						url: apiUrl,
						filePath: filePath,
						name: 'image',
					});

					if (uploadRes.statusCode === 200) {
						console.log('上传结果:', uploadRes.data)
						let response = JSON.parse(uploadRes.data)
						if (response.code === 200) {
							let orcResData = response.data
							if (orcResData.code !== 0) {
								const error = new Error(orcResData.message || 'OCR识别失败');
								error.code = orcResData.code;
								throw error;
							}
							let ocrResData = JSON.parse(orcResData.data)
							let childRecord = {
								id: Date.now(),
								info_id: record.id,
								img_billNo: (record.billNo + '_' + sequenceCode).replace(/'/g, "''"), // 转义单引号
								img_name: (img.imgName || '').replace(/'/g, "''"),
								img: (img.path || '').replace(/'/g, "''"),
								reportRes: (ocrResData.document.find(item => item.name === 'markdown')?.value || '').replace(/'/g, "''")
							}
							const result2 = InsertReportSource(childRecord);
							if (result2) {
								console.log('源数据插入成功...');
							} else {
								console.log('源数据插入失败...');
							}
						} else {
							const error = new Error(response.msg || '请求失败');
							error.code = response.code;
							throw error;
						}
					} else {
						throw new Error(`请求失败，状态码: ${uploadRes.statusCode}`);
					}
				}
				// 所有图片识别完成后，更新状态为"识别完成"
				if (this.dataForm.id) {
					this.dataForm.status = STATUS.COMPLETED;
					await UpdateReportList(this.dataForm);
				} else {
					record.status = STATUS.COMPLETED;
					await UpdateReportList(record);
				}
				uni.hideLoading();
				console.log('识别完成');
				uni.navigateBack({
					delta: 1
				});
			} catch (error) {
				this.isDisabled = false;
				if (error.errMsg && error.errMsg.includes("fail")) {
					throw new Error("网络请求失败，请检查网络连接");
				}
				throw error;
			}
		},
		async base64ToFile(base64Data, filename) {
			return new Promise((resolve, reject) => {
				// #ifdef APP-PLUS
				// App环境下使用plus.io API
				try {
					// 移除base64数据URI前缀
					const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, '');

					// 获取应用私有目录
					const targetDirectory = `_doc/temp/`;
					const targetPath = targetDirectory + filename;

					// 创建目标目录（如果不存在）
					plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
						fs.root.getDirectory('temp', { create: true }, (dirEntry) => {
							// 写入base64数据到文件
							dirEntry.getFile(filename, { create: true }, (fileEntry) => {
								fileEntry.createWriter((writer) => {
									writer.onwrite = () => {
										console.log("文件写入成功: " + fileEntry.fullPath);
										resolve(fileEntry.fullPath);
									};

									writer.onerror = (e) => {
										console.error("文件写入失败:", e);
										// 写入失败时，直接使用base64
										resolve(base64Data);
									};

									// 将base64转换为Blob并写入
									const byteCharacters = atob(base64WithoutPrefix);
									const byteArrays = [];
									for (let offset = 0; offset < byteCharacters.length; offset += 512) {
										const slice = byteCharacters.slice(offset, offset + 512);
										const byteNumbers = new Array(slice.length);
										for (let i = 0; i < slice.length; i++) {
											byteNumbers[i] = slice.charCodeAt(i);
										}
										const byteArray = new Uint8Array(byteNumbers);
										byteArrays.push(byteArray);
									}
									const blob = new Blob(byteArrays, { type: 'image/png' });
									writer.write(blob);
								}, (e) => {
									console.error("创建文件写入器失败:", e);
									resolve(base64Data);
								});
							}, (e) => {
								console.error("创建文件失败:", e);
								resolve(base64Data);
							});
						}, (e) => {
							console.error("创建目录失败:", e);
							resolve(base64Data);
						});
					}, (e) => {
						console.error("获取文件系统失败:", e);
						resolve(base64Data);
					});
				} catch (e) {
					console.error("App环境下文件操作异常:", e);
					resolve(base64Data);
				}
				// #endif
			});
		},
	}
}
</script>

<style>
page {
	background-color: #f0f2f6;
}

.add_page {
	padding: 2%;
}

.btn-box {
	display: flex;
	flex-direction: row;
	margin-top: 5%;
}

/* 图片上传区域样式 */
.upload-section {
	background-color: #fff;
	border-radius: 10rpx;
	padding: 20rpx;
	margin-top: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	color: #333;
}

.image-list {
	display: flex;
	flex-wrap: wrap;
}

.image-item {
	width: 200rpx;
	height: 200rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;
	position: relative;
	border-radius: 10rpx;
	overflow: hidden;
}

.image-item:nth-child(4n) {
	margin-right: 0;
}

.uploaded-image {
	width: 100%;
	height: 100%;
}

.image-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: flex-start;
	justify-content: flex-end;
	opacity: 0;
	transition: opacity 0.3s;
}

.image-item:hover .image-mask,
.image-mask:active {
	opacity: 1;
}

.image-index {
	position: absolute;
	left: 10rpx;
	top: 10rpx;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.6);
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
}

.delete-btn {
	color: #fff;
	background-color: rgba(255, 0, 0, 0.7);
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: bold;
	margin: 10rpx;
	cursor: pointer;
}

.add-image-btn {
	border: 2rpx dashed #ccc;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #999;
}

.add-icon {
	font-size: 60rpx;
	font-weight: bold;
}

.image-count-tip {
	text-align: center;
	color: #666;
	font-size: 28rpx;
	margin-top: 10rpx;
}

.status-display {
	padding: 12px 15px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	background-color: #f5f7fa;
	color: #606266;
	font-size: 14px;
	min-height: 40px;
	display: flex;
	align-items: center;
}
</style>