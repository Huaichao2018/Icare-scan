<template>
	<view>
		<!-- <nav-bar :isTab="true" :isSel="false" :title="'OCR识别'"></nav-bar> -->
		<!-- <nav-bar title="在线识别"></nav-bar> -->
		<!-- OCR内容区域 -->
		<view class="ocr-container">
			<!-- 上传按钮 -->
			<!-- <view class="upload-area" @click="showUploadOptions"> -->
			<view class="upload-area" @click="chooseFromFiles">

				<image v-if="!imgsrc" src="../../static/add.png" class="upload-icon" />
				<text v-if="!imgsrc">点击上传图片</text>
				<image v-if="imgsrc" :src="imgsrc" mode="widthFix" class="preview-image" alt="预览图片" />
			</view>

			<view class="container" id="report-container">

				<view v-if="isJixiReport" class="processing-indicator">
					<text>{{ this.jixiText }}</text>
					<view class="spinner"></view>
				</view>
				<!-- 报告内容 -->
				<div v-if="reportData">
					<div class="header">
						<div class="hospital-name">{{ reportData.hospital }}</div>
						<div class="report-title">{{ reportData.title }}</div>
					</div>

					<div class="patient-info" v-if="Object.keys(reportData.patient).length > 0">
						<div class="info-item" v-for="(value, key) in reportData.patient" :key="key">
							<span class="info-label">{{ key }}：</span>
							<span class="info-value" :class="{ highlight: key.includes('诊断') || key.includes('姓名') }">
								{{ value }}
							</span>
						</div>
					</div>

					<div class="table-container"
						v-if="reportData.table && reportData.table.headers && reportData.table.items.length > 0">
						<table>
							<thead>
								<tr>
									<th v-for="header in reportData.table.headers" :key="header">{{ header }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="(item, index) in reportData.table.items" :key="index">
									<td v-for="header in reportData.table.headers" :key="header"
										:class="{ abnormal: item[header] && (item[header].includes('↑') || item[header].includes('↓')) }">
										{{ item[header] || '' }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div class="footer" v-if="reportData.signatures && reportData.signatures.length > 0">
						<div class="signature-area">
							<div class="signature" v-for="signature in reportData.signatures" :key="signature.role">
								<div>{{ signature.role }}：{{ signature.name }}</div>
							</div>
						</div>
					</div>
				</div>
			</view>

			<!-- 状态信息 -->
			<view v-if="errorMessage" class="error-message">
				{{ errorMessage }}
			</view>
			<view v-if="isProcessing" class="processing-indicator">
				<text>识别中...</text>
				<view class="spinner"></view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-buttons" v-if="reportData">
				<button class="action-btn retry-btn" @click="retryOCR">
					重新识别
				</button>
				<button class="action-btn save-btn" @click="saveResult">
					保存报告
				</button>
				<button class="action-btn copy-btn" @click="copyResult" v-if="false">
					复制文本
				</button>
				<button class="action-btn copy-btn" @click="saveExcel">
					保存Excel
				</button>
			</view>
		</view>

		<!-- 上传选项菜单 -->
		<view v-if="isShowMenu" class="menu-container">
			<view class="menu-item" @click="chooseFromCamera">从拍摄选择</view>
			<view class="menu-item" @click="chooseFromAlbum">从照片图库选择</view>
			<view class="menu-item" @click="chooseFromFiles">从文件选择</view>
			<view class="menu-item cancel" @click="isShowMenu = false">取消</view>
		</view>
		<!-- <tab-bar :page="1"></tab-bar> -->
	</view>
</template>

<script>
import {
	InsertDiscern,
	UpdateDiscern,
	InsertReport
} from '@/db/action.js'
import config from '@/config.js'
export default {
	data() {
		return {
			isShowMenu: false, // 控制下拉菜单显示
			ocrresult: '识别结果', // 识别结果文本
			imgsrc: '', // 图片路径
			currentImagePath: '', // 当前处理的图片路径

			isProcessing: false,
			isJixiReport: false,
			errorMessage: '',
			jixiText: "报告解析中...",
			reportData: null, //报告解析后的数据
			saveData: { //报告记录
				spName: undefined, //  * spName 患者姓名
				spAge: undefined, //  * spAge 患者年龄
				spSex: undefined, //  * spSex 患者性别
				departments: undefined, //  * departments 科室
				reportName: undefined, //  * reportName 报告名称
				reportTime: undefined, //  * reportTime 报告时间
				reportRes: undefined, //  * reportRes	报告识别结果集
				img: undefined // *img BLOB 识别原始图片
			},
			specimenReportMap: {
				"血": "血常规报告",
				"全血": "血常规报告",
				"血清": "生化检验报告",
				"血浆": "凝血功能报告",
				"尿": "尿液分析报告",
				"尿液": "尿液分析报告",
				"粪便": "粪便常规报告",
				"痰": "痰液检查报告",
				"脑脊液": "脑脊液检查报告"
			}
		};
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		showUploadOptions() {
			this.isShowMenu = true;
		},
		//文件识别处理 filePath：文件路径
		async processImage(filePath) {
			console.log(filePath)
			this.isProcessing = true;
			this.errorMessage = '';
			this.ocrresult = '';
			this.currentImagePath = filePath;
			//预览图片
			this.imgsrc = filePath;
			this.reportData = null;
			try {
				const copyFilePath = await this.copyImageToPrivateDirectory(filePath);
				this.currentImagePath = copyFilePath;
				this.imgsrc = await this.getImageBase64(copyFilePath);
				const ocrData = await this.recognizeDocument(filePath);
				// const ocrData = {
				// 	"document": [{
				// 		"name": "markdown",
				// 		"value": "  术后复发转移\n\n检验项目：大便常规+隐血试验\n\n报告时间：2024-04-29 10:09\n\n|序号 |项目名称 |缩写 |结 果 |参考区间/值 |单 位 |检测方法 |\n|--|--|--|--|--|--|--|\n||[外观] |[外观] |||||\n|1 |颜色 ||黄色 |||仪器识别法 |\n|2 |性状 ||软便 |||仪器识别法 |\n|3 |粘液 ||无 |||目测法 |\n|4 |便血 ||无 |||目测法 |\n||[镜检] |||||目测法 |\n|5 |白细胞 ||无 |0-1 |/HP |镜检法 |\n|6 |红细胞 ||无 |无 |/HP |镜检法 |\n|7 |脓细胞 ||无 |无 |/HP |镜检法 |\n|8 |吞噬细胞 ||无 |无 |/HP |镜检法 |\n|9 |淀粉颗粒 ||无 |||镜检法 |\n|10 |脂肪滴 ||无 ||/HP |镜检法 |\n|11 |似酵母菌 ||无 |无 |/HP |镜检法 |\n|12 |夏科雷登结晶 ||无 |无 ||镜检法 |\n|13 |隐血 ||阴性 |阴性 ||胶体金免疫层析法 |\n|14 |其它 ||/ |||镜检法 |\n\n"
				// 	}]
				// };
				//原始markdown数据字符串 保存
				this.ocrresult = ocrData.document.find(item => item.name === "markdown").value;
				//this.ocrresult = ocrData.document[0].value;
				//数据解析
				const reportDataRes = this.parseMarkdownReport(ocrData.document[0].value);
				// this.renderReport(reportData);
				if (!reportDataRes) {
					this.jixiText = "解析失败，请检查报告！";
				} else {
					this.reportData = reportDataRes
					this.isJixiReport = false;

					// 提取患者信息填充到 saveData
					this.extractPatientInfo(reportDataRes);
				}
			} catch (error) {
				console.error('识别失败:', error);
				this.errorMessage = error.message || '识别失败，请重试';

				if (error.code === 10107) {
					this.errorMessage += " (请上传小于5MB的图片)";
				} else if (error.code === 10204) {
					this.errorMessage += " (请稍后再试)";
				}
			} finally {
				this.isProcessing = false;
			}
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
							const fileName = `${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
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
		// 新增方法：将图片转换为Base64编码
		getImageBase64(filePath) {
			return new Promise((resolve, reject) => {
				// #ifdef APP-PLUS
				plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
					entry.file((file) => {
						const reader = new plus.io.FileReader();
						reader.onloadend = function (evt) {
							resolve(evt.target.result);
						};
						reader.readAsDataURL(file);
					}, (error) => {
						console.error("获取文件失败:", error);
						resolve(filePath); // 失败时回退到原路径
					});
				}, (error) => {
					console.error("解析文件路径失败:", error);
					resolve(filePath); // 失败时回退到原路径
				});
				// #endif

				// #ifndef APP-PLUS
				// 在H5等环境中直接使用原路径
				resolve(filePath);
				// #endif
			});
		},
		/**调用讯飞OCR识别接口 */
		async recognizeDocument(filePath) {
			const apiUrl = config.ocrApiUrl;
			try {
				const uploadRes = await uni.uploadFile({
					url: apiUrl,
					filePath: filePath,
					name: 'image'
				});

				if (uploadRes.statusCode === 200) {
					let response = JSON.parse(uploadRes.data)
					if (response.code === 200) {
						let orcResData = response.data
						if (orcResData.code !== 0) {
							const error = new Error(orcResData.message || 'OCR识别失败');
							error.code = orcResData.code;
							throw error;
						}
						return JSON.parse(orcResData.data);
					} else {
						const error = new Error(response.msg || '请求失败');
						error.code = response.code;
						throw error;
					}
				}
			} catch (error) {
				if (error.errMsg && error.errMsg.includes("fail")) {
					throw new Error("网络请求失败，请检查网络连接");
				}
				throw error;
			}
		},

		parseMarkdownReport(markdownText) {
			//debugger
			this.isJixiReport = true;
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

		// 渲染报告单 取消使用 不兼容Android
		renderReport(data) {
			//console.log(JSON.stringify(data))
			if (!data) {
				this.jixiText = "解析失败，请检查报告！";
			}
			this.isJixiReport = false;
			const container = document.getElementById('report-container');
			container.innerHTML = '';
			// 创建头部
			const header = document.createElement('div');
			header.className = 'header';
			// header.style.background = `linear-gradient(90deg, ${data.color || '#1a73e8'} 0%, #0d47a1 100%)`;
			const watermark = document.createElement('div');
			watermark.className = 'watermark';
			watermark.textContent = data.hospital;

			header.innerHTML = `
                <div class="hospital-name">${data.hospital}</div>
                <div class="report-title">${data.title}</div>
            `;
			// header.appendChild(watermark);
			container.appendChild(header);
			// 创建患者信息区域
			if (Object.keys(data.patient).length > 0) {
				const patientInfo = document.createElement('div');
				patientInfo.className = 'patient-info';

				// 添加患者信息
				let infoHTML = '';
				for (const [key, value] of Object.entries(data.patient)) {
					// if (value && value !== '：') {
					if (value !== '：') {
						const isHighlight = key.includes('诊断') || key.includes('姓名');
						infoHTML += `
                            <div class="info-item">
                                <span class="info-label">${key}：</span>
                                <span class="info-value ${isHighlight ? 'highlight' : ''}">${value}</span>
                            </div>
                        `;
					}
				}
				patientInfo.innerHTML = infoHTML;
				container.appendChild(patientInfo);
			}
			// 创建表格容器
			if (data.table.headers && data.table.headers.length > 0 && data.table.items.length > 0) {
				const tableContainer = document.createElement('div');
				tableContainer.className = 'table-container';

				// 创建表格
				const table = document.createElement('table');

				// 创建表头
				const thead = document.createElement('thead');
				let headerHTML = '<tr>';
				for (const header of data.table.headers) {
					headerHTML += `<th>${header}</th>`;
				}
				headerHTML += '</tr>';
				thead.innerHTML = headerHTML;
				table.appendChild(thead);

				// 创建表身
				const tbody = document.createElement('tbody');

				// 添加表格数据
				for (const item of data.table.items) {
					const tr = document.createElement('tr');

					let rowHTML = '';
					for (const header of data.table.headers) {
						const value = item[header] || '';
						// 判断是否需要高亮显示异常值
						const hasAbnormal = value.includes('↑') || value.includes('↓');
						const statusClass = hasAbnormal ? 'abnormal' : '';
						rowHTML += `<td class="${statusClass}">${value}</td>`;
					}

					tr.innerHTML = rowHTML;
					tbody.appendChild(tr);
				}

				table.appendChild(tbody);
				tableContainer.appendChild(table);
				container.appendChild(tableContainer);
			}

			// 创建页脚
			const footer = document.createElement('div');
			footer.className = 'footer';

			// 创建签名区域
			if (data.signatures && data.signatures.length > 0) {
				const signatureArea = document.createElement('div');
				signatureArea.className = 'signature-area';

				// 添加签名
				for (const signature of data.signatures) {
					const signatureDiv = document.createElement('div');
					signatureDiv.className = 'signature';
					signatureDiv.innerHTML = `
                        <div>${signature.role}</div>
                        <div class="signature-line"></div>
                        <div>${signature.name}</div>
                    `;
					signatureArea.appendChild(signatureDiv);
				}

				footer.appendChild(signatureArea);
			}

			// 添加报告时间
			const reportMeta = document.createElement('div');
			reportMeta.className = 'report-meta';
			reportMeta.innerHTML = `
                <div>报告时间：${new Date().toLocaleString()}</div>
                <div>报告编号：${Math.random().toString(36).substring(2, 10).toUpperCase()}</div>`;
			// footer.appendChild(reportMeta);
			container.appendChild(footer);

			// 创建操作按钮
			// const actionButtons = document.createElement('div');
			// actionButtons.className = 'action-buttons';
			// actionButtons.innerHTML = `
			//           <button class="btn btn-primary" onclick="window.print()">
			//               <i class="fas fa-print"></i> 打印报告
			//           </button>
			//           <button class="btn btn-secondary" onclick="downloadReport()">
			//               <i class="fas fa-download"></i> 保存报告
			//           </button>
			//           <button class="btn btn-secondary" onclick="shareReport()">
			//               <i class="fas fa-share-alt"></i> 分享报告
			//           </button>
			//       `;
			// container.appendChild(actionButtons);
		},

		//重新识别
		retryOCR() {
			if (this.currentImagePath) {
				this.processImage(this.currentImagePath);
			} else {
				this.isShowMenu = true;
			}
		},
		//保存报告数据到离线数据库
		saveResult() {
			if (!this.ocrresult.trim()) {
				uni.showToast({
					title: '结果不能为空',
					icon: 'none'
				});
				return;
			}

			try {
				// 测试插入数据
				//   * Id 主键Id=报告识别时间=数据创建时间
				//  * spName 患者姓名
				//  * spAge 患者年龄
				//  * spSex 患者性别
				//  * departments 科室
				//  * reportName 报告名称
				//  * reportTime 报告时间
				//  * reportRes	报告识别结果集
				// * img BLOB 识别的原始图片

				this.saveData.img = this.imgsrc;
				this.saveData.reportRes = this.ocrresult;
				const ress = InsertReport(this.saveData)
				console.log('插入数据成功', ress)
			} catch (e) {
				console.error('数据库错误:', e)
			}

			uni.showToast({
				title: '结果已保存',
				icon: 'success'
			});
			// 这里可以添加保存到数据库的逻辑
		},
		//复制识别结果
		copyResult() {
			uni.setClipboardData({
				data: this.ocrresult,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					});
				}
			});
		},
		//保存Excel文件
		saveExcel() {
			if (!this.reportData) {
				uni.showToast({
					title: '没有数据可导出',
					icon: 'none'
				});
				return;
			}
			try {
				// #ifdef APP-PLUS
				const patientData = [];
				for (const [key, value] of Object.entries(this.reportData.patient)) {
                    patientData.push({key, value});
				}

				console.log('patientData', patientData)
				console.log('this.reportData.table', this.reportData.table)

				// 使用uni-app的API保存文件
				const fileName = `${this.reportData.patient.姓名 || '报告'}_${new Date().getTime()}.xlsx`;

				console.log("编译时环境: APP-PLUS");

				// 保存文件
				const filePath = `_doc/${fileName}`; // 保存到应用私有目录

				let str = "<tr>";
				for (let i = 0; i < this.reportData.table.headers.length; i++) {
					str += "<th>" + this.reportData.table.headers[i].trim() + "</th>";
				}
				str += "</tr>";

				//循环遍历，每行加入tr标签，每个单元格加td标签
				for (let i = 0; i < this.reportData.table.items.length; i++) {
					str += '<tr>'
					for (let key in this.reportData.table.items[i]) {
						str += `<td>${this.reportData.table.items[i][key].trim()}</td>`
					}
					str += '</tr>'
				}
				//下载的表格模板数据
				let template = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                                xmlns:x="urn:schemas-microsoft-com:office:excel"
                                xmlns="http://www.w3.org/TR/REC-html40">
                                <head><!--[if gte mso 9]><xml encoding="UTF-8"><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                                <x:Name>${this.reportData.patient.姓名 || '报告'}_${new Date().getTime()}</x:Name>
                                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>
                                </x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
                                </head><body><table>${str}</table></body></html>`

				const file = this.saveExcelFile(template, fileName);
				console.log('文件保存成功:', filePath);
				uni.showToast({ title: '导出成功', icon: 'success' });
				// #endif

				// #ifndef APP-PLUS
				uni.showToast({
					title: '该功能仅支持APP端',
					icon: 'none'
				});
				// #endif

			} catch (e) {
				console.error('导出Excel失败:', e);
				uni.showToast({
					title: '导出失败: ' + e.message,
					icon: 'none'
				});
			}
		},
		saveExcelFile(fileData, fileName) {
			// 获取应用私有文档目录
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
				let rootObj = fs.root
				let fullPath = rootObj.fullPath
				fs.root.getFile(fileName, { create: true, exclusive: false }, (fileEntry) => {
					fileEntry.createWriter((writer) => {
						writer.onwritestart = (e) => {
							uni.showToast({
								title: '正在导出...',
								icon: 'none'
							});
						}
						writer.onwrite = (e) => {
							uni.hideToast();
							setTimeout(() => {
								uni.showToast({
									title: `导出成功 file://${fullPath}/${fileName}.xlsx`,
									icon: 'success',
									duration: 3000
								});
							}, 500);
						};

						writer.onerror = (e) => {
							uni.showToast({
								title: '文件保存失败',
								icon: 'none',
								duration: 3000
							});
						};
						// 写入内容
						writer.write(fileData)
					});
				}, (error) => {
					uni.showToast({
						title: '创建文件失败',
						icon: 'none',
						duration: 3000
					});
				});
			}, (error) => {
				uni.showToast({
					title: '文件系统访问失败',
					icon: 'none',
					duration: 3000
				});
			});
		},
		// 从相机拍摄 取消使用
		chooseFromCamera() {
			console.log("拍摄");
			this.isShowMenu = false;
			const hasPermission = this.checkPermission(['android.permission.CAMERA']);
			if (!hasPermission) return;

			uni.chooseImage({
				count: 1,
				sourceType: ['camera'],
				success: (res) => {
					this.processImage(res.tempFilePaths[0]);
				},
				fail: (err) => {
					console.error('拍摄失败:', err);
				}
			});
		},
		// 从相册选择 取消使用
		chooseFromAlbum() {
			console.log("相册");
			this.isShowMenu = false;
			const hasPermission = this.checkPermission(['android.permission.READ_EXTERNAL_STORAGE']);
			if (!hasPermission) return;

			uni.chooseImage({
				count: 1,
				sourceType: ['album'],
				success: (res) => {
					this.processImage(res.tempFilePaths[0]);
				},
				fail: (err) => {
					console.error('选择图片失败:', err);
				}
			});
		},
		// 从文件选择 相册 拍摄
		chooseFromFiles() {

			this.isShowMenu = false;
			const hasPermission = this.checkPermission(['android.permission.READ_EXTERNAL_STORAGE']);
			if (!hasPermission) return;

			if (uni.chooseFile) {
				console.log("文件");
				uni.chooseFile({
					count: 1,
					extension: ['.jpg', '.jpeg', '.png', '.bmp'],
					success: (res) => {
						this.processImage(res.tempFiles[0].path);
					},
					fail: (err) => {
						console.error('选择文件失败:', err);
					}
				});
			} else {
				console.log("图库");
				uni.chooseImage({
					count: 1,
					extension: ['.jpg', '.jpeg', '.png', '.bmp'],
					success: (res) => {
						this.processImage(res.tempFilePaths[0]);
					},
					fail: (err) => {
						console.error('选择图片失败:', err);
					}
				});
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
						title: '权限申请',
						content: '您没有授权必要的权限，是否去设置？',
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
		extractPatientInfo(reportData) {
			// 重置 saveData
			this.saveData = {
				spName: undefined,
				spAge: undefined,
				spSex: undefined,
				departments: undefined,
				reportName: undefined,
				reportTime: undefined,
				reportRes: undefined,
				img: undefined
			};

			// 从解析的报告数据中提取患者信息
			const patient = reportData.patient;
			console.log('patient', patient)

			// 提取患者姓名
			if (patient['姓名']) {
				this.saveData.spName = patient['姓名'];
			} else if (patient['患者姓名']) {
				this.saveData.spName = patient['患者姓名'];
			}

			// 提取年龄
			if (patient['年龄']) {
				this.saveData.spAge = patient['年龄'];
			}

			// 提取性别
			if (patient['性别']) {
				this.saveData.spSex = patient['性别'];
			} else if (patient['患者性别']) {
				this.saveData.spSex = patient['患者性别'];
			}

			// 提取科室
			if (patient['送检科室']) {
				this.saveData.departments = patient['送检科室'];
			} else if (patient['科别']) {
				this.saveData.departments = patient['科别'];
			}

			// 提取报告名称
			console.log('提取报告名称', this.getReportCategoryBySpecimen(patient));
			this.saveData.reportName = this.getReportCategoryBySpecimen(patient).category;

			// 提取报告时间
			if (patient['报告时间']) {
				this.saveData.reportTime = patient['报告时间'];
			} else if (patient['日期']) {
				this.saveData.reportTime = patient['日期'];
			} else if (patient['检验日期']) {
				this.saveData.reportTime = patient['检验日期'];
			}

			// 设置图片路径
			this.saveData.img = this.currentImagePath;
		},
		getReportCategoryBySpecimen(patientInfo) {
			// 遍历患者信息对象寻找包含标本/样本的信息
			for (const [key, value] of Object.entries(patientInfo)) {
				// 检查键名是否包含标本或样本，并且不包含"号"
				if ((key.includes('标本') || key.includes('样本')) && !key.includes('号')) {
					// 从值中获取标本类型
					if (value && value.trim() !== '') {
						const cleanSpecimen = value.trim().replace(/[，,。.]/g, '');
						const category = this.specimenReportMap[cleanSpecimen] || "其他特殊检验报告";
						return { category, specimen: cleanSpecimen };
					}
				}

				// 检查值中是否包含标本信息（针对值中直接包含标本信息的情况）
				const pattern = /(?:标本|样本)[：:\s]*(?:类型)?[：:\s]*((?:(?!号)\S)+)/;
				const match = pattern.exec(value);

				if (match) {
					const specimenType = match[1];
					const cleanSpecimen = specimenType.replace(/[，,。.]/g, '');
					const category = this.specimenReportMap[cleanSpecimen] || "其他特殊检验报告";
					return { category, specimen: cleanSpecimen };
				}
			}

			return { category: "未知报告类型", specimen: null };
		}
	}
}
</script>

