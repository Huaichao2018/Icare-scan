<template>
  <view>
    <!-- <z-paging ref="paging" class="list" v-model="list">
    
      <view class="search">
        <uni-search-bar style="position: sticky;top: 0;z-index: 999;background: rgb(245, 245, 245);" placeholder="请输入姓名/性别" @input="inputVal"
          v-model="search" cancelButton="none" />
      </view>

      <view class="item" v-for="item in list" :key="item.formCode" @click="handleItem(item)">
        <view class="row">业务编码：{{item.formCode}}</view>
        <view class="row">工程名称：{{item.projectName}}</view>
        <view class="row">施工员：{{item.createUserName}}</view>
        <button v-if="showDelete(item)" @click.stop="openDelete(item)">删除</button>
      </view>
			

    </z-paging> -->
    <!-- <nav-bar isSel title="识别记录"></nav-bar> -->
    <view class="">
      <view style="width: 100%;background: rgb(0, 125, 255);" :style="{
			height:safeAreaTop+'px'
		}">
      </view>
      <view style="width: 100%;background: rgb(0, 125, 255);" :style="{
			height: '90upx'
		}">
      </view>
      <view class="flex nav-bar items-center justify-center" :style="{top:safeAreaTop + 'px'}">
        <div v-if="isShowIcon">
          <!-- <image class="eyeIcon" src="../../static/eyes.png" mode="widthFix" @click="eyeClick"></image> -->
          <!-- <image class="eyeIcon" src="../../static/eyes.png" mode="widthFix" @click="chooseFromFiles"></image> -->
          <image class="eyeIcon" src="../../static/eyes.png" mode="widthFix" @click="startOCR"></image>

          识别记录
          <image class="selIcon" src="../../static/select.png" mode="widthFix" @click="seleClick"></image>
        </div>
        <div v-else class="flex items-center justify-center" style="width: 100%;">
          <!-- 取消按钮 - 黑色字体 -->
          <button class="cancle_btn" @click="isShowIcon = true" style="color:#001124;">取消</button>
          <view style="flex: 1; text-align: center;">识别记录</view>
          <!-- 全选按钮 - 蓝色字体 -->
          <button class="allsel_btn" @click="allselClick" style="color:#001124;">全选</button>
        </div>
      </view>

    </view>

    <app-main @onBottom="onBottom">
      <view style="position: relative;">

        <view class="row">
          <checkbox-group style="width: 100%;">
            <uni-table border emptyText="暂无更多数据">
              <!-- 表头行 -->
              <uni-tr>
                <uni-th width="100" align="center">患者姓名</uni-th>
                <uni-th align="center">年龄</uni-th>
                <uni-th width="180" align="left">报告名称</uni-th>
              </uni-tr>
              <!-- 表格数据行 -->
              <uni-tr v-for="item in list" :key="item.Id">
                <uni-td>{{ item.spName }}</uni-td>
                <uni-td>{{ item.spAge }}</uni-td>
                <uni-td>{{ item.reportName }}</uni-td>
                <!-- v-if="Date.now() - item.recentlyCheckTime > 4 * 60 * 60 * 1000" -->
                <!-- <uni-td style="">

							</uni-td> -->
              </uni-tr>
            </uni-table>
          </checkbox-group>
          <!-- <view class="add" @click="toAdd">
            <image class="img" src="../../static/add.png" mode="widthFix" />
          </view> -->
        </view>

        <!-- <view v-if="!finished" style="color: #888;text-align: center;font-size: 20rpx;line-height: 35rpx;">加载中...
        </view> -->
        <image :src="imgsrc"></image>
        <view style="padding: 10px;margin: 10px;word-break: break-all;">
          {{ocrresult}}
        </view>
      </view>
    </app-main>
    <view>
      <tab-bar v-if="isShowIcon" :page="1"></tab-bar>
      <button v-else @click="delClick" class="del_btn">
        <image class="delete-icon" src="../../static/delete.png" mode="widthFix"></image>
      </button>
    </view>

  </view>

  <!-- <uniPopup type="bottom">

  </uniPopup> -->
</template>

<script>
import {
  GetDiscernList, requestPermission
} from '@/db/action.js'

export default {
  data () {
    return {
      safeAreaTop: 0,
      list: [],
      search: '',
      page: 1,
      finished: false,
      isShowIcon: true,

    };
  },
  computed: {
    tableData () {
      return this.list.sort((a, b) => {
        return Number(a.recentlyCheckTime) - Number(b.recentlyCheckTime)
      })
    }
  },
  mounted () {
    this.safeAreaTop = uni.getSystemInfoSync().safeArea.top
  },
  onShow () {
    this.isShowMenu = false
    uni.hideTabBar()
    this.page = 1
    this.finished = false
    this.list = []
    this.getList()
  },
  methods: {
    inputVal (e) {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.page = 1
        this.finished = false
        this.list = []
        this.getList()
      }, 200)
    },

    showUploadOptions () {
      this.isShowMenu = true;
    },

    
    onBottom () {
      if (!this.finished) {
        this.getList()
      }
    },
    getList () {
      GetDiscernList({
        page: this.page,
        size: 15,
        search: this.search
      }).then(res => {
        this.list = this.list.concat(res)
        if (res.length && res.length == 15) {
          this.page += 1
          this.finished = false
        } else {
          this.finished = true
        }
        console.log('res', res)
      }).catch((err) => {
        console.log('GetPeoList ERR:', err);
      })
    },

    /**选择数据 */
    seleClick () {
      this.isShowIcon = false
      this.isShowMenu = false
    },
    eyeClick (e) {
      e.stopPropagation(); // 阻止事件冒泡
      this.isShowMenu = !this.isShowMenu; // 切换菜单显示状态
      //alert(this.isShowMenu)
    },

    // 跳转到OCR处理页面
    startOCR () {
      uni.navigateTo({
        url: '/pages/discern/ocr-process'
      });
    },


    /**取消选择 */
    // cancelClick () {
    //   this.isShowIcon = true
    // },
    /**全选数据 */
    allselClick () {
      alert("全选1")
    },
    /**删除记录数据 */
    delClick () {

    }
  }
}
</script>

<style scoped lang="less">
.row {
  padding: 20upx 16upx 10upx;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 24upx;

  &:first-child {
    padding-bottom: 0;
  }
}

.isFrequent {
  background-color: aliceblue;
}

.nav-bar {
  height: 90upx;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  box-shadow: 14px 10px 50px 0px rgba(174, 192, 204, 0.2);
  background: rgb(0, 125, 255);
  color: rgb(231, 236, 241);
  font-size: 32upx;
  font-weight: 700;
  text-align: center;
  z-index: 2;
}

.eyeIcon {
  width: 40upx;
  position: absolute;
  left: 33upx;
}
.selIcon {
  width: 40upx;
  position: absolute;
  right: 33upx;
}
/* 添加按钮样式 */
.cancle_btn,
.allsel_btn {
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0 20upx;
  font-size: 28upx;
  line-height: 1;
  position: relative; /* 修改为相对定位 */
  z-index: 3; /* 提高层级 */
  width: auto; /* 自动宽度 */
}
.del_btn {
  width: 100%;
  height: 120rpx;
  display: flex;
  flex-direction: row;
  position: fixed;
  bottom: 0;
  margin-top: 0%;
  background-color: rgb(0, 125, 255);
  color: white;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}
.delete-icon {
  width: 50rpx; /* 根据需要调整图标大小 */
  height: 50rpx; /* 保持与宽度相同以保持比例 */
  /* 如果图标不是白色，添加滤镜使其变白 */
  filter: brightness(0) invert(1);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>