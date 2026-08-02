# 项目文件结构说明

这是根据原 Word 文档中合并粘贴的源码，按 uni-app 常见项目约定拆分出的文件结构。**文件名和目录是我根据每个代码块的功能推测命名的，并非从文档中读取的真实路径**，如果和你实际 GitHub 仓库不一致，请告诉我实际路径，我可以重新调整。

```
project/
├── pages/
│   ├── index/
│   │   ├── index.vue        # 首页 / 使用说明（navRecognize），点击"开始扫描"跳转 scanner
│   │   └── scanner.vue       # 扫描记录列表（navScan，scroll-view + exportToExcel）
│   ├── records/
│   │   └── records.vue       # 记录列表（navRecords，mescroll 分页 + selectExportType）
│   ├── plugins/
│   │   ├── addPage.vue       # 新增/编辑记录页（navAddRecord，图片上传 + OCR识别）
│   │   └── reportDetail.vue  # 报告详情页（navReportDetail，解析 markdown 报告 + 导出Excel）
│   └── mine/
│       └── about.vue         # 关于/反馈/语言切换页（navAbout）
└── common/
    ├── lang/
    │   └── i18n.js            # 中英文文案配置
    └── mixin/
        └── lang-mixin.js       # 语言切换 mixin（$lang 方法 + switchLang）
```

## 推测依据

- 每个 `.vue` 文件的目录名来自其 `onShow`/`onLoad` 中设置的导航栏标题 key（如 `navRecords`、`navScan` 等）和主要业务逻辑。
- `records.vue` 与 `scanner.vue` 内容相似但不同（分页方式、导出方法不同），推测是两个独立的列表页面（可能对应不同 Tab），如果实际上是同一页面的新旧版本，请告诉我合并。
- `i18n.js` 和 `lang-mixin.js` 按代码里的注释直接得名。
- 文档中被引用但未包含源码的模块（如 `@/db/sqlite.js`、`@/db/action.js`、`image-tools`）未生成，因为原文档中没有这部分源码。

如果你能提供 GitHub 仓库地址或者实际文件路径，我可以按真实结构重新整理。

## 关于英文化

已将所有注释、界面文案、状态值（`待选图`→`Pending Selection`、`识别中`→`Recognizing`、`识别完成`→`Completed`）统一翻译为英文，`i18n.js` 的 `zh` 字典值也一并译成英文（结构和 key 未动）。

**唯一保留中文的地方**在 `pages/plugins/reportDetail.vue` 的报告解析逻辑里：
- `titleLine.split('检验报告单')` 及相邻两行
- `key.includes('诊断') || key.includes('姓名')`

这两处不是界面文案，而是用来匹配 **OCR 识别出的中文体检报告原文**（报告标题、诊断/姓名字段名）。原始体检单本身是中文的，如果把这里也改成英文关键字，会导致无法从真实报告中正确解析出医院名称、标题和高亮字段，功能会失效。如果你的报告源文本以后也会换成英文版，告诉我具体英文关键字，我再改。