<style scoped lang="less">
.nav-bar {
	height: 90upx;
	display: flex;
	align-items: center;
	padding: 0 30upx;
	background: rgb(0, 125, 255);
	color: white;
	position: relative;
}

.nav-back {
	position: absolute;
	left: 30upx;
}

.back-icon {
	width: 40upx;
	height: 40upx;
}

.nav-title {
	flex: 1;
	text-align: center;
	font-size: 36upx;
	font-weight: bold;
}

.ocr-container {
	padding: 30upx;
}

.upload-area {
	height: 400upx;
	border: 2upx dashed #007dff;
	border-radius: 16upx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: #f8faff;
	margin-bottom: 40upx;
	position: relative;
	overflow: hidden;

	text {
		color: #007dff;
		font-size: 32upx;
		margin-top: 20upx;
	}
}

.upload-icon {
	width: 120upx;
	height: 120upx;
	opacity: 0.7;
}

.preview-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.result-container {
	border: 1upx solid #e0e0e0;
	border-radius: 12upx;
	background-color: #f9f9f9;
	margin-bottom: 30upx;
}

.result-textarea {
	width: 100%;
	min-height: 400upx;
	padding: 30upx;
	font-size: 28upx;
	line-height: 1.6;
	background-color: #fff;
	border-radius: 8upx;
}

