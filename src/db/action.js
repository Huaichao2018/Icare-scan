import DB from "./sqlite";
let isOffLine = false
/**报告识别记录表 相关操作  discern_record
     * 报告识别记录
     * Id 主键Id=报告识别时间=数据创建时间
     * spName 患者姓名
     * spAge 患者年龄
     * spSex 患者性别
     * departments 科室
     * reportName 报告名称
     * reportTime 报告时间
     * reportRes	报告识别结果集
*/
//查询
export async function GetDiscernList(data) {
  let lineList = []
  uni.showLoading({
    title: '加载中'
  })
  lineList = await DB.selectTableData('discern_record',
    `limit ${data.size} offset ${(data.page - 1) * data.size}`
  )
  uni.hideLoading()
  console.log('列表数据', lineList)
  return lineList
}

//新增
export async function InsertDiscern(data) {
  return DB.insertTableData('discern_record',
    "'Id','spName','spAge','spSex','departments','reportName','reportTime','reportRes'",
    `'${Date.now()}','${data.spName}','${data.spAge}','${data.spSex}','${data.departments}','${data.reportName}','${data.reportTime}','${data.reportRes}'`)
}

//修改
export async function UpdateDiscern(data) {
  return DB.updateTableData('discern_record',
    `spName='${data.spName}',spAge='${data.spAge}',spSex='${data.spSex}',departments='${data.departments}',reportName='${data.reportName}',reportTime='${data.reportTime}',reportRes='${data.reportRes}',`,
    `where Id='${data.Id}'`)
}

/**
 * 删除
 * @param {*} data id字符串集合
 * @returns 
 */
export async function DeleteDiscern(data) {
  uni.showLoading({
    title: '执行中'
  })
  let res = await DB.deleteTableData('discern_record', `WHERE Id IN '${data.join(',')}'`)
  uni.hideLoading()
  return res
}

/**
* 
* @returns 删除所有
*/
export async function DeleteAllDiscern() {
  uni.showLoading({
    title: '执行中'
  })
  let res = await DB.deleteTableData('discern_record')
  uni.hideLoading()
  return res
}

/**报告记录表相关操作 report_record
     * 报告记录
     * Id 主键Id=数据创建时间
     * discernId 报告识别Id=报告识别结果集=识别数据创建时间
     * spName 患者姓名
     * spAge 患者年龄
     * spSex 患者性别
     * departments 科室
     * reportName 报告名称
     * reportTime 报告时间
     * reportRes	报告结果集
     * img BLOB 识别的原始图片
*/

//查询
export async function GetReportList(data) {
  let lineList = []
  // uni.showLoading({
  //   title: '加载中'
  // })
  // console.log(data);
  // 构建查询条件
  let conditions = [];

  // 处理搜索关键词（姓名和性别）
  if (data.spName) {
    conditions.push(`spName like '%${data.spName}%'`);
  }

  if (data.spSex) {
    conditions.push(`spSex like '%${data.spSex}%'`);
  }

  // 处理报告名称筛选（改为模糊匹配）
  if (data.reportName) {
    conditions.push(`reportName like '%${data.reportName}%'`);
  }

  // 处理开始时间筛选
  if (data.startDate) {
    conditions.push(`reportTime >= '${data.startDate}'`);
  }

  // 处理结束时间筛选
  if (data.endDate) {
    conditions.push(`reportTime <= '${data.endDate}'`);
  }

  // 组合WHERE子句
  let whereClause = '';
  if (conditions.length > 0) {
    whereClause = `where ${conditions.join(' and ')} `;
  }

  // 添加分页
  const limitClause = `limit ${data.size} offset ${(data.page - 1) * data.size}`;

  // 组合完整查询语句
  const query = `${whereClause}${limitClause}`.trim();
  // console.log('whereClause', whereClause);

  lineList = await DB.selectTableData('report_record', query)

  uni.hideLoading()
  return lineList
}

//新增
export async function InsertReport(data) {
  return DB.insertTableData('report_record',
    "'Id','discernId','spName','spAge','spSex','departments','reportName','reportTime','reportRes','img'",
    `'${Date.now()}','${data.discernId}','${data.spName}','${data.spAge}','${data.spSex}','${data.departments}','${data.reportName}','${data.reportTime}','${data.reportRes}','${data.img}'`)
}

/**
 * 
 * @param {*} data 
 */
export async function GetReporArrayList(data) {
  let list = [];
  let whereClause = '';
  let conditions = [];

  if (conditions.length > 0) {
    whereClause = `where ${conditions.join(' and ')} `;
  }
  const orderClause = `order by createTime desc`;
  const limitClause = `limit ${data.pageSize} offset ${(data.currentPage - 1) * data.pageSize}`;
  const query = `${whereClause}${orderClause} ${limitClause}`.trim();
  list = await DB.selectTableData('report_record_new', query);
  return list;
}

/**
 * 添加报告集
 * @param {*} data 
 * @returns 
 */
export async function InsertReportList(data) {
  return DB.insertTableData('report_record_new',
    "'id','billNo','imageCount','remark','status','createTime'",
    `'${data.id}','${data.billNo}','${data.imageCount}','${data.remark}','${data.status}','${data.createTime}'`)
}
export async function UpdateReportList(data) {
  return DB.updateTableData('report_record_new',
    `imageCount='${data.imageCount}',remark='${data.remark}',status='${data.status}'`,
    `where id='${data.id}'`)
}

export async function InsertReportSource(data) {
  return DB.insertTableData('report_record_img',
    "'id','info_id','img_billNo','img_name','reportRes','img'",
    `'${data.id}','${data.info_id}','${data.img_billNo}','${data.img_name}','${data.reportRes}','${data.img}'`)
}

export async function DeleteReportSource(id) {
  return DB.deleteTableData('report_record_img', `WHERE info_id='${id}'`)
}

//修改
export async function UpdateReport(data) {
  return DB.updateTableData('report_record',
    `spName='${data.spName}',spAge='${data.spAge}',spSex='${data.spSex}',departments='${data.departments}',reportName='${data.reportName}',reportTime='${data.reportTime}',reportRes='${data.reportRes}',`,
    `where Id='${data.Id}'`)
}

/**
 * 删除
 * @param {*} data id字符串集合
 * @returns 
 */
export async function DeleteReport(data) {
  uni.showLoading({
    title: '执行中'
  })
  let res = await DB.deleteTableData('report_record', `WHERE Id IN '${data.join(',')}'`)
  uni.hideLoading()
  return res
}

/**
 * 
 * @returns 删除所有
 */
export async function DeleteAllReport() {
  uni.showLoading({
    title: '执行中'
  })
  let res = await DB.deleteTableData('report_record')
  uni.hideLoading()
  return res
}


/**
 * 检查并申请权限
 * @param {*} permission 
 * @returns 
 */
export async function requestPermission(permission) {
  return new Promise((resolve, reject) => {
    plus.android.requestPermissions(
      [permission],
      function (resultObj) {
        if (resultObj.deniedAlways.length > 0 || resultObj.deniedPresent.length > 0) {
          reject(new Error('权限被拒绝'));
        } else {
          resolve();
        }
      },
      function (error) {
        reject(error);
      }
    );
  });
}