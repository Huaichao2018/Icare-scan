<template>
	<view>
		<scroll-view scroll-y class="list-view" enable-flex>
			<uni-swipe-action ref="swipeAction" v-if="list.length > 0">
				<uni-swipe-action-item class="list-item" v-for="(item, index) in list" :right-options="options"
					:key="item.id" @change="swipeChange($event, index)" @click="swipeClick(item, index)">
					<view @click="navigateToView(item.id)">
						<view class="item-row">
							<view class="item-row--label">{{ $lang('billNo') }}:</view>
							<view class="item-row--value">{{ item.billNo }}</view>
						</view>
						<view class="item-row">
							<view class="item-row--label">{{ $lang('imageCount') }}:</view>
							<view class="item-row--value">{{ item.imageCount }}</view>
						</view>
						<view class="item-row">
							<view class="item-row--label">{{ $lang('remark') }}:</view>
							<view class="item-row--value">{{ item.remark }}</view>
						</view>
						<view class="item-row">
							<view class="item-row--label">{{ $lang('date') }}:</view>
							<view class="item-row--value">{{ formatDate(item.createTime) }}</view>
						</view>
						<view class="item-row">
							<view class="item-row--label">{{ $lang('status') }}:</view>
							<view class="item-row--value">{{ statusText(item.status) }}</view>
						</view>
					</view>
					<view class="item-btn" v-if="item.status === '识别完成'">
						<button type="primary" size="mini" @click="exportToExcel(item)">{{ $lang('exportText') }}</button>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
			<!-- 无数据时显示提示 -->
			<view v-if="list.length === 0" class="no-data">
				{{ $lang('noData') }}
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { GetReporArrayList } from '@/db/action.js'
import DB from '@/db/sqlite.js'