.error-message {
	color: #ff4d4f;
	background-color: #fff2f0;
	border: 1upx solid #ffccc7;
	padding: 20upx;
	border-radius: 8upx;
	margin-bottom: 30upx;
	font-size: 26upx;
}

.processing-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20upx;
	color: #007dff;
	font-size: 28upx;

	.spinner {
		width: 40upx;
		height: 40upx;
		border: 4upx solid rgba(0, 125, 255, 0.2);
		border-top: 4upx solid #007dff;
		border-radius: 50%;
		margin-left: 20upx;
		animation: spin 1s linear infinite;
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.action-buttons {
	display: flex;
	gap: 20upx;
	margin-top: 30upx;
}

.action-btn {
	flex: 1;
	height: 80upx;
	line-height: 80upx;
	border-radius: 10upx;
	font-size: 28upx;
	color: white;
	border: none;

	&:after {
		border: none;
	}

	&[disabled] {
		opacity: 0.6;
	}
}

.retry-btn {
	background-color: #faad14;
}

.save-btn {
	background-color: #007dff;
}

.copy-btn {
	background-color: #52c41a;
}

.menu-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: white;
	border-radius: 20upx 20upx 0 0;
	padding: 20upx;
	z-index: 1000;
}

.menu-item {
	padding: 25upx 30upx;
	font-size: 32upx;
	text-align: center;
	border-bottom: 1upx solid #eee;

	&:last-child {
		border-bottom: none;
	}

	&.cancel {
		color: #888;
		margin-top: 10upx;
	}

	&:active {
		background-color: #f5f5f5;
	}
}

