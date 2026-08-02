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
							<view class="item-row--value">{{ item.status }}</view>
						</view>
					</view>
					<view class="item-btn" v-if="item.status === 'Completed'">
						<button type="primary" size="mini" @click="selectExportType(item)">{{ $lang('exportText') }}</button>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
			<view v-if="list.length === 0" class="no-data">
				{{ $lang('noData') }}
			</view>
		</mescroll-body>
		<view class="add-button" @click="navigateToAddPage">
			<text class="add-icon">+</text>
		</view>
	</view>
</template>

<script>
import { GetReporArrayList } from '@/db/action.js'
import DB from '@/db/sqlite.js'
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";

export default {
	mixins: [MescrollMixin],
	data() {
		return {
			downOption: { use: true, auto: true },
			upOption: {
				page: { num: 0, size: 5, time: null },
				empty: { use: true, icon: '/static/nodata.png', tip: "", fixed: true, top: "300rpx" },
				textNoMore: '',
			},
			list: [],
			options: [{ text: '', style: { backgroundColor: '#dd524d' } }],
		}
	},
	onNavigationBarButtonTap() {
		uni.navigateTo({ url: '/pages/plugins/addPage' })
	},
	async onShow() {
		uni.setNavigationBarTitle({ title: this.$lang('navRecords') });
		this.upOption.empty.tip = this.$lang('noData');
		this.upOption.textNoMore = this.$lang('noMoreData');
		this.options[0].text = this.$lang('delete');
		if (this.mescroll) this.mescroll.resetUpScroll();
	},
	methods: {
		navigateToAddPage() {
			uni.navigateTo({ url: '/pages/plugins/addPage' })
		},
		navigateToView(id) {
			uni.navigateTo({ url: `/pages/plugins/addPage?id=${id}` })
		},
		async upCallback(page) {
			let query = { currentPage: page.num, pageSize: page.size, keyword: this.keyword, type: '' }
			try {
				const res = await GetReporArrayList(query);
				if (page.num == 1) this.list = [];
				this.list = this.list.concat(res);
				this.mescroll.endSuccess(res.length);
			} catch (err) {
				this.mescroll.endErr();
				uni.showToast({ title: this.$lang('loadFailed'), icon: 'none' });
			}
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
		formatDate(timestamp) {
			if (!timestamp) return '';
			const date = new Date(parseInt(timestamp));
			return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
		}
	}
}
</script>
