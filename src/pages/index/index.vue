<template>
	<view class="ocr-container">
		<view class="ocr-description">
			<view class="ocr-title">{{ $lang('instructions') }}</view>
			<view class="ocr-row-item">
				‌<view class="ocr-row-item--title">{{ $lang('networkConnection') }}</view>‌
				{{ $lang('networkDesc') }}
			</view>
			<view class="ocr-row-item">
				<view class="ocr-row-item--title">{{ $lang('dataStorage') }}</view>‌‌
				{{ $lang('dataStorageDesc') }}
			</view>
			<view class="ocr-row-item">
				‌<view class="ocr-row-item--title">{{ $lang('privacyProtection') }}</view>‌
				{{ $lang('privacyDesc') }}
			</view>
			<view class="ocr-row-item">
				<view class="ocr-row-item--title">{{ $lang('serviceNote') }}</view>‌‌
				{{ $lang('serviceDesc') }}
			</view>
		</view>
		<view>
			<button type="primary" size="large" @click="navigatorToScanner()">{{ $lang('startScan') }}</button>
		</view>
	</view>
</template>

<script>
import DB from '@/db/sqlite.js'

export default {
	data() {
		return {
			currIndex: 1,
		}
	},
	onShow() {
		uni.setNavigationBarTitle({ title: this.$lang('navRecognize') });
		this.createInspectionData();
	},
	methods: {
		navigatorToScanner() {
			uni.switchTab({
				url: '/pages/index/scanner'
			})
		},
		createInspectionData() {
			const tableName = 'report_inspection_items';
			const columns = '(id,inspection_name,abbreviation)';
			let inspectData =
				[
					{ inspection_name: "RBC", abbreviation: "RBC" },
					{ inspection_name: "HGB", abbreviation: "HGB" },
					{ inspection_name: "HCT", abbreviation: "HCT(PCV)" },
					{ inspection_name: "MCV", abbreviation: "MCV" },
					{ inspection_name: "MCH", abbreviation: "MCH" },
					{ inspection_name: "MCHC", abbreviation: "MCHC" },
					{ inspection_name: "RDW", abbreviation: "RDW" },
					{ inspection_name: "RDW-CV", abbreviation: "RDW-CV" },
					{ inspection_name: "RDW-SD", abbreviation: "RDW-SD" },
					{ inspection_name: "RET%", abbreviation: "RET_r" },
					{ inspection_name: "RET#", abbreviation: "RET_c" },
					{ inspection_name: "IRF", abbreviation: "IRF" },
					{ inspection_name: "LFR", abbreviation: "LFR" },
					{ inspection_name: "MFR", abbreviation: "MFR" },
					{ inspection_name: "HFR", abbreviation: "HFR" },
					{ inspection_name: "PLT", abbreviation: "PLT" },
					{ inspection_name: "PCT", abbreviation: "PCT" },
					{ inspection_name: "MPV", abbreviation: "MPV" },
					{ inspection_name: "PDW", abbreviation: "PDW" },
					{ inspection_name: "P-LCR", abbreviation: "P-LCR" },
					{ inspection_name: "P-LCC", abbreviation: "P-LCC" },
					{ inspection_name: "WBC", abbreviation: "WBC" },
					{ inspection_name: "Neu%", abbreviation: "N_r" },
					{ inspection_name: "Lym%", abbreviation: "L_r" },
					{ inspection_name: "Mon%", abbreviation: "M_r" },
					{ inspection_name: "Eos%", abbreviation: "E_r" },
					{ inspection_name: "Bas%", abbreviation: "B_r" },
					{ inspection_name: "Neu#", abbreviation: "N_c" },
					{ inspection_name: "Lym#", abbreviation: "L_c" },
					{ inspection_name: "Mon#", abbreviation: "M_c" },
					{ inspection_name: "Eos#", abbreviation: "E_c" },
					{ inspection_name: "Bas#", abbreviation: "B_c" },
					{ inspection_name: "PT", abbreviation: "PT" },
					{ inspection_name: "INR", abbreviation: "INR" },
					{ inspection_name: "APTT", abbreviation: "APTT" },
					{ inspection_name: "TT", abbreviation: "TT" },
					{ inspection_name: "FIB", abbreviation: "FIB" },
					{ inspection_name: "FDP", abbreviation: "FDP" },
					{ inspection_name: "D-DIMER", abbreviation: "D-DIMER" },
					{ inspection_name: "PCT", abbreviation: "PCT" },
					{ inspection_name: "CRP", abbreviation: "CRP" },
					{ inspection_name: "FE", abbreviation: "SI" },
					{ inspection_name: "TIBC", abbreviation: "TIBC" },
					{ inspection_name: "UIBC", abbreviation: "UIBC" },
					{ inspection_name: "FER", abbreviation: "FER" },
					{ inspection_name: "SSA", abbreviation: "SSA" },
					{ inspection_name: "AST", abbreviation: "AST" },
					{ inspection_name: "ALT", abbreviation: "ALT" },
					{ inspection_name: "GGT", abbreviation: "GGT" },
					{ inspection_name: "PALB", abbreviation: "PAB" },
					{ inspection_name: "TP", abbreviation: "TP" },
					{ inspection_name: "ALB", abbreviation: "Alb" },
					{ inspection_name: "GLB", abbreviation: "Glb" },
					{ inspection_name: "A/G", abbreviation: "A/G Ratio" },
					{ inspection_name: "ALP", abbreviation: "ALP" },
					{ inspection_name: "TBIL", abbreviation: "Tbil" },
					{ inspection_name: "DBIL", abbreviation: "DBIL" },
					{ inspection_name: "IBIL", abbreviation: "IBIL" },
					{ inspection_name: "TBA", abbreviation: "TBA" },
					{ inspection_name: "5'-NT", abbreviation: "5'-NT" },
					{ inspection_name: "AFU", abbreviation: "AFU" },
					{ inspection_name: "eGFR", abbreviation: "eGFR" },
					{ inspection_name: "CR", abbreviation: "CR" },
					{ inspection_name: "CRCL", abbreviation: "CRCL" },
					{ inspection_name: "Urea", abbreviation: "Urea" },
					{ inspection_name: "TCO2", abbreviation: "CO2" },
					{ inspection_name: "Cyc", abbreviation: "Cyc" },
					{ inspection_name: "UA", abbreviation: "UA" },
					{ inspection_name: "CA", abbreviation: "Ca" },
					{ inspection_name: "MG", abbreviation: "Mh" },
					{ inspection_name: "PO4", abbreviation: "P" },
					{ inspection_name: "NA", abbreviation: "Na" },
					{ inspection_name: "K", abbreviation: "k" },
					{ inspection_name: "CL", abbreviation: "Cl" },
					{ inspection_name: "FBG", abbreviation: "FBG" },
					{ inspection_name: "PPG", abbreviation: "PPG" },
					{ inspection_name: "GLU", abbreviation: "GLU" },
					{ inspection_name: "HbA1c", abbreviation: "HbA1c" },
					{ inspection_name: "OGTT", abbreviation: "OGTT" },
					{ inspection_name: "CHOL", abbreviation: "CHOL" },
					{ inspection_name: "LIP", abbreviation: "LIP" },
					{ inspection_name: "TG", abbreviation: "TG" },
					{ inspection_name: "VLDL-C", abbreviation: "VLDL-C" },
					{ inspection_name: "LDL-C", abbreviation: "LDL-C" },
					{ inspection_name: "HDL-C", abbreviation: "HDL-C" },
					{ inspection_name: "APOA-I", abbreviation: "APOA-I" },
					{ inspection_name: "APOB", abbreviation: "APOB" },
					{ inspection_name: "CK", abbreviation: "CK" },
					{ inspection_name: "CK-MB", abbreviation: "CK-MB" },
					{ inspection_name: "LDH", abbreviation: "LDH" },
					{ inspection_name: "cTnI", abbreviation: "cTnI" },
					{ inspection_name: "cTnT", abbreviation: "cTnT" },
					{ inspection_name: "Mb", abbreviation: "Mb" },
					{ inspection_name: "α-HBDH", abbreviation: "α-HBDH" },
					{ inspection_name: "Hcy", abbreviation: "Hcy" },
					{ inspection_name: "BNP", abbreviation: "BNP" },
					{ inspection_name: "HAVAb-IgM", abbreviation: "HAVAb-IgM" },
					{ inspection_name: "HBSAG", abbreviation: "HBSAG" },
					{ inspection_name: "HBSAB", abbreviation: "HBSAB" },
					{ inspection_name: "HBEAG", abbreviation: "HBEAG" },
					{ inspection_name: "HBEAB", abbreviation: "HBEAB" },
					{ inspection_name: "HBCAB", abbreviation: "HBCAB" },
					{ inspection_name: "HCV-cAg", abbreviation: "HCV-cAg" },
					{ inspection_name: "HCV", abbreviation: "HCV" },
					{ inspection_name: "HIV", abbreviation: "HIV" },
					{ inspection_name: "HEVAb-IgM", abbreviation: "HEVAb-IgM" },
					{ inspection_name: "TP Ab", abbreviation: "TP Ab" },
					{ inspection_name: "Blood type A", abbreviation: "Blood type A" },
					{ inspection_name: "Blood type B", abbreviation: "Blood type B" },
					{ inspection_name: "Blood type AB", abbreviation: "Blood type AB" },
					{ inspection_name: "Blood type O", abbreviation: "Blood type O" },
					{ inspection_name: "AFP", abbreviation: "AFP" },
					{ inspection_name: "CEA", abbreviation: "CEA" },
					{ inspection_name: "FERR", abbreviation: "FERR" },
					{ inspection_name: "ProGRP", abbreviation: "ProGRP" },
					{ inspection_name: "SCAA", abbreviation: "SCAA" },
					{ inspection_name: "NSE", abbreviation: "NSE" },
					{ inspection_name: "CYFRA21-1", abbreviation: "CYFRA21-1" },
					{ inspection_name: "CA125", abbreviation: "CA125" },
					{ inspection_name: "CA19-9", abbreviation: "CA19-9" },
					{ inspection_name: "CA50", abbreviation: "CA50" },
					{ inspection_name: "CA242", abbreviation: "CA242" },
					{ inspection_name: "CA72-4", abbreviation: "CA72-4" },
					{ inspection_name: "β-HCG", abbreviation: "β-HCG" },
					{ inspection_name: "PGⅠ", abbreviation: "PGⅠ" },
					{ inspection_name: "PGⅡ", abbreviation: "PGⅡ" },
					{ inspection_name: "PGⅠ/PGⅡratio", abbreviation: "PGⅠ/PGⅡratio" },
					{ inspection_name: "TPSA", abbreviation: "TPSA" },
					{ inspection_name: "FPSA", abbreviation: "FPSA" },
					{ inspection_name: "TP", abbreviation: "TP" },
					{ inspection_name: "TGAB", abbreviation: "TGAB" },
					{ inspection_name: "HE4", abbreviation: "HE4" },
					{ inspection_name: "IL-2", abbreviation: "IL-2" },
					{ inspection_name: "IL-4", abbreviation: "IL-4" },
					{ inspection_name: "IL-6", abbreviation: "IL-6" },
					{ inspection_name: "IL-10", abbreviation: "IL-10" },
					{ inspection_name: "IL-17", abbreviation: "IL-17" },
					{ inspection_name: "TNF-α", abbreviation: "TNF-α" },
					{ inspection_name: "IFN-γ", abbreviation: "IFN-γ" },
					{ inspection_name: "VD-T", abbreviation: "VD-T" },
					{ inspection_name: "FT-3", abbreviation: "FT-3" },
					{ inspection_name: "T3", abbreviation: "T3" },
					{ inspection_name: "FT-4", abbreviation: "FT-4" },
					{ inspection_name: "T4", abbreviation: "T4" },
					{ inspection_name: "FSH", abbreviation: "FSH" },
					{ inspection_name: "Tg", abbreviation: "Tg" },
					{ inspection_name: "Anti-Tg", abbreviation: "Anti-Tg" },
					{ inspection_name: "Anti-TPO", abbreviation: "Anti-TPO" },
					{ inspection_name: "PTH", abbreviation: "PTH" }
				];
			const values = inspectData.map(item =>
				`('${this.generateSnowflakeId()}','${item.inspection_name.replace(/'/g, "''")}','${item.abbreviation.replace(/'/g, "''")}')`
			).join(',');

			DB.deleteTable(tableName)
			DB.bathInsertData(tableName, columns, values).then(() => {
				if (result.code === 200) {
					console.log('批量插入成功');
				} else {
					console.log('批量插入失败');
				}
			})
		},
		// 雪花ID生成函数
		generateSnowflakeId() {
			const epoch = 1609459200000n; // 2021-01-01 00:00:00 UTC
			const timestamp = BigInt(Date.now()) - epoch;
			const nodeId = 1n; // 节点ID，可以根据需要调整
			const sequence = BigInt(Math.floor(Math.random() * 4096)); // 序列号 0-4095

			// 组合雪花ID: timestamp(42位) + nodeId(10位) + sequence(12位)
			return (timestamp << 22n) | (nodeId << 12n) | sequence;
		},

	}
}
</script>

<style>
.ocr-container {
	padding: 2%;
}

.ocr-description {
	margin: 2%;
}

.ocr-title {
	margin-top: 5%;
	font-size: 44rpx;
	font-weight: bolder;
	text-align: center;
}

.ocr-row-item {
	margin-bottom: 2%;
}

.ocr-row-item--title {
	font-weight: bolder;
}
</style>