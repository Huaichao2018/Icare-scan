<template>
  <view>
    <!-- <nav-bar title="报告记录">导出</nav-bar> -->
    <app-main @onBottom="onBottom">
      <view style="position: relative;">
        <view style="position: sticky;top: 0;z-index: 999;background: rgb(245, 245, 245);">
          <!-- 修改为一行显示搜索框和筛选按钮 -->
          <view style="display: flex; align-items: center; padding: 10rpx 20rpx;">
            <view style="flex: 1;">
              <uni-search-bar @input="inputVal" v-model="query.spName" cancelButton="none"
                style="background: transparent;" />
            </view>
            <uni-icons type="settings" size="20" @click="openFilterPopup"></uni-icons>
            <!-- <button @click="openFilterPopup" size="mini" type="default"
              style="margin-left: 10rpx; white-space: nowrap;">筛选</button> -->
          </view>
        </view>

        <view class="list-warp">
          <mescroll-uni ref="mescrollRef" @init="mescrollInit" @down="downCallback" @up="upCallback" :fixed="false"
            :down="downOption" :up="upOption">
            <view class="list">
              <uni-swipe-action ref="swipeAction">
                <uni-swipe-action-item v-for="(item, index) in list" :right-options="options" :key="item.id"
                  @change="swipeChange($event, index)" @click="swipeClick(item, index)" style="margin-bottom: 20rpx;">
                  <view class="content-box" @click="goDetail(item.Id)">
                    <view class="item">
                      <view class="item-cell u-line-1">
                        患者姓名
                        {{ item.spName }}
                      </view>
                      <view class="item-cell u-line-1">
                        年龄
                        {{ item.spAge }}
                      </view>
                      <view class="item-cell u-line-1">
                        报告名称
                        {{ item.reportName }}
                      </view>
                      <view class="item-cell u-line-1">
                        报告时间：
                        {{ item.reportTime }}
                      </view>
                    </view>
                  </view>
                </uni-swipe-action-item>
              </uni-swipe-action>
            </view>
          </mescroll-uni>
        </view>
      </view>
    </app-main>

    <!-- 筛选弹窗 -->
    <uni-popup ref="filterPopup" type="bottom" style="z-index: 999999;position:fixed;margin-bottom: 120rpx;">
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">筛选条件</text>
          <view class="filter-actions">
            <text @click="resetFilter" class="filter-action">重置</text>
            <text @click="confirmFilter(1)" v-if="isExport === false" class="filter-action confirm">确定</text>
            <text @click="confirmFilter(2)" v-if="isExport === true" class="filter-action confirm">导出</text>
          </view>
        </view>

        <view class="filter-content">
          <!-- 性别选择 -->
          <view class="filter-item filter-item-row">
            <text class="filter-label">性别</text>
            <picker mode="selector" :range="genderOptions" range-key="label" @change="onGenderChange">
              <view class="filter-input filter-picker filter-input-inline">
                {{ selectedGenderLabel || '请选择性别' }}
                <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- 报告名称选择 -->
          <view class="filter-item filter-item-row">
            <text class="filter-label">报告名称</text>
            <picker mode="selector" :range="reportNameOptions" range-key="label" @change="onReportNameChange"
              style="z-index: 99999;">
              <view class="filter-input filter-picker filter-input-inline">
                {{ selectedReportNameLabel || '请选择报告名称' }}
                <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- 报告时间区间 -->
          <view class="filter-item filter-item-row">
            <text class="filter-label">报告时间</text>
            <view class="date-range">
              <picker mode="date" @change="onStartDateChange">
                <view class="filter-input filter-picker date-picker filter-input-inline">
                  {{ query.startDate || '开始时间' }}
                  <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
                </view>
              </picker>
              <text class="date-separator">至</text>
              <picker mode="date" @change="onEndDateChange">
                <view class="filter-input filter-picker date-picker filter-input-inline">
                  {{ query.endDate || '结束时间' }}
                  <uni-icons type="arrowdown" size="14" color="#999"></uni-icons>
                </view>
              </picker>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- <tab-bar :page="0"></tab-bar> -->
  </view>
</template>