export default {
	data() {
		return {
			page: 1,
			list: [],
			options: [
				{
					text: '',
					style: {
						backgroundColor: '#dd524d'
					}
				}
			],
		}
	},
	/**
	 * 点击新增
	 */
	onNavigationBarButtonTap() {
		uni.navigateTo({
			url: '/pages/plugins/addPage'
		})
	},
	onShow() {
		uni.setNavigationBarTitle({ title: this.$lang('navScan') });
		this.options[0].text = this.$lang('delete');
		this.init();
	},
	methods: {
		init() {
			const params = {
				page: this.page,
				size: 15
			}
			GetReporArrayList(params).then(res => {
				this.list = res
			}).catch((err) => {
				console.log('GetReporArrayList ERR:', err);
			})
		},
		swipeClick(e, index) {
			console.log('点击：', e);
			uni.showModal({
				title: this.$lang('tip'),
				content: this.$lang('isDelete'),
				success: res => {
					if (res.confirm) {
						DB.deleteTableData('report_record_new', `where id='${e.id}'`)
						DB.deleteTableData('report_record_img', `where info_id='${e.id}'`)
						uni.showToast({
							title: this.$lang('operating'),
							icon: 'loading',
							duration: 2000
						});
						this.list = [];
						this.init();
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
		},
		async exportToExcel(item) {
			let str = "<tr>";

			let sourceData = await DB.selectTableData('report_record_img', `where info_id='${item.id}'`)
			const tableHeadersOrigin = await DB.selectTableData('report_inspection_items');
			const tableHeaders = tableHeadersOrigin.map(item => {
				return item.inspection_name;
			});

			for (let i = 0; i < tableHeaders.length; i++) {
				str += "<th>" + tableHeaders[i].trim() + "</th>";
			}
			str += "</tr>";
			console.log("sourceData", sourceData)
			console.log("sourceData", sourceData.length)
			try {
				let allRow = [];
				let row = [];

				// 所有数据
				for (let i = 0; i < sourceData.length; i++) {
					let parsedData = this.parseMarkdownReport(sourceData[i].reportRes);
					let reportData = parsedData;

					// 每个报告数据
					for (let j = 0; j < reportData.table.items.length; j++) {
						let rowData = reportData.table.items[j];
						const keys = Object.getOwnPropertyNames(rowData);

						console.log('rowData', rowData);

						Object.getOwnPropertyNames(rowData).forEach((r, index) => {
							tableHeaders.forEach(t => {
								const header = t;

								if (rowData[r].trim() === header) {
									console.log("匹配正确")
									let hasKey = {
										mainKey: rowData[r].trim(),
										key: '',
										index: 0
									}

									keys.some((key, index) => {
										const trimmedKey = key.trim().replace(/\s+/g, '');
										if (trimmedKey === '检验结果' ||
											trimmedKey === '检测结果' ||
											trimmedKey === '结果') {
											hasKey.key = key;
											hasKey.index = index;
											console.log('[hasKey]:', hasKey)
											return true; // 正确返回true表示找到了匹配项
										}
									});
									const existingItem = row.find(item => item.key === hasKey.mainKey);
									if (existingItem) {
										existingItem.value = rowData[hasKey.key];
									} else {
										row.push({ key: hasKey.mainKey, value: rowData[hasKey.key] })
									}
									return;
								} else {
									const exists = row.some(item => item.key === header);
									if (!exists) {
										row.push({ key: header, value: '' });
										return;
									}
								}
							})
						})
					}
					allRow.push(row)
					row = []; //row置空
				}

				for (let k = 0; k < allRow.length; k++) {
					str += "<tr>";
					for (let l = 0; l < allRow[k].length; l++) {
						str += `<td>${(allRow[k][l].value || '').trim()}</td>`
					}
					str += "</tr>";
				}

				console.log("str", str)

				const fileName = `${'报告' + item.billNo}_${new Date().getTime()}.xlsx`;

				//下载的表格模板数据
				let template = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                                xmlns:x="urn:schemas-microsoft-com:office:excel"
                                xmlns="http://www.w3.org/TR/REC-html40">
                                <head><!--[if gte mso 9]><xml encoding="UTF-8"><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                                <x:Name>${'报告' + item.billNo}_${new Date().getTime()}</x:Name>
                                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
                                </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                                </head><body><table>${str}</table></body></html>`

				// 保存文件
				const file = this.saveExcelFile(template, fileName);
				uni.showToast({ title: this.$lang('exportSuccess'), icon: 'success' });

				// 导出成功后打开文件所在目录
				this.openFileDirectory(file);
				console.log('执行完成')
			}
			catch (e) {
				console.log('ERR:', e);
			}
		},
		parseMarkdownReport(markdownText) {
			const lines = markdownText.split('\n');
			let hospital = '';
			let title = '';
			const patient = {};
			const items = [];
			const signatures = [];

			let inTable = false;
			let tableHeaders = [];
			let foundTable = false;

			for (let line of lines) {
				//line = line.trim();
				// 跳过空行
				if (!line) continue;
				// 提取医院和标题
				if (line.startsWith('# ')) {
					const titleLine = line.substring(2).trim();
					// 尝试分离医院和标题
					const parts = titleLine.split('检验报告单');
					if (parts.length > 1) {
						hospital = parts[0].trim();
						title = '检验报告单';
					} else {
						hospital = titleLine;
						title = '医学检验报告';
					}
					continue;
				}
				// 提取患者信息
				if (line.includes('：')) {
					const parts = line.split('：');
					if (parts.length >= 2) {
						//const key = parts[0].trim();
						const key = parts[0].replace(/\s+/g, '');
						let value = parts.slice(1).join('：').trim();
						// 清理值中的markdown格式
						value = value.replace(/\*\*/g, '');
						if (key && value) {
							patient[key] = value;
						} else {
							patient[key] = "";
						}
					}
					continue;
				}
				// 处理表格
				if (line.startsWith('|') && line.endsWith('|') && !foundTable) {
					// 找到第一个表格
					foundTable = true;
					inTable = true;
					// 提取表头
					// tableHeaders = line.split('|')
					//   .map(cell => cell.trim())
					//   .filter(cell => cell !== '');
					const heartLast = line.split('|');
					tableHeaders = heartLast.slice(1, heartLast.length - 1)
					continue;
				}
				if (inTable) {
					// 检查是否是表格分隔线
					if (line.replace(/-/g, '').replace(/\|/g, '').trim() === '') {
						continue;
					}
					if (!line.startsWith('|')) {
						inTable = false;
						continue;
					}
					// const cells = line.split('|')
					//   .map(cell => cell.trim())
					//   .filter(cell => cell !== '');
					const cellsLast = line.split('|')
					const cells = cellsLast.slice(1, cellsLast.length - 1)
					if (cells.length >= tableHeaders.length) {
						const item = {};
						for (let i = 0; i <= tableHeaders.length; i++) {
							item[tableHeaders[i]] = cells[i] || '';
						}
						items.push(item);
					} else if (cells.length > 0) {
						// 处理可能的不完整行
						const item = {};
						for (let i = 0; i < cells.length; i++) {
							if (i < tableHeaders.length) {
								item[tableHeaders[i]] = cells[i];
							}
						}
						items.push(item);
					}
				}
				// 提取签名信息
				if (line.includes('检验者') || line.includes('审核者') || line.includes('报告者')) {
					const parts = line.split('：');
					if (parts.length >= 2) {
						const role = parts[0].trim();
						const name = parts[1].trim();
						signatures.push({
							role,
							name
						});
					}
				}
				// 提取日期信息
				if (line.includes('日期') && !patient.date) {
					const parts = line.split('：');
					if (parts.length >= 2) {
						patient.date = parts[1].trim();
					}
				}
			}
			return {
				hospital: hospital || 'OCR医院报告识别',
				title: title || '检验报告单',
				patient,
				table: {
					headers: tableHeaders,
					items
				},
				signatures
			};
		},
		saveExcelFile(fileData, fileName) {
			return new Promise((resolve, reject) => {
				// 获取应用私有文档目录
				plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, (fs) => {
					let rootObj = fs.root
					let fullPath = rootObj.fullPath
					fs.root.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
						fileEntry.createWriter((writer) => {
							writer.onwritestart = (e) => {
								uni.showToast({
									title: this.$lang('exporting'),
									icon: 'none'
								});
							}
							writer.onwrite = (e) => {
								uni.hideToast();
								setTimeout(() => {
									uni.showToast({
										title: this.$lang('exportSuccess') + ': ' + fileEntry.fullPath,
										icon: 'success',
										duration: 3000
									});
									console.log(this.$lang('exportSuccess') + ': ' + fileEntry.fullPath)
									resolve(fileEntry.fullPath);
								}, 500);
							};

							writer.onerror = (e) => {
								uni.showToast({
									title: this.$lang('fileSaveFailed'),
									icon: 'none',
									duration: 3000
								});
								reject(new Error(this.$lang('fileSaveFailed')));
							};
							// 写入内容
							writer.write(fileData)
						});
					}, (error) => {
						uni.showToast({
							title: this.$lang('fileCreateFailed'),
							icon: 'none',
							duration: 3000
						});
						reject(error);

					});
				}, (error) => {
					uni.showToast({
						title: this.$lang('fileSystemFailed'),
						icon: 'none',
						duration: 3000
					});
					reject(error);
				});
			})
		},
		saveExcelFile2(fileData, fileName) {
			const self = this;
			// 尝试获取外部存储根目录
			plus.android.requestPermissions(['android.permission.WRITE_EXTERNAL_STORAGE'],
				function (result) {
					if (result.granted) {
						// 权限获取成功
						try {
							var Context = plus.android.importClass("android.content.Context");
							var main = plus.android.runtimeMainActivity();
							var externalStorage = main.getExternalFilesDir(null);
							var externalRoot = externalStorage.getAbsolutePath().split("/Android")[0];

							// 构建公共下载目录路径
							var downloadDir = externalRoot + "/Download/";

							plus.io.resolveLocalFileSystemURL(downloadDir, function (entry) {
								entry.getFile(fileName, { create: true }, function (fileEntry) {
									fileEntry.createWriter(function (writer) {
										writer.onwritestart = function () {
											uni.showToast({ title: self.$lang('exporting'), icon: 'none' });
										};

										writer.onwrite = function () {
											uni.hideToast();
											uni.showToast({
												title: self.$lang('exportSuccess'),
												icon: 'success',
												duration: 3000
											});
											console.log(`文件已保存至: ${fileEntry.fullPath}`);
										};

										writer.onerror = function () {
											uni.showToast({
												title: self.$lang('fileSaveFailed'),
												icon: 'none',
												duration: 3000
											});
										};

										writer.write(fileData);
									});
								}, function (error) {
									uni.showToast({
										title: self.$lang('fileCreateFailed'),
										icon: 'none',
										duration: 3000
									});
								});
							}, function (error) {
								uni.showToast({
									title: self.$lang('downloadDirNotAccess'),
									icon: 'none',
									duration: 3000
								});
							});
						} catch (e) {
							console.error("保存文件出错:", e);
							uni.showToast({
								title: self.$lang('saveFailed') + ': ' + e.message,
								icon: 'none',
								duration: 3000
							});
						}
					} else {
						uni.showToast({
							title: self.$lang('noStoragePermission'),
							icon: 'none',
							duration: 3000
						});
					}
				},
				function (error) {
					uni.showToast({
						title: self.$lang('permissionRequestFailed'),
						icon: 'none',
						duration: 3000
					});
				}
			);
		},
		navigateToView(id) {
			uni.navigateTo({
				url: `/pages/plugins/addPage?id=${id}`
			})
		},
		// 添加日期格式化方法
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}
	}
}
</script>

<style>
page {
	background-color: #f0f2f6;
}

.list-view {
	padding: 2%;
}

.list-item {
	margin: 2% 2% 4% 2%;
	background-color: #FFFFFF;
	border-radius: 10px;
	padding: 2%;
}

.item-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 2% 0 2% 0;
}

.item-row--label {
	width: 20%;
	text-align: justify;
}

.item-row--value {
	flex: 1;
	margin-left: 4%;
}

.item-btn {
	position: absolute;
	right: 5%;
	bottom: 5%;
	z-index: 9999;
}

.no-data {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
	font-size: 28rpx;
}
</style>