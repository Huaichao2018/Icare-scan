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
					{ inspection_name: "WBC", abbreviation: "WBC" },
					{ inspection_name: "PLT", abbreviation: "PLT" },
					{ inspection_name: "PT", abbreviation: "PT" },
					{ inspection_name: "INR", abbreviation: "INR" },
					{ inspection_name: "APTT", abbreviation: "APTT" },
					{ inspection_name: "AST", abbreviation: "AST" },
					{ inspection_name: "ALT", abbreviation: "ALT" },
					{ inspection_name: "GGT", abbreviation: "GGT" },
					{ inspection_name: "GLU", abbreviation: "GLU" },
					{ inspection_name: "HbA1c", abbreviation: "HbA1c" },
					{ inspection_name: "CHOL", abbreviation: "CHOL" },
					{ inspection_name: "TG", abbreviation: "TG" },
					{ inspection_name: "LDL-C", abbreviation: "LDL-C" },
					{ inspection_name: "HDL-C", abbreviation: "HDL-C" },
					{ inspection_name: "AFP", abbreviation: "AFP" },
					{ inspection_name: "CEA", abbreviation: "CEA" },
					{ inspection_name: "HIV", abbreviation: "HIV" },
					{ inspection_name: "HCV", abbreviation: "HCV" }
				];
			const values = inspectData.map(item =>
				`('${this.generateSnowflakeId()}','${item.inspection_name.replace(/'/g, "''")}','${item.abbreviation.replace(/'/g, "''")}')`
			).join(',');

			DB.deleteTable(tableName)
			DB.bathInsertData(tableName, columns, values).then(() => {
				console.log('Inspection item data initialization complete');
			})
		},
		// Snowflake ID generator function
		generateSnowflakeId() {
			const epoch = 1609459200000n; // 2021-01-01 00:00:00 UTC
			const timestamp = BigInt(Date.now()) - epoch;
			const nodeId = 1n;
			const sequence = BigInt(Math.floor(Math.random() * 4096));
			return (timestamp << 22n) | (nodeId << 12n) | sequence;
		},
	}
}
</script>

<style>
.ocr-container { padding: 2%; }
.ocr-description { margin: 2%; }
.ocr-title { margin-top: 5%; font-size: 44rpx; font-weight: bolder; text-align: center; }
.ocr-row-item { margin-bottom: 2%; }
.ocr-row-item--title { font-weight: bolder; }
</style>
