<p align="center">
  <img src="icon.png" alt="App icon" width="140" />
</p>

<h1 align="center">Icare Scan</h1>

<p align="center">
  An Android application for the automated digitization and structuring of clinical laboratory reports, intended to support downstream research in <em>clinical laboratory omics</em> (Clinlabomics).
</p>

<p align="center">
  Download com.icare.scan.apk.1.1.1</a>
</p>

---

## Overview

Icare Scan is a mobile (Android) application designed to bridge the gap between unstructured, paper-based (or image-based) clinical laboratory reports and structured, machine-readable data suitable for quantitative research. By capturing a photograph of a conventional laboratory report, the application performs optical character recognition (OCR) and subsequent parsing to extract patient information, test items, and reference values into a structured schema. This addresses a common bottleneck in retrospective and prospective clinical laboratory data collection, where source reports are frequently distributed as printed documents or unstructured images rather than structured electronic records.

The resulting structured output is intended to facilitate downstream analyses in clinical laboratory omics (Clinlabomics) research, including cohort-level aggregation, longitudinal trend analysis, and integration with other structured clinical or -omics data sources.

## Platform

This application is distributed as a native Android package (`.apk`) and is intended for installation on Android mobile devices. It is not a web application, desktop application, or cross-platform build.

**Installation**

