/**
 * 全局中英文国际化配置
 * 使用方式：this.$lang('key') 或在模板中 $lang('key')
 */
const messages = {
  zh: {
    // === 通用 ===
    confirm: '确认',
    cancel: '取消',
    delete: '删除',
    tip: '提示',
    loading: '加载中...',
    noData: '暂无数据',
    noMoreData: '没有更多数据',
    loadFailed: '加载失败',
    exportSuccess: '导出成功',
    exportFailed: '导出失败',

    // === 导航栏标题 ===
    navAbout: '关于',
    navRecognize: '在线识别',
    navRecords: '记录',
    navScan: '扫描',
    navReportDetail: '报告详情',
    navAddRecord: '新增记录',

    // === 首页 (index/index.vue) ===
    instructions: '使用说明',
    networkConnection: '网络连接与外部OCR服务',
    networkDesc: '本应用依赖在线OCR识别，使用过程中需保持网络连接。提交识别任务时，所选报告图片将通过HTTPS上传至由成都千里之外科技有限公司运营的中转服务（df.qlzwonline.com），并转发至第三方科大讯飞（iFLYTEK）开放平台OCR接口进行文字与表格识别。',
    dataStorage: '本地数据存储',
    dataStorageDesc: '任务记录、原始图片及OCR返回的Markdown文本均保存在设备本地的SQLite数据库（当前版本未加密）。请妥善管理设备访问权限，清除应用数据前请提前导出并备份所需文件。',
    privacyProtection: '隐私与去标识化提示',
    privacyDesc: '本应用不会在上传前自动对图片进行脱敏或去标识化处理，原始报告图片将被发送至远程中转服务及第三方OCR接口。请用户在拍摄或导入检验报告前，务必自行遮盖或移除患者姓名、住院号等一切可识别个人隐私信息，并严格遵守所在机构的伦理与数据安全规定。',
    serviceNote: '服务说明',
    serviceDesc: '本工具基于客户端规则解析辅助科研数据整理，识别与结构化导出结果仅供参考，不用于临床诊断。导出为Excel表格后，请务必对照原始报告进行人工核验与校正。',
    startScan: '点击开始扫描',

    // === 记录列表 (index/scanner.vue) ===
    billNo: '单号',
    imageCount: '图片数量',
    remark: '说明',
    date: '日期',
    status: '状态',
    exportText: '导出',
    normalExport: '普通导出',
    mergeExport: '合并导出',
    isDelete: '是否删除',
    operating: '正在操作...',
    top: '置顶',

    // === 新增页面 (plugins/addPage.vue) ===
    inputBillNo: '请输入单号',
    inputRemark: '请输入说明',
    imageUpload: '图片上传',
    addImage: '添加图片',
    saveTemp: '暂存',
    startDiscern: '开始识别',
    maxImageReached: '已达到最大上传数量',
    confirmDeleteImage: '确定要删除这张图片吗？',
    pleaseSelectImage: '请选择图片再进行识别',
    identifying: '请稍后，正在识别中',
    randomCodeUsedUp: '随机码已用完',
    permissionRequest: '权限申请',
    permissionDenied: '您没有授权必要的权限，是否去设置？',

    // === 报告详情 (report/ocr-report.vue) ===
    saveExcel: '保存Excel',
    reportLoading: '报告加载中...',
    invalidReportId: '无效的报告ID',
    reportNotFound: '未找到报告数据',
    reportParseFailed: '报告解析失败',
    getReportFailed: '获取报告详情失败',
    noDataToExport: '没有数据可导出',
    onlySupportApp: '该功能仅支持APP端',

    // === 关于页面 (regard/index.vue) ===
    feedback: '问题反馈',
    feedbackDesc: '如果您在使用过程中遇到任何问题或有任何疑问，请通过以下方式联系我们：',
    problemDesc: '问题描述',
    feedbackPlaceholder: '请详细描述您遇到的问题或疑问...',
    sendFeedback: '发送反馈',
    contactOr: '或直接发送邮件至：',
    feedbackEmpty: '反馈结果为空',
    feedbackFailed: '反馈失败',

    // === 语言切换 ===
    language: '语言',
    chinese: '中文',
    english: 'English',

    // === 状态值 ===
    PENDING: '待选图',
    RECOGNIZING: '识别中',
    COMPLETED: '识别完成',

    // === 导出相关 ===
    exporting: '正在导出...',
    mergingExport: '正在合并导出...',
    exportError: '导出异常,请联系管理员',
    openFileFailed: '打开文件失败',
    filePathInvalid: '文件路径无效',
    envNotSupport: '当前环境不支持打开文件',
    fileSaveFailed: '文件保存失败',
    fileCreateFailed: '创建文件失败',
    fileSystemFailed: '文件系统访问失败',
    exportComplete: '导出完成',
    openFileDir: '文件已导出,是否打开文件所在目录?',
    dirInfoFailed: '无法获取目录信息',
    pathParseFailed: '文件路径解析失败',
    openDirFailed: '打开目录失败',
    platformNotSupport: '当前平台不支持打开目录',
    downloadDirNotAccess: '无法访问下载目录',
    saveFailed: '保存失败',
    noStoragePermission: '未获得存储权限',
    permissionRequestFailed: '权限请求失败',
  },
  en: {
    // === Common ===
    confirm: 'Confirm',
    cancel: 'Cancel',
    delete: 'Delete',
    tip: 'Tip',
    loading: 'Loading...',
    noData: 'No Data',
    noMoreData: 'No More Data',
    loadFailed: 'Load Failed',
    exportSuccess: 'Export Success',
    exportFailed: 'Export Failed',

    // === Navigation Bar Titles ===
    navAbout: 'About',
    navRecognize: 'Recognize',
    navRecords: 'Records',
    navScan: 'Scan',
    navReportDetail: 'Report Detail',
    navAddRecord: 'Add Record',

    // === Home (index/index.vue) ===
    instructions: 'Instructions',
    networkConnection: 'Network & External OCR Service',
    networkDesc: 'IcareScan requires an active internet connection for online OCR. When a task is submitted, selected report images are transmitted over HTTPS to a relay service operated by Chengdu Qianli Zhiwai Technology Co., Ltd. (df.qlzwonline.com), which forwards recognition requests to the external iFLYTEK Open Platform OCR API.',
    dataStorage: 'Local Data Storage',
    dataStorageDesc: 'Task metadata, selected images, and OCR Markdown responses are stored locally on the device in an unencrypted SQLite database. Please safeguard device access and back up exported files before clearing app storage.',
    privacyProtection: 'Privacy & De-identification Notice',
    privacyDesc: 'IcareScan does NOT perform automatic image de-identification before upload. Uploaded images are transmitted to the remote relay server and external iFLYTEK OCR service. Users must manually mask or remove all patient-identifying information before capturing or importing reports and comply with institutional privacy and ethics policies.',
    serviceNote: 'Service Note',
    serviceDesc: 'This tool assists research data preparation via client-side rule-based parsing and is not intended for clinical diagnosis. Manual verification against source reports is required after Excel export.',
    startScan: 'Click to Start Scan',

    // === Record List (index/scanner.vue) ===
    billNo: 'Bill No',
    imageCount: 'Image Count',
    remark: 'Remark',
    date: 'Date',
    status: 'Status',
    exportText: 'Export',
    normalExport: 'Normal Export',
    mergeExport: 'Merge Export',
    isDelete: 'Are you sure to delete?',
    operating: 'Operating...',
    top: 'Top',

    // === Add Page (plugins/addPage.vue) ===
    inputBillNo: 'Please enter bill number',
    inputRemark: 'Please enter remark',
    imageUpload: 'Image Upload',
    addImage: 'Add Image',
    saveTemp: 'Save',
    startDiscern: 'Start Discern',
    maxImageReached: 'Maximum upload count reached',
    confirmDeleteImage: 'Are you sure to delete this image?',
    pleaseSelectImage: 'Please select images before recognition',
    identifying: 'Please wait, identifying...',
    randomCodeUsedUp: 'Random codes are used up',
    permissionRequest: 'Permission Request',
    permissionDenied: 'You have not authorized the necessary permissions, go to settings?',

    // === Report Detail (report/ocr-report.vue) ===
    saveExcel: 'Save Excel',
    reportLoading: 'Report loading...',
    invalidReportId: 'Invalid report ID',
    reportNotFound: 'Report data not found',
    reportParseFailed: 'Report parsing failed',
    getReportFailed: 'Failed to get report details',
    noDataToExport: 'No data to export',
    onlySupportApp: 'This feature only supports APP',

    // === About Page (regard/index.vue) ===
    feedback: 'Feedback',
    feedbackDesc: 'If you encounter any problems or have any questions during use, please contact us through the following methods:',
    problemDesc: 'Problem Description',
    feedbackPlaceholder: 'Please describe in detail the problem or question you encountered...',
    sendFeedback: 'Send Feedback',
    contactOr: 'Or send an email directly to:',
    feedbackEmpty: 'Feedback is empty',
    feedbackFailed: 'Feedback Failed',

    // === Language Switch ===
    language: 'Language',
    chinese: '中文',
    english: 'English',

    // === Status Values ===
    PENDING: 'Pending',
    RECOGNIZING: 'Processing',
    COMPLETED: 'Completed',

    // === Export Related ===
    exporting: 'Exporting...',
    mergingExport: 'Merging and exporting...',
    exportError: 'Export error, please contact admin',
    openFileFailed: 'Failed to open file',
    filePathInvalid: 'File path is invalid',
    envNotSupport: 'Current environment does not support opening files',
    fileSaveFailed: 'File save failed',
    fileCreateFailed: 'File creation failed',
    fileSystemFailed: 'File system access failed',
    exportComplete: 'Export complete',
    openFileDir: 'File exported, open the directory?',
    dirInfoFailed: 'Unable to get directory info',
    pathParseFailed: 'File path parsing failed',
    openDirFailed: 'Failed to open directory',
    platformNotSupport: 'Current platform does not support opening directory',
    downloadDirNotAccess: 'Unable to access download directory',
    saveFailed: 'Save failed',
    noStoragePermission: 'Storage permission not granted',
    permissionRequestFailed: 'Permission request failed',
  }
}

export default messages
