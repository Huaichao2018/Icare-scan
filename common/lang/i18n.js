/**
 * Global i18n configuration
 * Usage: this.$lang('key') or $lang('key') in templates
 */
const messages = {
  zh: {
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

    // === Home ===
    instructions: 'Instructions',
    networkConnection: 'Network Connection',
    networkDesc: 'To provide you with more accurate recognition services, it is recommended to maintain a smooth network connection during use.',
    dataStorage: 'Data Storage',
    dataStorageDesc: 'All your data will be securely stored on the device locally. We use advanced encryption technology to protect your privacy.',
    privacyProtection: 'Privacy Protection',
    privacyDesc: 'During the recognition process, the system will automatically encrypt the transmitted content.',
    serviceNote: 'Service Note',
    serviceDesc: 'This tool focuses on content recognition and parsing functions, and the results are for reference only.',
    startScan: 'Click to Start Scan',

    // === Record List ===
    billNo: 'Bill No',
    imageCount: 'Image Count',
    remark: 'Remark',
    date: 'Date',
    status: 'Status',
    exportText: 'Export',
    isDelete: 'Are you sure to delete?',
    operating: 'Operating...',

    // === Add Page ===
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

    // === Report Detail ===
    saveExcel: 'Save Excel',
    reportLoading: 'Report loading...',
    invalidReportId: 'Invalid report ID',
    reportNotFound: 'Report data not found',
    reportParseFailed: 'Report parsing failed',
    noDataToExport: 'No data to export',

    // === About Page ===
    feedback: 'Feedback',
    feedbackDesc: 'If you encounter any problems or have any questions during use, please contact us.',
    problemDesc: 'Problem Description',
    feedbackPlaceholder: 'Please describe in detail the problem or question you encountered...',
    sendFeedback: 'Send Feedback',
    contactOr: 'Or send an email directly to:',
    feedbackEmpty: 'Feedback is empty',
    feedbackFailed: 'Feedback Failed',

    // === Language Switch ===
    language: 'Language',
    chinese: 'Chinese',
    english: 'English',
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

    // === Home ===
    instructions: 'Instructions',
    networkConnection: 'Network Connection',
    networkDesc: 'To provide you with more accurate recognition services, it is recommended to maintain a smooth network connection during use.',
    dataStorage: 'Data Storage',
    dataStorageDesc: 'All your data will be securely stored on the device locally. We use advanced encryption technology to protect your privacy.',
    privacyProtection: 'Privacy Protection',
    privacyDesc: 'During the recognition process, the system will automatically encrypt the transmitted content.',
    serviceNote: 'Service Note',
    serviceDesc: 'This tool focuses on content recognition and parsing functions, and the results are for reference only.',
    startScan: 'Click to Start Scan',

    // === Record List ===
    billNo: 'Bill No',
    imageCount: 'Image Count',
    remark: 'Remark',
    date: 'Date',
    status: 'Status',
    exportText: 'Export',
    isDelete: 'Are you sure to delete?',
    operating: 'Operating...',

    // === Add Page ===
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

    // === Report Detail ===
    saveExcel: 'Save Excel',
    reportLoading: 'Report loading...',
    invalidReportId: 'Invalid report ID',
    reportNotFound: 'Report data not found',
    reportParseFailed: 'Report parsing failed',
    noDataToExport: 'No data to export',

    // === About Page ===
    feedback: 'Feedback',
    feedbackDesc: 'If you encounter any problems or have any questions during use, please contact us.',
    problemDesc: 'Problem Description',
    feedbackPlaceholder: 'Please describe in detail the problem or question you encountered...',
    sendFeedback: 'Send Feedback',
    contactOr: 'Or send an email directly to:',
    feedbackEmpty: 'Feedback is empty',
    feedbackFailed: 'Feedback Failed',

    // === Language Switch ===
    language: 'Language',
    chinese: 'Chinese',
    english: 'English',
  }
}

export default messages