1. Download the package: com.icare.scan.apk.1.1.1
2. Transfer the `.apk` file to an Android device, if not downloaded directly on-device.
3. Enable installation from unknown sources (if required by the device's Android version), and install the package.

## Core Workflow

1. **Manual Pre-Upload De-identification (User Responsibility):**
   IcareScan **does not perform automatic image de-identification**. Users must mask or remove patient-identifying information before capturing or importing laboratory report images.
2. **Image Acquisition & Task Management (`src/pages/plugins/addPage.vue`):**
   Users create a recognition task (assigned a unique 6-digit task ID `billNo`), capture or select up to 100 images from the device camera or photo gallery, preview/remove images, save drafts locally, or submit the task for OCR.
3. **Remote OCR Transmission (`src/config.js`, `src/pages/plugins/addPage.vue`):**
   Images are uploaded sequentially over **HTTPS** (`uni.uploadFile`) to the external **iFLYTEK Open Platform OCR API** and returns a JSON payload containing recognized Markdown text.
4. **Local SQLite Storage (`src/db/sqlite.js`, `src/db/action.js`):**
   Task records (`report_record_new`), original base64 images and Markdown OCR responses (`report_record_img`), and predefined laboratory test names (`report_inspection_items`, ~150 common analytes) are stored locally in an **unencrypted** SQLite database at `_downloads/report.db`.
5. **Client-Side Rule-Based Parsing & Excel Export (`src/pages/index/scanner.vue`):**
   Upon export, the client parses Markdown headings, colon-delimited key–value lines, and pipe-delimited tables (`| ... |`), matches analyte abbreviations against `report_inspection_items` (dynamically appending unmatched abbreviations as new columns), extracts numeric values via regular expression (`/-?\d+(\.\d+)?/`), and writes an HTML-wrapped Excel table (`.xlsx`) to the Android public downloads directory (`plus.io.PUBLIC_DOWNLOADS`).
   - **Normal Export:** Exports one `.xlsx` file per task with **one row per report image** (`img_billNo`, `img_name`, and analyte columns).
   - **Merge Export:** Computes the **column-wise arithmetic mean** across all images in the task and exports a single summary row .
6. **External Manual Verification:**
   IcareScan does not include an in-app tabular value editor; users open the exported `.xlsx` file on a mobile viewer or desktop computer and verify/correct values against source images using the task and image sequence ID (`billNo_001`, etc.).
   
## Project File Structure

The structure below was reconstructed from a source document in which multiple page components had been concatenated into a single file. File names and directories are inferred from each component's function and navigation context; they may not correspond exactly to the original repository layout.

```
Icare-scan/
├── LICENSE                       # Apache-2.0 license
├── README.md                     # Documentation and build instructions
├── src/                          # Complete, buildable UniApp (Vue 3) Android client source
│   ├── App.vue                   # Application lifecycle & SQLite table initialization
│   ├── main.js                   # Vue 3 entry point & global i18n mixin registration
│   ├── config.js                 # Configurable HTTPS OCR relay and feedback endpoints
│   ├── manifest.json             # UniApp / Android permissions, SQLite & Camera modules
│   ├── pages.json                # Application pages and tab-bar routing
│   ├── package.json              # NPM dependencies (image-tools, xlsx)
│   ├── db/
│   │   ├── sqlite.js             # HTML5+ SQLite wrapper (_downloads/report.db)
│   │   └── action.js             # CRUD operations for task, image, and item tables
│   ├── libs/
│   │   ├── i18n.js               # Bilingual (Chinese/English) UI text & privacy disclosures
│   │   ├── lang.js               # Reactive language switcher mixin
│   │   └── resources.js          # Static asset path definitions
│   ├── pages/
│   │   ├── index/index.vue       # Startup instructions & predefined analyte dictionary seeding
│   │   ├── index/scanner.vue     # Task list, Markdown parser, Excel export (row-by-row & averaged)
│   │   ├── plugins/addPage.vue   # Task creation, camera/gallery capture, HTTPS OCR submission
│   │   ├── plugins/scanner.vue   # Legacy single-mode task view
│   │   ├── report/ocr-report.vue # Legacy single-report detail preview
│   │   └── regard/index.vue      # Language switching (ZH/EN) & feedback submission
│   ├── components/               # Shared UI components
│   ├── assets/ & static/         # Stylesheets, icon fonts, and static images
│   ├── uni_modules/ & uview-ui/  # Bundled UniApp & uView UI modules
│   └── unpackage/res/icons/      # Application launcher icons referenced by manifest.json
└── evaluation/                   # De-identified multi-hospital evaluation dataset (187 reports, 3,610 items)
    ├── README.md                 # Dataset schema and audit notes
    ├── evaluation_dataset.csv    # Full item-level evaluation table across 3 hospitals
    └── fushun_cbc_alias_columns.csv # Raw alias-column outputs (NEUT%, NEUT#, MONO#, EO#, BASO#)
```

### Basis for the inferred structure

- Each `.vue` file's directory name derives from the navigation bar title key set in its `onShow`/`onLoad` lifecycle hook (e.g. `navRecords`, `navScan`) and its principal business logic.
- `records.vue` and `scanner.vue` share similar but non-identical implementations (differing pagination and export methods); they are provisionally treated as two distinct list views (potentially corresponding to separate tabs). If these instead represent successive revisions of a single page, the repository maintainer should advise so they may be reconciled.
- `i18n.js` and `lang-mixin.js` are named according to the descriptive comments present in the source.
- Modules referenced but not present in the source document (e.g. `@/db/sqlite.js`, `@/db/action.js`, `image-tools`) are not reproduced here, as their implementations were not included in the original material.

If a canonical GitHub repository structure is available, this layout can be revised to match it exactly.

## Notes on Localization

All source comments, interface strings, and internal status values (`待选图` → `Pending Selection`, `识别中` → `Recognizing`, `识别完成` → `Completed`) have been translated to English; the `zh` locale dictionary in `i18n.js` was likewise translated, with keys and structure preserved.

One exception is retained by design, in the report-parsing logic of `pages/plugins/reportDetail.vue`:

- `titleLine.split('检验报告单')` and the two adjacent lines
- `key.includes('诊断') || key.includes('姓名')`

These are not interface text but pattern-matching literals applied to the OCR output of the source laboratory report itself (report title, and the "diagnosis"/"name" field labels), which is inherently Chinese-language. Translating these literals to English would decouple the parser from its input and cause extraction of the hospital name, report title, and highlighted fields to fail against real-world reports. Should the source reports be transitioned to an English-language format, the corresponding English keywords should be supplied so this logic can be updated accordingly.

## Citation

If you use IcareScan in your research, please cite the accompanying *SoftwareX* article (citation details will be updated upon publication):

> Tang H, Zhou X, Mo B, Wang H, Guo X, Peng Y, Liao Y, Huang J, Luo H, Li S. *IcareScan: A Tool for Automated Recognition and Structured Extraction of Clinical Laboratory Reports.* SoftwareX (submitted).

---

## License

This project is licensed under the **Apache License, Version 2.0** — see the [LICENSE](LICENSE) file for details.