<script>
import {
  GetReportList
} from '@/db/action.js'
import resources from '@/libs/resources.js'
import MescrollMixin from "@/uni_modules/mescroll-uni/components/mescroll-uni/mescroll-mixins.js";
import DB from '../../db/sqlite';
export default {
  mixins: [MescrollMixin],
  data() {
    return {
      isExport: false,
      // 筛选相关数据
      query: {
        spName: '',
        spSex: '',
        reportName: '',
        startDate: '',
        endDate: ''
      },
      list: [],
      search: '',
      page: 1,
      finished: false,

      downOption: {
        use: true,
        auto: false
      },
      upOption: {
        page: {
          num: 0,
          size: 20,
          time: null
        },
        empty: {
          use: true,
          icon: resources.message.nodata,
          tip: "暂无数据",
          fixed: true,
          top: "300rpx",
          zIndex: 5
        },
        textNoMore: '没有更多数据',
        toTop: {
          bottom: 250
        }
      },
      genderOptions: [
        { label: '男', value: '1' },
        { label: '女', value: '2' }
      ],
      reportNameOptions: [],
      selectedGenderLabel: '',
      selectedReportNameLabel: '',
      options: [
        {
          text: '删除',
          style: {
            backgroundColor: '#dd524d'
          }
        }
      ],
    };
  },
  onNavigationBarButtonTap() {
    console.log("点击了导出");
    this.isExport = true;
    this.openFilterPopup();
  },
  computed: {
    tableData() {
      return this.list.sort((a, b) => {
        return Number(a.recentlyCheckTime) - Number(b.recentlyCheckTime)
      })
    }
  },
  onShow() {
    // uni.hideTabBar()
    this.page = 1
    this.finished = false
    this.list = []
    this.getList()
    this.getReportNameList()
  },
  methods: {
    async getReportNameList() {
      const sourceData = await DB.selectTableData('report_record')
      const uniqueReportNames = [...new Set(sourceData.map(item => item.reportName))]
      this.reportNameOptions = uniqueReportNames.map(name => ({
        label: name,
        value: name
      }));
      console.log('sourceData', uniqueReportNames);

      console.log("报告名称列表", reportNameOptions);
    },
    // 添加以下方法
    onGenderChange(e) {
      const selectedIndex = e.detail.value;
      this.selectedGenderLabel = this.genderOptions[selectedIndex].label;
      this.query.spSex = this.genderOptions[selectedIndex].label;
      console.log('this.selectedGenderLabel', this.selectedGenderLabel);
    },

    onReportNameChange(e) {
      const selectedIndex = e.detail.value;
      this.selectedReportNameLabel = this.reportNameOptions[selectedIndex].label;
      this.query.reportName = this.reportNameOptions[selectedIndex].label;
      console.log('this.selectedReportNameLabel', this.selectedReportNameLabel);

    },
    // 添加日期选择处理方法
    onStartDateChange(e) {
      this.query.startDate = e.detail.value;
    },
    onEndDateChange(e) {
      this.query.endDate = e.detail.value;
    },
    swipeChange(e, index) {
      console.log('返回：', e);
      console.log('当前索引：', index);
    },
    swipeClick(e, index) {
      uni.showModal({
        title: '提示',
        content: '是否删除',
        success: res => {
          if (res.confirm) {
            // this.list.splice(index, 1);
            DB.deleteTableData('report_record', `where Id='${e.Id}'`)
            uni.showToast({
              title: '正在操作...',
              icon: 'loading',
              duration: 2000
            });
            this.list = [];
            this.getList();
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });

    },
    // 打开筛选弹窗
    openFilterPopup() {
      // 备份当前筛选条件
      this.originalFilterForm = { ...this.query }
      this.$refs.filterPopup.open()
    },
    // 重置筛选条件
    resetFilter() {
      this.query = {
        spName: '',
        spSex: '',
        reportName: '',
        startDate: '',
        endDate: ''
      }
      this.selectedGenderLabel = ''
      this.selectedReportNameLabel = ''
    },
    inputVal(e) {
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
    onBottom() {
      if (!this.finished) {
        this.getList()
      }
    },
    // 添加确认筛选方法
    confirmFilter(type) {
      if (type === 1) {
        this.page = 1;
        this.finished = false;
        this.list = [];
        this.$refs.filterPopup.close();
        this.getList();
      }
      else {
        console.log("点击了导出")
        this.page = 1;
        this.finished = false;
        this.$refs.filterPopup.close();
        this.exportToExcel();
      }
    },
    getList() {
      const params = {
        page: this.page,
        size: 15
      }
      // 如果有搜索关键词，添加到参数中
      if (this.query.spName) {
        params.spName = this.query.spName;
      }

      // 如果有筛选条件，也应添加到参数中
      // 根据你的接口要求来决定如何传递筛选参数
      if (this.query.spSex) {
        params.spSex = this.query.spSex;
      }

      if (this.query.reportName) {
        params.reportName = this.query.reportName;
      }

      if (this.query.startDate) {
        params.startDate = this.query.startDate;
      }

      if (this.query.endDate) {
        params.endDate = this.query.endDate;
      }

      GetReportList(params).then(res => {
        console.log('获取到的列表数据:', res); // 添加调试信息
        // 为每项数据添加 show 属性
        const formattedList = res.map(item => ({
          show: false,
          ...item
        }));
        this.list = this.list.concat(formattedList);

        if (res.length && res.length == 15) {
          this.page += 1
          this.finished = false
        } else {
          this.finished = true
        }
      }).catch((err) => {
        console.log('GetPeoList ERR:', err);
      })
    },
    open(index) {
      // 先关闭其他项
      this.list.forEach((item, i) => {
        if (i !== index) {
          item.show = false;
        }
      });
      // 打开当前项
      this.list[index].show = true;
    },
    //查看报告详情
    goDetail(id) {
      console.log('查看报告详情:', id);

      // 参数验证
      if (!id) {
        uni.showToast({
          title: '无效的报告ID',
          icon: 'none'
        });
        return;
      }

      // 跳转到详情页面
      uni.navigateTo({
        url: `/pages/report/ocr-report?id=${encodeURIComponent(id)}`,
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    upCallback(page) {
      const params = {
        page: this.page,
        size: 15
      }
      // 如果有搜索关键词，添加到参数中
      if (this.query.spName) {
        params.spName = this.query.spName;
      }

      // 如果有筛选条件，也应添加到参数中
      // 根据你的接口要求来决定如何传递筛选参数
      if (this.query.spSex) {
        params.spSex = this.query.spSex;
      }

      if (this.query.reportName) {
        params.reportName = this.query.reportName;
      }

      if (this.query.startDate) {
        params.startDate = this.query.startDate;
      }

      if (this.query.endDate) {
        params.endDate = this.query.endDate;
      }
      GetReportList(params).then(res => {
        if (page.num == 1) this.list = [];

        // const list = res.data.list.map(o => ({
        //   show: false,
        //   ...o
        // }));

        // this.mescroll.endSuccess(res.data.list.length);
        // this.list = this.list.concat(list);

        // 根据实际返回的数据结构调整处理方式
        // 如果 res 就是数组，直接使用 res
        // 如果 res 包含 data.list，则使用 res.data.list
        let dataList = [];
        if (Array.isArray(res)) {
          dataList = res;
        } else if (res && res.data && Array.isArray(res.data.list)) {
          dataList = res.data.list;
        } else if (res && Array.isArray(res.list)) {
          dataList = res.list;
        }

        // 为每项数据添加 show 属性
        const formattedList = dataList.map(o => ({
          show: false,
          ...o
        }));

        this.mescroll.endSuccess(dataList.length);
        this.list = this.list.concat(formattedList);

        // 更新分页状态
        if (res.length && res.length == page.size) {
          this.finished = false;
        } else {
          this.finished = true;
        }
      }).catch(() => {
        this.mescroll.endErr();
      })
    },
    exportToExcel() {
      const sourceData = this.list;
      console.log("sourceData", sourceData)
      sourceData.forEach(item => {
        let reportData = this.getReportDetail(item.Id);
        console.log("reportData", reportData)
      });
    },
    async getReportDetail(id) {
      // 验证ID是否存在
      if (!id) {
        console.error("无效的报告ID");
        return;
      }

      try {
        // 从数据库获取数据
        const data = await DB.selectTableData('report_record', `where Id='${id}'`);
        console.log("查询结果:", data);

        // 验证数据是否存在
        if (!data) {
          console.error("未找到报告数据");
          return;
        }
        const reportData = Array.isArray(data) ? data[0] : data;

        // 解析报告数据
        const parsedData = this.parseMarkdownReport(reportData.reportRes);

        // 验证解析结果
        if (!parsedData) {
          console.error("报告解析失败");
          return;
        }

        // 设置报告数据
        this.reportData = parsedData;
        this.saveExcel(this.reportData);

      } catch (error) {
        console.error("获取报告详情失败:", error);
      }
    },
    parseMarkdownReport(markdownText) {
      //debugger
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
    saveExcel(reportData) {
      if (!reportData) {
        uni.showToast({
          title: '没有数据可导出',
          icon: 'none'
        });
        return;
      }
      try {
        // #ifdef APP-PLUS
        const patientData = [];
        for (const [key, value] of Object.entries(reportData.patient)) {
          patientData.push({ key, value });
        }

        console.log('patientData', patientData)
        console.log('reportData.table', reportData.table)

        // 使用uni-app的API保存文件
        const fileName = `${reportData.patient.姓名 || '报告'}_${new Date().getTime()}.xlsx`;

        console.log("编译时环境: APP-PLUS");

        // 保存文件
        const filePath = `_doc/${fileName}`; // 保存到应用私有目录

        let str = "<tr>";
        for (let i = 0; i < reportData.table.headers.length; i++) {
          str += "<th>" + reportData.table.headers[i].trim() + "</th>";
        }
        str += "</tr>";

        //循环遍历，每行加入tr标签，每个单元格加td标签
        for (let i = 0; i < reportData.table.items.length; i++) {
          str += '<tr>'
          for (let key in reportData.table.items[i]) {
            str += `<td>${reportData.table.items[i][key].trim()}</td>`
          }
          str += '</tr>'
        }
        //下载的表格模板数据
        let template = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                                xmlns:x="urn:schemas-microsoft-com:office:excel"
                                xmlns="http://www.w3.org/TR/REC-html40">
                                <head><!--[if gte mso 9]><xml encoding="UTF-8"><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
                                <x:Name>${reportData.patient.姓名 || '报告'}_${new Date().getTime()}</x:Name>
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
                // const path = `file://${fullPath}/${fileName}.xlsx`
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
    }
  }
}
</script>

<style scoped lang="less">
.list-warp {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 20rpx;
}

.list {

  .list-box,
  .content-box {
    width: 100%;
    // margin-bottom: 20rpx;

    .u-swipe-content {
      width: calc(100% - 180rpx);
    }

    .u-swipe-action {
      border-radius: 10rpx;
    }

    .item {
      background-color: #fff;
      padding: 0 32rpx;

      .item-cell {
        height: 90rpx;
        line-height: 90rpx;
        font-size: 28rpx;
        color: #333333;
      }
    }
  }
}

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

.btn {
  // margin-right: 10upx;
  font-size: 24upx;
}

.isFrequent {
  background-color: aliceblue;
}

// 筛选弹窗样式
.filter-popup {
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;
  max-height: 90vh;
  overflow-y: auto;
  width: 100vw; // 设置固定宽度
  z-index: 999999;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
  margin-bottom: 20rpx;
}

.filter-title {
  font-size: 32rpx;
  font-weight: bold;
}

.filter-actions {
  display: flex;
}

.filter-action {
  margin-left: 30rpx;
  font-size: 28rpx;
  color: #666;

  &.confirm {
    color: #007aff;
  }
}

.filter-item {
  margin-bottom: 30rpx;
}

// 新增：横向排列的筛选项样式
.filter-item-row {
  display: flex;
  align-items: center;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;

  // 行内标签样式
  &.filter-label-inline {
    width: 180rpx;
    flex-shrink: 0;
    margin-bottom: 0;
  }
}

.filter-input {
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  font-size: 28rpx;

  &.filter-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  // 行内标签样式
  &.filter-label-inline {
    flex: 1;
  }
}

.date-range {
  display: flex;
  align-items: center;
}

.date-separator {
  margin: 0 20rpx;
  color: #999;
}

.date-picker {
  flex: 1;
  text-align: center;
}
</style>
<style lang="scss">
.u-page {
  padding: 0;
}

.u-demo-block__title {
  padding: 10px 0 2px 15px;
}

.swipe-action {
  &__content {
    padding: 25rpx 0;

    &__text {
      font-size: 15px;
      color: $u-main-color;
      padding-left: 30rpx;
    }
  }
}
</style>