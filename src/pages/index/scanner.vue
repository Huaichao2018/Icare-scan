<template>
	<view>
		<mescroll-body ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :sticky="true"
			:down="downOption" :up="upOption" :bottombar="false">
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
						<button type="primary" size="mini" @click="selectExportType(item)">{{ $lang('exportText') }}</button>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
			<!-- 无数据时显示提示 -->
			<view v-if="list.length === 0" class="no-data">
				{{ $lang('noData') }}
			</view>
		</mescroll-body>

		<!-- 固定位置的添加按钮 -->
		<view class="top-button" :class="{ hide: !showTopButton }" @click="onButtonTopTap">
			<uni-icons type="arrow-up" class="top-icon" size="30" color="#FFFFFF"></uni-icons>
		</view>

		<view class="add-button" @click="navigateToAddPage">
			<text class="add-icon">+</text>
		</view>
	</view>
</template>

<script>
import {
	GetReporArrayList
} from '@/db/action.js'
import DB from '@/db/sqlite.js'
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";

export default {
	mixins: [MescrollMixin],
	data() {
		return {
			downOption: {
				use: true,
				auto: true
			},
			upOption: {
				page: {
					num: 0,
					size: 5,
					time: null
				},
				empty: {
					use: true,
					icon: '/static/nodata.png',
					tip: "",
					fixed: true,
					top: "300rpx",
				},
				textNoMore: '',
			},
			page: 1,
			pageSize: 5,
			scrollTop: 0,
			oldScrollTop: 0,
			scrollHeight: 0,
			loading: false,
			noMoreData: false,
			reset: false,
			isRefresher: false,
			showTopButton: false,
			list: [],
			scrollTimer: null, // 防抖定时器
			options: [{
				text: '',
				style: {
					backgroundColor: '#dd524d'
				}
			}],
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
	async onShow() {
		uni.setNavigationBarTitle({ title: this.$lang('navRecords') });
		// await this.init();
		this.scrollHeight = uni.getSystemInfoSync().windowHeight;
		console.log('uni.getSystemInfoSync().windowHeight', uni.getSystemInfoSync().windowHeight)
		console.log('uni.getSystemInfoSync().screenHeight', uni.getSystemInfoSync().screenHeight)

		// 更新多语言动态文本
		this.upOption.empty.tip = this.$lang('noData');
		this.upOption.textNoMore = this.$lang('noMoreData');
		this.options[0].text = this.$lang('delete');

		// 添加刷新逻辑
		if (this.mescroll) {
			this.mescroll.resetUpScroll(); // 重新加载数据
		}
	},
	methods: {
		onButtonTopTap() {
			// 平滑滚动到顶部
			this.scrollTop = 0;
			// 强制刷新以触发滚动
			this.$nextTick(() => {
				this.scrollTop = 0;
			});
			console.log('置顶了');
		},
		navigateToAddPage() {
			uni.navigateTo({
				url: '/pages/plugins/addPage'
			})
		},
		navigateToView(id) {
			uni.navigateTo({
				url: `/pages/plugins/addPage?id=${id}`
			})
		},
		onPullDownRefresh() {
			console.log('refresh');
			uni.startPullDownRefresh();
			this.resetToFirstPage()
		},
		async upCallback(page) {
			let query = {
				currentPage: page.num,
				pageSize: page.size,
				keyword: this.keyword,
				type: ''
			}

			try {
				const res = await GetReporArrayList(query);

				console.log('res', res);

				if (page.num == 1) this.list = [];
				const list = res;
				this.list = this.list.concat(list);
				this.mescroll.endSuccess(list.length);

				// 加载成功后隐藏提示
				uni.hideToast();
			} catch (err) {
				console.log('Err:', err);
				this.mescroll.endErr();
				uni.showToast({
					title: this.$lang('loadFailed'),
					icon: 'none'
				});
				// 加载成功后隐藏提示
				uni.hideToast();
			} finally {
				this.loading = false;
				this.reset = false;
			}
		},
		async init() {
			if (this.loading) return;

			if (this.reset) {
				this.page = 1;
				this.noMoreData = false;
				this.list = [];
			}

			if (this.noMoreData && !this.reset) return;

			this.loading = true;

			try {
				const params = {
					page: this.page,
					size: this.pageSize
				}
				const res = await GetReporArrayList(params);

				console.log('res', res);

				if (res.length < this.pageSize) {
					this.noMoreData = true;
				}

				if (this.page === 1) {
					this.list = res;
				} else {
					this.list = [...this.list, ...res];
				}
				// 加载成功后隐藏提示
				uni.hideToast();
				uni.stopPullDownRefresh();
			} catch (err) {
				console.log('Err:', err);
				uni.showToast({
					title: this.$lang('loadFailed'),
					icon: 'none'
				});
				// 加载成功后隐藏提示
				uni.hideToast();
			} finally {
				this.loading = false;
				this.reset = false;
			}
		},
		onScroll(e) {
			// 防抖处理，避免频繁触发
			if (this.scrollTimer) {
				clearTimeout(this.scrollTimer);
			}

			this.scrollTimer = setTimeout(() => {
				this.scrollTop = e.detail.scrollTop;
				const scrollHeight = e.detail.scrollHeight;
				const viewHeight = uni.getSystemInfoSync().windowHeight;

				// 控制返回顶部按钮的显示/隐藏（滚动超过200px时显示）
				this.showTopButton = this.scrollTop > 200;

				if (this.scrollTop <= 0 && this.oldScrollTop > 0) {
					this.page = 1;
					this.resetToFirstPage();
				}

				if (scrollHeight - this.scrollTop - viewHeight < 10 && !this.loading && !this.noMoreData) {
					this.loadMore();
				}

				this.oldScrollTop = this.scrollTop;

				if (this.oldScrollTop == 0) {
					this.page = 1;
					this.resetToFirstPage();
				}

				console.log('e', e);
				console.log('scrollTop', this.scrollTop);
				console.log('oldScrollTop', this.oldScrollTop);
				console.log('scrollHeight', scrollHeight)
				console.log('viewHeight', viewHeight)
			}, 100);
		},
		// 重置到第一页
		resetToFirstPage() {
			if (this.page !== 1) {
				this.page = 1;
				this.reset = true;
				this.noMoreData = false;
			}

			// 统一调用init方法
			if (this.list.length > 0) {
				this.list = [];
			}
			this.init();
		},
		loadMore() {
			if (this.loading || this.noMoreData) return;

			this.page++;
			this.reset = false;
			this.init();
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
							duration: 1500
						});
						this.init();
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
		},
		selectExportType(item) {
			uni.showActionSheet({
				itemList: [this.$lang('normalExport'), this.$lang('mergeExport')],
				success: async (res) => {
					if (res.tapIndex === 0) {
						// 普通导出
						await this.exportToExcel(item);
					} else if (res.tapIndex === 1) {
						// 合并导出
						await this.mergeExport(item);
					}
				}
			})
		},
		async exportToExcel(item) {
			let str = "<tr>";

			let sourceData = await DB.selectTableData('report_record_img', `where info_id='${item.id}'`)
			const tableHeadersOrigin = await DB.selectTableData('report_inspection_items');
			const tableHeaders = tableHeadersOrigin.map(item => {
				return item.inspection_name;
			});

			str += "<th>序号</th><th>数据来源</th>";

			for (let i = 0; i < tableHeaders.length; i++) {
				str += "<th>" + tableHeaders[i].trim() + "</th>";
			}
			str += "</tr>";
			// console.log("sourceData", sourceData)
			// console.log("sourceData", sourceData.length)
			try {
				let allRow = [];
				let resultKey = '';

				let dynamicHeaders = [...tableHeaders];

				// 所有数据
				for (let i = 0; i < sourceData.length; i++) {
					let parsedData = this.parseMarkdownReport(sourceData[i].reportRes);
					let reportData = parsedData;
					// console.log('reportData:', reportData);

					// 初始化一行数据，确保列顺序固定
					let row = new Array(dynamicHeaders.length + 2); // +2 是因为有序号和数据来源两列

					row[0] = {
						key: '序号',
						value: sourceData[i].img_billNo
					}
					row[1] = {
						key: '数据来源',
						value: sourceData[i].img_name
					}

					// 初始化检验项目列为空值
					for (let h = 0; h < dynamicHeaders.length; h++) {
						row[h + 2] = {
							key: dynamicHeaders[h],
							value: ''
						};
					}

					// 每个报告数据
					for (let j = 0; j < reportData.table.items.length; j++) {
						let rowData = reportData.table.items[j];

						// 创建一个新的对象，清理其中的值
						let cleanedRowData = {};
						Object.keys(rowData).forEach(key => {
							// 清理键和值中的多余空格和特殊字符
							const cleanedKey = key.trim().replace(/\s+/g, '');
							const rawValue = rowData[key];
							const cleanedValue = (rawValue != null ? String(rawValue) : "")
								.trim()
								.replace(/\s+/g, ' ')
								.replace(/^\\+/, '')
								.replace(/^\*+/, '')
								.replace(/^%+/, '');

							cleanedRowData[cleanedKey] = cleanedValue;
						});

						// 查找所有结果键
						const resultKeys = Object.keys(cleanedRowData).filter(colKey => {
							const trimmedKey = colKey.trim().replace(/\s+/g, '');
							return trimmedKey.includes('检验结果') ||
								trimmedKey.includes('检测结果') ||
								trimmedKey.includes('结果');
						});

						// console.log('rowData:', rowData);
						// console.log('resultKeys:', resultKeys);


						// 从多个结果键中选择值为数字且非空的列
						let resultKey = '';
						if (resultKeys.length === 1) {
							resultKey = resultKeys[0];
						} else if (resultKeys.length > 1) {
							resultKey = resultKeys.find(key => {
								const value = cleanedRowData[key] || '';
								return /^\s*-?\d+(\.\d+)?\s*$/.test(value);
							}) || resultKeys[0];
						}

						console.log('cleanedRowData[1111]:', cleanedRowData);
						console.log('cleanedRowData[2222]:', cleanedRowData[resultKey]);

						// 提取结果值中的数字部分
						const extractNumericValue = (val) => {
							if (!val) return '';
							const match = String(val).match(/-?\d+(\.\d+)?/);
							return match ? match[0] : '';
						};

						if (resultKey) {
							let matchedAnyHeader = false;

							for (let h = 0; h < dynamicHeaders.length; h++) {
								const header = dynamicHeaders[h];
								const matchingKey = Object.keys(cleanedRowData).some((key, index) => {
									const rawValue = cleanedRowData[key] || '';
									const extractedCode = this.extractEnglishCode(rawValue);
									const normalizedHeader = header.toUpperCase().replace(/\s+/g, '');

									const normalizedValue = rawValue.toUpperCase().replace(/\s+/g, '');
									const isDirectMatch = normalizedValue === normalizedHeader;

									const isExtractedMatch = extractedCode ?
										extractedCode.toUpperCase().replace(/\s+/g, '') === normalizedHeader :
										false;

									return isDirectMatch || isExtractedMatch;
								});

								if (matchingKey) {
									matchedAnyHeader = true;
									const numericValue = extractNumericValue(cleanedRowData[resultKey]);
									row[h + 2] = {
										key: header,
										value: numericValue
									};
								}
							}
							// console.log('cleanedRowData:', cleanedRowData);
							// console.log('resultKey:', resultKey);
							// console.log('matchedAnyHeader:', matchedAnyHeader);

							if (!matchedAnyHeader) {
								let itemName = '';
								Object.keys(cleanedRowData).forEach((rowKey, index) => {
									const header = rowKey.trim().replace(/\s+/g, '');
									if (header.includes('缩写') || header.includes('英文')) {
										itemName = rowKey;
										return true;
									}
								});

								let newItemName = (cleanedRowData[itemName] || '').trim();

								if (!newItemName) {
									for (const key of Object.keys(cleanedRowData)) {
										const value = cleanedRowData[key] || '';
										const extractedCode = this.extractEnglishCode(value);
										if (extractedCode) {
											newItemName = extractedCode;
											break;
										}
									}
								}

								if (newItemName && !dynamicHeaders.includes(newItemName)) {
									dynamicHeaders.push(newItemName)

									row.length = dynamicHeaders.length + 2

									for (let r = 0; r < allRow.length; r++) {
										allRow[r].push({
											key: newItemName,
											value: ''
										})
									}

									row[dynamicHeaders.length + 1] = {
										key: newItemName,
										value: cleanedRowData[resultKey]
									}
								}
							}
						}
					}
					// console.log('[row]2:', row)
					allRow.push(row)
					// row = []; //row置空
				}

				// 更新表头HTML
				str = "<tr><th>序号</th><th>数据来源</th>";
				for (let i = 0; i < dynamicHeaders.length; i++) {
					str += "<th>" + dynamicHeaders[i].trim() + "</th>";
				}
				str += "</tr>";

				// console.log("allRow", allRow)

				for (let k = 0; k < allRow.length; k++) {
					// console.log(`Row ${k}:`, allRow[k]);

					str += "<tr>";
					for (let l = 0; l < allRow[k].length; l++) {
						const cell = allRow[k][l];
						let displayValue = '';
						if (cell && cell.value != null) {
							displayValue = String(cell.value).trim();
						}
						console.log(`Cell [${k}][${l}]:`, allRow[k][l]);
						str += `<td>${displayValue}</td>`
					}
					str += "</tr>";
				}

				// console.log("str", str)

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
				const file = await this.saveExcelFile(template, fileName);
				uni.showToast({
					title: this.$lang('exportSuccess'),
					icon: 'success'
				});
				console.log('filePath', file);

				// 确保在APP环境下才调用openWithWPS
				// #ifdef APP-PLUS
				if (file) {
					try {
						// console.log("开始执行wps打开文件....");
						// await this.openWithWPS(file);
						await this.openFileDirectory(file);
						console.log('打开文件成功');
					} catch (error) {
						// console.error('打开文件失败:', error);
						uni.showToast({
							title: this.$lang('openFileFailed') + ': ' + error.message,
							icon: 'none',
							duration: 3000
						});
					}
				} else {
					console.warn('文件路径为空');
					uni.showToast({
						title: this.$lang('filePathInvalid'),
						icon: 'none',
						duration: 3000
					});
				}
				// #endif

				// #ifndef APP-PLUS
				console.log('非APP环境，无法打开文件');
				uni.showToast({
					title: this.$lang('envNotSupport'),
					icon: 'none',
					duration: 3000
				});
				// #endif

				console.log('执行完成')
			} catch (e) {
				console.log('ERR:', e);
				uni.hideLoading()
				uni.showToast({
					title: this.$lang('exportError'),
					icon: 'none',
					duration: 3000
				});
			}
		},
		async mergeExport(item) {
			uni.showLoading({
				title: this.$lang('mergingExport')
			});
			try {
				let str = "<tr>";

				let sourceData = await DB.selectTableData('report_record_img', `where info_id='${item.id}'`)
				const tableHeadersOrigin = await DB.selectTableData('report_inspection_items');
				const tableHeaders = tableHeadersOrigin.map(item => {
					return item.inspection_name;
				});

				str += "<th>序号</th><th>数据来源</th>";

				for (let i = 0; i < tableHeaders.length; i++) {
					str += "<th>" + tableHeaders[i].trim() + "</th>";
				}
				str += "</tr>";

				let allRow = [];
				let resultKey = '';

				let dynamicHeaders = [...tableHeaders];

				// 所有数据
				for (let i = 0; i < sourceData.length; i++) {
					let parsedData = this.parseMarkdownReport(sourceData[i].reportRes);
					let reportData = parsedData;

					console.log('reportData:', reportData);

					// 初始化一行数据，确保列顺序固定
					let row = new Array(dynamicHeaders.length + 2); // +2 是因为有序号和数据来源两列

					row[0] = {
						key: '序号',
						value: sourceData[i].img_billNo
					}
					row[1] = {
						key: '数据来源',
						value: sourceData[i].img_name
					}

					// 初始化检验项目列为空值
					for (let h = 0; h < dynamicHeaders.length; h++) {
						row[h + 2] = {
							key: dynamicHeaders[h],
							value: ''
						};
					}

					// 每个报告数据
					for (let j = 0; j < reportData.table.items.length; j++) {
						let rowData = reportData.table.items[j];

						// 创建一个新的对象，清理其中的值
						let cleanedRowData = {};
						Object.keys(rowData).forEach(key => {
							// 清理键和值中的多余空格和特殊字符
							const cleanedKey = key.trim().replace(/\s+/g, '');
							const rawValue = rowData[key];
							const cleanedValue = (rawValue != null ? String(rawValue) : "")
								.trim()
								.replace(/\s+/g, ' ')
								.replace(/^\\+/, '')
								.replace(/^\*+/, '')
								.replace(/^%+/, '');

							cleanedRowData[cleanedKey] = cleanedValue;
						});

						// 查找所有结果键
						const resultKeys = Object.keys(cleanedRowData).filter(colKey => {
							const trimmedKey = colKey.trim().replace(/\s+/g, '');
							return trimmedKey.includes('检验结果') ||
								trimmedKey.includes('检测结果') ||
								trimmedKey.includes('结果');
						});

						// 从多个结果键中选择值为数字且非空的列
						let resultKey = '';
						if (resultKeys.length === 1) {
							resultKey = resultKeys[0];
						} else if (resultKeys.length > 1) {
							resultKey = resultKeys.find(key => {
								const value = cleanedRowData[key] || '';
								return /^\s*-?\d+(\.\d+)?\s*$/.test(value);
							}) || resultKeys[0];
						}

						// 提取结果值中的数字部分
						const extractNumericValue = (val) => {
							if (!val) return '';
							const match = String(val).match(/-?\d+(\.\d+)?/);
							return match ? match[0] : '';
						};

						if (resultKey) {
							let matchedAnyHeader = false;

							for (let h = 0; h < dynamicHeaders.length; h++) {
								const header = dynamicHeaders[h];

								const matchingKey = Object.keys(cleanedRowData).find(key => {
									const rawValue = cleanedRowData[key] || '';
									const extractedCode = this.extractEnglishCode(rawValue);
									const normalizedHeader = header.trim().toLowerCase();

									const isDirectMatch = rawValue.trim().toLowerCase() === normalizedHeader;
									const isExtractedMatch = extractedCode ?
										extractedCode.trim().toLowerCase() === normalizedHeader :
										false;

									return isDirectMatch || isExtractedMatch;
								});

								if (matchingKey) {
									matchedAnyHeader = true;
									const numericValue = extractNumericValue(cleanedRowData[resultKey]);
									row[h + 2] = {
										key: header,
										value: numericValue
									};
								}
							}

							if (!matchedAnyHeader) {
								let itemName = '';
								Object.keys(cleanedRowData).forEach((rowKey, index) => {
									const header = rowKey.trim().replace(/\s+/g, '');
									if (header.includes('缩写') || header.includes('英文')) {
										itemName = rowKey;
										return true;
									}
								});

								let newItemName = (cleanedRowData[itemName] || '').trim();

								if (!newItemName) {
									for (const key of Object.keys(cleanedRowData)) {
										const value = cleanedRowData[key] || '';
										const extractedCode = this.extractEnglishCode(value);
										if (extractedCode) {
											newItemName = extractedCode;
											break;
										}
									}
								}

								if (newItemName && !dynamicHeaders.includes(newItemName)) {
									dynamicHeaders.push(newItemName)

									row.length = dynamicHeaders.length + 2

									for (let r = 0; r < allRow.length; r++) {
										allRow[r].push({
											key: newItemName,
											value: ''
										})
									}

									row[dynamicHeaders.length + 1] = {
										key: newItemName,
										value: cleanedRowData[resultKey]
									}
								}
							}
						}
					}
					// console.log('[row]2:', row)
					allRow.push(row)
					// row = []; //row置空
				}

				if (allRow.length > 0) {
					let averagedRow = new Array(allRow[0].length);

					averagedRow[0] = {
						key: '序号',
						value: '平均值'
					}
					averagedRow[1] = {
						key: '数据来源',
						value: '汇总'
					};

					for (let col = 2; col < allRow[0].length; col++) {
						let sum = 0;
						let count = 0;

						for (let row = 0; row < allRow.length; row++) {
							const cellValue = allRow[row][col].value;
							const numValue = parseFloat(cellValue);

							if (!isNaN(numValue)) {
								sum += numValue;
								count++;
							}
						}

						const average = count > 0 ? (sum / count).toFixed(2) : '';

						averagedRow[col] = {
							key: allRow[0][col].key,
							value: average
						}
					}

					allRow = [averagedRow];
				}

				// 更新表头HTML
				str = "<tr><th>序号</th><th>数据来源</th>";
				for (let i = 0; i < dynamicHeaders.length; i++) {
					str += "<th>" + dynamicHeaders[i].trim() + "</th>";
				}
				str += "</tr>";

				console.log("allRow", allRow)


				for (let k = 0; k < allRow.length; k++) {
					// console.log(`Row ${k}:`, allRow[k]);

					str += "<tr>";
					for (let l = 0; l < allRow[k].length; l++) {
						// console.log(`Cell [${k}][${l}]:`, allRow[k][l]);

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
				const file = await this.saveExcelFile(template, fileName);
				uni.showToast({
					title: this.$lang('exportSuccess'),
					icon: 'success'
				});
				console.log('filePath', file);

				// 确保在APP环境下才调用openWithWPS
				// #ifdef APP-PLUS
				if (file) {
					try {
						// console.log("开始执行wps打开文件....");
						// await this.openWithWPS(file);
						await this.openFileDirectory(file);
						console.log('打开文件成功');
					} catch (error) {
						// console.error('打开文件失败:', error);
						uni.showToast({
							title: this.$lang('openFileFailed') + ': ' + error.message,
							icon: 'none',
							duration: 3000
						});
					}
				} else {
					console.warn('文件路径为空');
					uni.showToast({
						title: this.$lang('filePathInvalid'),
						icon: 'none',
						duration: 3000
					});
				}
				// #endif

				// #ifndef APP-PLUS
				console.log('非APP环境，无法打开文件');
				uni.showToast({
					title: this.$lang('envNotSupport'),
					icon: 'none',
					duration: 3000
				});
				// #endif

				console.log('执行完成')
			} catch (e) { 
				console.error('导出失败:', e);
				uni.hideLoading()
				uni.showToast({
					title: this.$lang('exportError'),
					icon: 'none',
					duration: 3000
				});
			}
		},
		saveExcelFile(fileData, fileName) {
			return new Promise((resolve, reject) => {
				// 获取应用私有文档目录
				plus.io.requestFileSystem(plus.io.PUBLIC_DOWNLOADS, (fs) => {
					let rootObj = fs.root
					let fullPath = rootObj.fullPath
					fs.root.getFile(fileName, {
						create: true,
						exclusive: false
					}, (fileEntry) => {
						fileEntry.createWriter((writer) => {
							writer.onwritestart = (e) => {
								uni.showToast({
									title: this.$lang('exporting'),
									icon: 'none'
								});
							}
							writer.onwrite = (e) => {
								uni.hideToast();
								uni.showToast({
									title: `导出成功: ${fileEntry.fullPath}`,
									icon: 'success',
									duration: 3000
								});
								console.log(`导出成功: ${fileEntry.fullPath}`)
								resolve(fileEntry.fullPath);
							};

							writer.onerror = (e) => {
								uni.showToast({
									title: this.$lang('fileSaveFailed'),
									icon: 'none',
									duration: 3000
								});
								reject(new Error('文件保存失败'));
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
		openFileDirectory(filePath) {
			console.log('执行了')
			// 添加参数验证
			if (!filePath) {
				uni.showToast({
					title: this.$lang('filePathInvalid'),
					icon: 'none',
					duration: 2000
				});
				return;
			}

			uni.showModal({
				title: this.$lang('exportComplete'),
				content: this.$lang('openFileDir'),
				success: (res) => {
					if (res.confirm) {
						try {
							// #ifdef APP-PLUS
							this.openDirectoryInApp(filePath);
							// this.openWithWPS(filePath)
							console.log("执行成功打开文件方法")
							// #endif

							// #ifndef APP-PLUS
							uni.showToast({
								title: this.$lang('platformNotSupport'),
								icon: 'none',
								duration: 2000
							});
							// #endif
						} catch (e) {
							console.error('打开目录失败:', e);
							uni.showToast({
								title: this.$lang('openDirFailed') + ': ' + e.message,
								icon: 'none',
								duration: 2000
							});
						}
					}
				}
			})
		},
		openDirectoryInApp(filePath) {
			console.log('执行了打开文件方法')
			try {
				plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
					console.log('文件路径:', entry.fullPath);
					entry.getParent((parentEntry) => {
						const directoryURL = 'file://' + plus.io.convertLocalFileSystemURL(parentEntry
							.fullPath);
						console.log('打开目录:', directoryURL);
						plus.runtime.openFile(entry.fullPath);
					}, (error) => {
						console.error('获取父目录失败:', error);
						uni.showToast({
							title: this.$lang('dirInfoFailed'),
							icon: 'none',
							duration: 2000
						});
					});
				}, (error) => {
					console.error('解析文件路径失败:', error);
					uni.showToast({
						title: this.$lang('pathParseFailed'),
						icon: 'none',
						duration: 2000
					});
				});
			} catch (e) {
				console.error('打开目录失败:', e);
				uni.showToast({
					title: this.$lang('openDirFailed') + ': ' + e.message,
					icon: 'none',
					duration: 2000
				});
			}
		},
		openWithWPS(filePath) {
			return new Promise((resolve, reject) => {
				plus.runtime.isApplicationExist({
					package: 'cn.wps.moffice_eng'
				}, (exist) => {
					console.log('检查WPS是否存在:', exist);
					if (exist) {
						console.log('执行了使用WPS打开文件方法, 文件路径:', filePath);
						plus.runtime.openFile(filePath, {
							pname: 'cn.wps.moffice_eng'
						}, () => {
							console.log('WPS打开文件成功');
							resolve();
						}, (error) => {
							console.error('使用WPS打开文件失败:', error);
							reject(new Error('使用WPS打开文件失败: ' + JSON.stringify(error)));
						});
					} else {
						console.log('未安装WPS，使用系统默认应用打开文件, 文件路径:', filePath);
						// 如果没有安装WPS，使用系统默认应用打开
						plus.runtime.openFile(filePath, () => {
							console.log('系统默认应用打开文件成功');
							resolve();
						}, (error) => {
							console.error('打开文件失败:', error);
							reject(new Error('打开文件失败，请确保已安装文档查看应用: ' + JSON.stringify(error)));
						});
					}
				});
			});
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
				if (!line) continue;
				if (line.startsWith('# ')) {
					const titleLine = line.substring(2).trim();
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
				if (line.includes('：')) {
					const parts = line.split('：');
					if (parts.length >= 2) {
						const key = parts[0].replace(/\s+/g, '');
						let value = parts.slice(1).join('：').trim();
						value = value.replace(/\*\*/g, '');
						if (key && value) {
							patient[key] = value;
						} else {
							patient[key] = "";
						}
					}
					continue;
				}
				if (line.startsWith('|') && line.endsWith('|') && !foundTable) {
					foundTable = true;
					inTable = true;
					const heartLast = line.split('|');
					const rawHeaders = heartLast.slice(1, heartLast.length - 1);
					tableHeaders = this.processDuplicateHeaders(rawHeaders);
					console.log('tableHeaders:', tableHeaders);
					continue;
				}
				if (inTable) {
					if (line.replace(/-/g, '').replace(/\|/g, '').trim() === '') {
						continue;
					}
					if (!line.startsWith('|')) {
						inTable = false;
						continue;
					}
					const cellsLast = line.split('|')
					const cells = cellsLast.slice(1, cellsLast.length - 1)
					if (cells.length >= tableHeaders.length) {
						const item = {};
						for (let i = 0; i <= tableHeaders.length; i++) {
							item[tableHeaders[i]] = cells[i] || '';
						}
						items.push(item);
					} else if (cells.length > 0) {
						const item = {};
						for (let i = 0; i < cells.length; i++) {
							if (i < tableHeaders.length) {
								item[tableHeaders[i]] = cells[i];
							}
						}
						items.push(item);
					}
				}
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
				if (line.includes('日期') && !patient.date) {
					const parts = line.split('：');
					if (parts.length >= 2) {
						patient.date = parts[1].trim();
					}
				}
			}

			const mergedItems = this.mergeDuplicateColumns(items, tableHeaders);

			const hasResultHeader = tableHeaders.some(h => h && (h.includes('检验结果') || h.includes('检测结果') || h.includes('结果')));
			const mergedHeaders = [];
			if (hasResultHeader) {
				mergedHeaders.push('结果');
			}
			tableHeaders.forEach(h => {
				if (h && !(h.includes('检验结果') || h.includes('检测结果') || h.includes('结果'))) {
					mergedHeaders.push(h);
				}
			});

			return {
				hospital: hospital || 'OCR医院报告识别',
				title: title || '检验报告单',
				patient,
				table: {
					headers: mergedHeaders,
					items: mergedItems
				},
				signatures
			};
		},
		processDuplicateHeaders(headers) {
			const seen = {};
			return headers.map(h => {
				const trimmed = h ? h.trim() : '';
				if (!trimmed) return trimmed;
				if (seen[trimmed]) {
					seen[trimmed]++;
					return `${trimmed}_${seen[trimmed]}`;
				}
				seen[trimmed] = 1;
				return trimmed;
			});
		},
		mergeDuplicateColumns(items, headers) {
			const resultHeaders = headers.filter(h => h && (h.includes('检验结果') || h.includes('检测结果') || h.includes('结果')));
			const nonResultHeaders = headers.filter(h => h && !(h.includes('检验结果') || h.includes('检测结果') || h.includes('结果')));

			return items.map(item => {
				const merged = {};

				if (resultHeaders.length > 1) {
					let resultValue = '';
					resultHeaders.forEach(key => {
						const v = item[key] || '';
						if (v.trim()) {
							resultValue = v;
						}
					});
					merged['结果'] = resultValue;
				} else if (resultHeaders.length === 1) {
					const resultKey = resultHeaders[0];
					merged['结果'] = item[resultKey] || '';
				}

				nonResultHeaders.forEach(key => {
					merged[key] = item[key] || '';
				});

				return merged;
			});
		},
		// 添加日期格式化方法
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			const seconds = String(date.getSeconds()).padStart(2, '0');
			return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
		},
		extractEnglishCode(str) {
			if (!str) return '';
			const regex = /\(([^)]+)\)/;
			const match = str.match(regex);
			return match ? match[1].trim() : '';
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
	margin-bottom: 150rpx;
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
	right: 10%;
	top: 15%;
	z-index: 9999;
}

.no-data {
	text-align: center;
	padding: 40rpx 0;
	color: #999;
	font-size: 28rpx;
}

/* 添加按钮样式 */
.top-button {
	position: fixed;
	right: 20rpx;
	bottom: 140rpx;
	width: 100rpx;
	height: 100rpx;
	background-color: #007AFF;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
	z-index: 9999;
	opacity: 1;
	transform: scale(1);
	transition: all 0.3s ease;
}

.top-button.hide {
	opacity: 0;
	transform: scale(0.8);
	pointer-events: none;
}

.add-button {
	position: fixed;
	right: 20rpx;
	bottom: 20rpx;
	width: 100rpx;
	height: 100rpx;
	background-color: #007AFF;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
	z-index: 9999;
}

.add-icon {
	font-size: 60rpx;
	color: #FFFFFF;
	font-weight: bold;
}
</style>