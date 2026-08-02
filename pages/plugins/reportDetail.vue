<template>
    <view>
        <view class="ocr-container">
            <view class="upload-area" @click="chooseFromFiles">
                <image v-if="!imgsrc" src="../../static/add.png" class="upload-icon" />
                <image v-if="imgsrc" :src="imgsrc" mode="widthFix" class="preview-image" />
            </view>
            <view class="container" id="report-container">
                <view v-if="isJixiReport" class="processing-indicator">
                    <text>{{ this.jixiText }}</text>
                    <view class="spinner"></view>
                </view>
                <div v-if="reportData">
                    <div class="header">
                        <div class="hospital-name">{{ reportData.hospital }}</div>
                        <div class="report-title">{{ reportData.title }}</div>
                    </div>
                    <div class="patient-info" v-if="Object.keys(reportData.patient).length > 0">
                        <div class="info-item" v-for="(value, key) in reportData.patient" :key="key">
                            <span class="info-label">{{ key }}:</span>
                            <!-- NOTE: kept in Chinese on purpose — highlights fields whose
                                 parsed key literally contains "诊断" (diagnosis) or "姓名" (name)
                                 as extracted from the OCR'd Chinese-language report -->
                            <span class="info-value" :class="{ highlight: key.includes('诊断') || key.includes('姓名') }">
                                {{ value }}
                            </span>
                        </div>
                    </div>
                    <div class="table-container" v-if="reportData.table && reportData.table.headers && reportData.table.items.length > 0">
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
            <view class="action-buttons" v-if="reportData">
                <button class="action-btn copy-btn" @click="saveExcel">
                    {{ $lang('saveExcel') }}
                </button>
            </view>
        </view>
    </view>
</template>

<script>
import * as XLSX from 'xlsx';
import DB from '../../db/sqlite';

export default {
    data() {
        return {
            imgsrc: '',
            currentImagePath: '',
            isJixiReport: false,
            jixiText: "",
            reportData: null,
        };
    },
    onLoad(options) {
        uni.setNavigationBarTitle({ title: this.$lang('navReportDetail') });
        this.jixiText = this.$lang('reportLoading');
        const id = options.id;
        if (id) this.getReportDetail(id);
    },
    methods: {
        async getReportDetail(id) {
            if (!id) {
                this.jixiText = this.$lang('invalidReportId');
                return;
            }
            try {
                const data = await DB.selectTableData('report_record', `where Id='${id}'`);
                if (!data) {
                    this.jixiText = this.$lang('reportNotFound');
                    return;
                }
                const reportData = Array.isArray(data) ? data[0] : data;
                const parsedData = this.parseMarkdownReport(reportData.reportRes);
                this.imgsrc = reportData.img;
                if (!parsedData) {
                    this.jixiText = this.$lang('reportParseFailed');
                    return;
                }
                this.reportData = parsedData;
                this.isJixiReport = false;
            } catch (error) {
                this.jixiText = this.$lang('getReportFailed');
            }
        },
        parseMarkdownReport(markdownText) {
            this.isJixiReport = true;
            const lines = markdownText.split('\n');
            let hospital = '', title = '';
            const patient = {}, items = [], signatures = [];
            let inTable = false, tableHeaders = [], foundTable = false;
            
            for (let line of lines) {
                if (!line) continue;
                if (line.startsWith('# ')) {
                    const titleLine = line.substring(2).trim();
                    // NOTE: kept in Chinese on purpose — this matches the literal text
                    // ("检验报告单" / lab report title) as it appears in the OCR output of
                    // the source (Chinese-language) lab report, not UI text.
                    const parts = titleLine.split('检验报告单');
                    if (parts.length > 1) { hospital = parts[0].trim(); title = '检验报告单'; }
                    else { hospital = titleLine; title = '医学检验报告'; }
                    continue;
                }
                if (line.includes('：')) {
                    const parts = line.split('：');
                    if (parts.length >= 2) {
                        const key = parts[0].replace(/\s+/g, '');
                        let value = parts.slice(1).join('：').trim().replace(/\*\*/g, '');
                        if (key && value) patient[key] = value;
                    }
                    continue;
                }
                if (line.startsWith('|') && line.endsWith('|') && !foundTable) {
                    foundTable = true; inTable = true;
                    const heartLast = line.split('|');
                    tableHeaders = heartLast.slice(1, heartLast.length - 1);
                    continue;
                }
                // ... table parsing logic
            }
            return { hospital, title, patient, table: { headers: tableHeaders, items }, signatures };
        },
        async saveExcel() {
            if (!this.reportData) {
                uni.showToast({ title: this.$lang('noDataToExport'), icon: 'none' });
                return;
            }
            // ... Excel export logic
        }
    }
}
</script>
