<script>
// const DB = require('./db/sqlite.js')
import DB from './db/sqlite.js'
import { InsertDiscern, InsertReport } from './db/action.js'
export default {
  onLaunch: async function () {
    console.log('App Launch');
    try {
      // 初始化数据库
      await DB.initTable()
      console.log('数据库初始化成功')
      // 测试插入数据
      //   * Id 主键Id=报告识别时间=数据创建时间
      //  * spName 患者姓名
      //  * spAge 患者年龄
      //  * spSex 患者性别
      //  * departments 科室
      //  * reportName 报告名称
      //  * reportTime 报告时间
      //  * reportRes	报告识别结果集
      // let data = {
      //   spName: "王五",
      //   spAge: 36,
      //   spSex: "男",
      //   departments: "心血科",
      //   reportName: "血常规",
      //   reportTime: "2025-06-16 15:22",
      //   reportRes: "2025-06-16 15:22"
      // }
      // // const res = InsertDiscern(data)
      // const ress = InsertReport(data)
      // console.log('插入数据成功', ress)
    } catch (e) {
      console.error('数据库错误:', e)
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style lang="less">
.uni-forms-item {
  margin: 0 0 15rpx !important;
}

.common-btns {
  border-radius: 50.5rpx;
  margin: 10rpx 35rpx;
  height: 100rpx;
  color: rgb(255, 255, 255);
  font-family: PingFang SC;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  /* 线性渐变 */
  background: linear-gradient(
    -45deg,
    rgb(7, 52, 133) 23.547%,
    rgb(24, 145, 172) 62.679%,
    rgb(210, 236, 249) 95.661%
  );
}

/*每个页面公共css */
.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.justify-around {
  justify-content: space-around;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.items-center {
  align-items: center;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.flex-col {
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

* {
  box-sizing: border-box;
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.bottom-btns {
  height: 144upx;
  display: flex;
  align-items: center;
  gap: 20upx;
  padding: 0 20upx;

  .btn {
    flex: 1;
  }
}

.popup-option-list {
  padding: 0 20upx;

  .checklist-group {
    display: flex;
    flex-direction: column !important;

    .checklist-box {
      padding: 5px 0;
    }
  }
}

.form-page {
  .list {
    width: 100%;
    padding: 20upx;
    background: rgb(245, 245, 245);
    overflow-anchor: none;
  }
}

.form-area {
  position: relative;

  &.only-show {
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      pointer-events: all;
    }
  }
}

.form-card {
  border-radius: 16upx;
  background-color: #fff;
  padding: 20upx;
  margin-bottom: 30upx;

  .del-icon {
    width: 34upx;
    height: 34upx;
    background-image: url("/static/del.png");
    background-size: 100%;
  }

  .card-name {
    padding-bottom: 4upx;
    margin-bottom: 10upx;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item {
    margin-bottom: 20upx;
    background-color: #f5f5f5;
    position: relative;

    .del-icon {
      position: absolute;
      top: -10upx;
      right: -10upx;
    }

    .row {
      margin-bottom: 14upx;
      line-height: 1.5;
      font-size: 14px;
      color: #606266;
    }
  }
}

.click-input {
  .uni-easyinput {
    pointer-events: none;
  }
}

.no-show-error-form {
  .uni-forms-item__error {
    display: none !important;
  }
}

.is-select {
  // .uni-easyinput__content-input {
  // 	pointer-events: none;
  // }
  // input {
  // 	pointer-events: none;
  // }
}
</style>

<style lang="scss">
/*每个页面公共css */
@import "@/uview-ui/index.scss";
@import "@/uview-ui/demo.scss";
@import "@/assets/iconfont/ym/iconfont.css";
@import "@/assets/iconfont/custom/iconfont.css";
@import "@/assets/scss/common.scss";
</style>