/** 表格结果 */
// * {
//   margin: 0;
//   padding: 0;
//   box-sizing: border-box;
//   font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
// }

.btn {
	padding: 12px 25px;
	border: none;
	border-radius: 5px;
	font-size: 16px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	transition: all 0.3s;
}

.btn-primary {
	background: #1976d2;
	color: white;
}

.btn-secondary {
	background: #f8f9fa;
	color: #333;
	border: 1px solid #ddd;
}

.btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.report-meta {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
	font-size: 14px;
	color: #666;
}

.loading {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 200px;
	flex-direction: column;
}
</style>
<style lang="less">
// .container {
//   width: 100%;
//   max-width: 1200px;
//   background: white;
//   border-radius: 15px;
//   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
//   overflow: hidden;
// }

#report-container {
	box-sizing: border-box;
	font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

	width: 100%;
	// max-width: 1200px;
	background: white;
	border-radius: 15px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	overflow: hidden;

	.header {
		background: linear-gradient(90deg, #1976d2 0%, #0d47a1 100%);
		color: white;
		padding: 20px;
		text-align: center;
	}

	.hospital-name {
		font-size: 28px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	.report-title {
		font-size: 22px;
		margin-bottom: 15px;
	}

	.patient-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 15px;
		padding: 20px;
		background: #f8f9fa;
		border-bottom: 1px solid #e0e0e0;
	}

	.info-item {
		display: flex;
	}

	.info-label {
		font-weight: bold;
		min-width: 100px;
		color: #555;
	}

	.info-value {
		color: #333;
	}

	.highlight {
		color: #d32f2f;
		font-weight: bold;
	}

	.table-container {
		overflow-x: auto;
		padding: 20px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 0 auto;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
	}

	th,
	td {
		padding: 12px 15px;
		text-align: left;
		border-bottom: 1px solid #e0e0e0;
	}

	th {
		background-color: #1976d2;
		color: white;
		font-weight: bold;
		position: sticky;
		top: 0;
	}

	tr:nth-child(even) {
		background-color: #f8f9fa;
	}

	tr:hover {
		background-color: #f1f8ff;
	}

	.abnormal {
		color: #d32f2f;
		font-weight: bold;
	}

	.normal {
		color: #388e3c;
	}

	.footer {
		padding: 20px;
		text-align: center;
		background: #f8f9fa;
		border-top: 1px solid #e0e0e0;
	}

	.signature-area {
		display: flex;
		justify-content: space-around;
		margin-top: 20px;
		flex-wrap: wrap;
	}

	.signature {
		margin: 10px 20px;
		text-align: center;
	}

	.action-buttons {
		display: flex;
		justify-content: center;
		gap: 15px;
		margin-top: 20px;
		padding: 0 20px 20px;
	}

	@media (max-width: 768px) {
		.patient-info {
			grid-template-columns: 1fr;
		}

		th,
		td {
			padding: 8px 10px;
			font-size: 14px;
		}

		.header {
			padding: 15px;
		}

		.hospital-name {
			font-size: 22px;
		}

		.report-title {
			font-size: 18px;
		}
	}
}
</style>