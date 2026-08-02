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
				<uni-easyinput v-model="dataForm.status" :disabled="true" />
			</uni-forms-item>
		</uni-forms>
		<view class="upload-section">
			<view class="section-title">{{ $lang('imageUpload') }}</view>
			<view class="image-list">
				<view v-for="(image, index) in uploadedImages" :key="index" class="image-item">
					<image :src="image.path" mode="aspectFill" class="uploaded-image" />
					<view class="image-mask">
						<text class="image-index">{{ index + 1 }}</text>
						<view class="delete-btn" @click="deleteImage(index)">×</view>
					</view>
				</view>
				<view v-if="uploadedImages.length < maxImageCount" class="image-item add-image-btn" @click="chooseImage">
					<view class="add-icon">+</view>
					<text>{{ $lang('addImage') }}</text>
				</view>
			</view>
		</view>
		<view class="btn-box" v-if="dataForm.status === 'Pending Selection'">
			<button type="warn" @click="handleClick('cancel')" :disabled="isDisabled">{{ $lang('cancel') }}</button>
			<button type="default" @click="handleClick('save')" :disabled="isDisabled">{{ $lang('saveTemp') }}</button>
			<button type="primary" @click="handleClick('discern')" :disabled="isDisabled">{{ $lang('startDiscern') }}</button>
		</view>
	</view>
</template>

<script>
import { InsertReportList, UpdateReportList, InsertReportSource, DeleteReportSource } from '@/db/action.js'
import DB from '@/db/sqlite.js'
import { pathToBase64, base64ToPath } from 'image-tools'

export default {
	data() {
		return {
			maxImageCount: 100,
			isDisabled: false,
			dataForm: { id: '', billNo: '', imageCount: 0, remark: '', createTime: '', status: 'Pending Selection' },
			uploadedImages: [],
		}
	},
	watch: {
		uploadedImages: {
			handler(newVal) {
				this.dataForm.imageCount = `${newVal.length}/${this.maxImageCount}`;
			},
			deep: true
		}
	},
	onLoad(options) {
		uni.setNavigationBarTitle({ title: this.$lang('navAddRecord') });
		const id = options.id;
		if (id) this.getReportDetail(id);
	},
	async created() {
		this.dataForm.billNo = await this.generateUniqueCode();
	},
	methods: {
		async getReportDetail(id) {
			const result = await DB.selectTableData('report_record_new', `where id=${id}`);
			const childRecord = await DB.selectTableData('report_record_img', `where info_id='${id}'`);
			const data = result[0];
			if (data) {
				this.dataForm = { id: data.id, billNo: data.billNo, imageCount: data.imageCount, remark: data.remark, status: data.status || 'Pending Selection' };
			}
			if (childRecord) {
				this.uploadedImages = childRecord.map(item => ({ path: item.img, imgName: item.img_name }));
			}
		},
		async generateUniqueCode() {
			const usedCodes = await DB.selectTableData('report_record_new');
			const usedArray = usedCodes.map(item => item.billNo);
			const maxAttempts = 1000;
			let attempts = 0;
			while (attempts < maxAttempts) {
				attempts++;
				const randomNum = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
				const code = randomNum.toString();
				if (code.length === 6 && !usedArray.includes(code)) return code;
			}
		},
		async chooseImage() {
			const remainCount = this.maxImageCount - this.uploadedImages.length;
			if (remainCount <= 0) {
				uni.showToast({ title: this.$lang('maxImageReached'), icon: 'none' });
				return;
			}
			uni.chooseImage({
				count: remainCount,
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					const promises = res.tempFiles.map(async (file) => {
						const base64 = await pathToBase64(file.path);
						return { path: base64, imgName: file.path.substring(file.path.lastIndexOf('/') + 1) };
					});
					const images = await Promise.all(promises);
					this.uploadedImages.push(...images.filter(img => img !== null));
				}
			});
		},
		deleteImage(index) {
			uni.showModal({
				title: this.$lang('tip'),
				content: this.$lang('confirmDeleteImage'),
				success: (res) => {
					if (res.confirm) {
						this.uploadedImages.splice(index, 1);
						this.dataForm.imageCount = `${this.uploadedImages.length}/${this.maxImageCount}`;
					}
				}
			});
		},
		async handleClick(type) {
			switch (type) {
				case 'cancel': uni.navigateBack({ delta: 1 }); break;
				case 'save': this.saveFunc(); break;
				case 'discern': await this.discernFunc(); break;
			}
		},
		saveFunc() {
			let record = { id: Date.now(), billNo: this.dataForm.billNo, imageCount: this.dataForm.imageCount, remark: this.dataForm.remark, createTime: Date.now(), status: "Pending Selection" };
			if (this.dataForm.id) {
				UpdateReportList(this.dataForm);
				DeleteReportSource(this.dataForm.id);
			} else {
				InsertReportList(record);
			}
			this.uploadedImages.forEach((image, index) => {
				const sequenceCode = (index + 1).toString().padStart(3, '0');
				InsertReportSource({ id: Date.now(), info_id: this.dataForm.id || record.id, img_billNo: record.billNo + '_' + sequenceCode, img_name: image.imgName, img: image.path, reportRes: '' });
			});
			uni.navigateBack({ delta: 1 });
		},
		async discernFunc() {
			const apiUrl = 'http://1.14.105.147:8011/api/SubDev/XfyunOcrService/xfyun';
			if (this.uploadedImages.length === 0) {
				uni.showToast({ title: this.$lang('pleaseSelectImage'), icon: 'none' });
				return;
			}
			this.isDisabled = true;
			uni.showLoading({ title: this.$lang('identifying') });
			try {
				let record = { id: this.dataForm.id || Date.now(), billNo: this.dataForm.billNo, imageCount: this.dataForm.imageCount, remark: this.dataForm.remark, createTime: this.dataForm.createTime || Date.now(), status: 'Recognizing' };
				if (this.dataForm.id) UpdateReportList(this.dataForm);
				else InsertReportList(record);
				if (this.dataForm.id) DeleteReportSource(this.dataForm.id);
				
				for (let i = 0; i < this.uploadedImages.length; i++) {
					let img = this.uploadedImages[i];
					const sequenceCode = (i + 1).toString().padStart(3, '0');
					let filePath = await base64ToPath(img.path);
					const uploadRes = await uni.uploadFile({ url: apiUrl, filePath: filePath, name: 'image' });
					if (uploadRes.statusCode === 200) {
						let response = JSON.parse(uploadRes.data);
						if (response.code === 200) {
							let ocrResData = JSON.parse(response.data);
							let childRecord = { id: Date.now(), info_id: record.id, img_billNo: (record.billNo + '_' + sequenceCode).replace(/'/g, "''"), img_name: (img.imgName || '').replace(/'/g, "''"), img: (img.path || '').replace(/'/g, "''"), reportRes: (ocrResData.document.find(item => item.name === 'markdown')?.value || '').replace(/'/g, "''") };
							InsertReportSource(childRecord);
						}
					}
				}
				record.status = 'Completed';
				await UpdateReportList(record);
				uni.hideLoading();
				uni.navigateBack({ delta: 1 });
			} catch (error) {
				this.isDisabled = false;
				throw error;
			}
		},
	}
}
</script>
