<template>
    <view>
        <!-- OCR内容区域 -->
        <view class="ocr-container">
            <view class="upload-area" @click="chooseFromFiles">
                <image v-if="!imgsrc" src="../../static/add.png" class="upload-icon" />
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

            <!-- 操作按钮 -->
            <view class="action-buttons" v-if="reportData">
                <button class="action-btn copy-btn" @click="saveExcel">
                    {{ $lang('saveExcel') }}
                </button>
            </view>
        </view>
        <tab-bar :page="1"></tab-bar>
    </view>
</template>

<script>
import * as XLSX from 'xlsx';
import DB from '../../db/sqlite';
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
            jixiText: "",
            reportData: null, //报告解析后的数据
        };
    },
    onLoad(options) {
        uni.setNavigationBarTitle({ title: this.$lang('navReportDetail') });
        this.jixiText = this.$lang('reportLoading');
        const id = options.id;
        if (id) {
            this.getReportDetail(id);
        }
    },
    methods: {
        async getReportDetail(id) {
            // 验证ID是否存在
            if (!id) {
                console.error("无效的报告ID");
                this.jixiText = this.$lang('invalidReportId');
                return;
            }

            try {
                // 从数据库获取数据
                const data = await DB.selectTableData('report_record', `where Id='${id}'`);
                console.log("查询结果:", data);


                // 验证数据是否存在
                if (!data) {
                    console.error("未找到报告数据");
                    this.jixiText = this.$lang('reportNotFound');
                    return;
                }
                const reportData = Array.isArray(data) ? data[0] : data;
                // console.log("查询结果1:", reportData.reportRes);

                // 解析报告数据
                const parsedData = this.parseMarkdownReport(reportData.reportRes);
                this.imgsrc = reportData.img;

                // 验证解析结果
                if (!parsedData) {
                    console.error("报告解析失败");
                    this.jixiText = this.$lang('reportParseFailed');
                    return;
                }

                // 设置报告数据
                this.reportData = parsedData;
                this.isJixiReport = false;

                // 提取患者信息
                this.extractPatientInfo(parsedData);

            } catch (error) {
                console.error("获取报告详情失败:", error);
                this.jixiText = this.$lang('getReportFailed');
            }
        },
        goBack() {
            uni.navigateBack();
        },
        showUploadOptions() {
            this.isShowMenu = true;
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

        //保存Excel文件
        saveExcel() {
            if (!this.reportData) {
                uni.showToast({
                    title: this.$lang('noDataToExport'),
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
                uni.showToast({ title: this.$lang('exportSuccess'), icon: 'success' });
                // #endif

                // #ifndef APP-PLUS
                uni.showToast({
                    title: this.$lang('onlySupportApp'),
                    icon: 'none'
                });
                // #endif

            } catch (e) {
                console.error('导出Excel失败:', e);
                uni.showToast({
                    title: this.$lang('exportFailed') + ': ' + e.message,
                    icon: 'none'
                });
            }
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
            }

            // 提取报告名称
            if (patient['检验项目']) {
                this.saveData.reportName = patient['检验项目'];
            } else if (patient['报告名称']) {
                this.saveData.reportName = patient['报告名称'];
            }

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
        saveExcelFile(fileData, fileName) {
            // 获取应用私有文档目录
            plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
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
                                    title: `导出成功 file://${fullPath}/${fileName}.xlsx`,
                                    icon: 'success',
                                    duration: 3000
                                });
                                // const path = `file://${fullPath}/${fileName}.xlsx`
                            }, 500);
                        };

                        writer.onerror = (e) => {
                            uni.showToast({
                                title: this.$lang('fileSaveFailed'),
                                icon: 'none',
                                duration: 3000
                            });
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
                });
            }, (error) => {
                uni.showToast({
                    title: this.$lang('fileSystemFailed'),
                    icon: 'none',
                    duration: 3000
                });
            });
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