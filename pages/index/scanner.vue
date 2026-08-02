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
							<view class="item-row--value">{{ item.status }}</view>
						</view>
					</view>
					<view class="item-btn" v-if="item.status === 'Completed'">
						<button type="primary" size="mini" @click="exportToExcel(item)">{{ $lang('exportText') }}</button>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
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
			options: [{ text: '', style: { backgroundColor: '#dd524d' } }],
		}
	},
	onNavigationBarButtonTap() {
		uni.navigateTo({ url: '/pages/plugins/addPage' })
	},
	onShow() {
		uni.setNavigationBarTitle({ title: this.$lang('navScan') });
		this.options[0].text = this.$lang('delete');
		this.init();
	},
	methods: {
		init() {
			GetReporArrayList({ page: this.page, size: 15 }).then(res => {
				this.list = res
			}).catch((err) => {
				console.log('GetReporArrayList ERR:', err);
			})
		},
		swipeClick(e, index) {
			uni.showModal({
				title: this.$lang('tip'),
				content: this.$lang('isDelete'),
				success: res => {
					if (res.confirm) {
						DB.deleteTableData('report_record_new', `where id='${e.id}'`)
						DB.deleteTableData('report_record_img', `where info_id='${e.id}'`)
						uni.showToast({ title: this.$lang('operating'), icon: 'loading', duration: 2000 });
						this.list = [];
						this.init();
					}
				}
			});
		},
		async exportToExcel(item) {
			let str = "<tr>";
			let sourceData = await DB.selectTableData('report_record_img', `where info_id='${item.id}'`)
			const tableHeadersOrigin = await DB.selectTableData('report_inspection_items');
			const tableHeaders = tableHeadersOrigin.map(item => item.inspection_name);
			for (let i = 0; i < tableHeaders.length; i++) {
				str += "<th>" + tableHeaders[i].trim() + "</th>";
			}
			str += "</tr>";
			// ... export logic
		},
		formatDate(timestamp) {
			if (!timestamp) return '';
			const date = new Date(parseInt(timestamp));
			return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
		}
	}
}
</script>
