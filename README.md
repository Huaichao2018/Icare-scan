<p align="center">
  <img src="icon.png" alt="App icon" width="140" />
</p>

<h1 align="center">Icare Scan</h1>

<p align="center">
  An Android application for the automated digitization and structuring of clinical laboratory reports, intended to support downstream research in <em>clinical laboratory omics</em> (Clinlabomics).
</p>

<p align="center">
  <a href="https://github.com/Huaichao2018/Icare-scan/blob/main/com.icare.scan.apk.1.1.1">Download com.icare.scan.apk.1.1.1</a>
</p>

---

## Overview

Icare Scan is a mobile (Android) application designed to bridge the gap between unstructured, paper-based (or image-based) clinical laboratory reports and structured, machine-readable data suitable for quantitative research. By capturing a photograph of a conventional laboratory report, the application performs optical character recognition (OCR) and subsequent parsing to extract patient information, test items, and reference values into a structured schema. This addresses a common bottleneck in retrospective and prospective clinical laboratory data collection, where source reports are frequently distributed as printed documents or unstructured images rather than structured electronic records.

The resulting structured output is intended to facilitate downstream analyses in clinical laboratory omics (Clinlabomics) research, including cohort-level aggregation, longitudinal trend analysis, and integration with other structured clinical or -omics data sources.

## Platform

This application is distributed as a native Android package (`.apk`) and is intended for installation on Android mobile devices. It is not a web application, desktop application, or cross-platform build.

**Installation**

1. Download the package: [com.icare.scan.apk.1.1.1](https://github.com/Huaichao2018/Icare-scan/blob/main/com.icare.scan.apk.1.1.1)
2. Transfer the `.apk` file to an Android device, if not downloaded directly on-device.
3. Enable installation from unknown sources (if required by the device's Android version), and install the package.

## Core Workflow

1. **Image acquisition** — the user photographs a conventional laboratory report using the device camera, or selects an existing image.
2. **Optical character recognition** — the captured image is submitted to an OCR service, returning text content (including a Markdown-formatted table representation of tabular report data).
3. **Structured parsing** — the recognized text is parsed to extract the reporting institution, report title, patient/demographic fields, and the tabular panel of test items (analyte, result, reference range, and flags for out-of-range values).
4. **Local storage and export** — structured records are persisted locally (SQLite) and may be exported (e.g., to Excel) for further statistical or bioinformatic analysis.

## Project File Structure

The structure below was reconstructed from a source document in which multiple page components had been concatenated into a single file. File names and directories are inferred from each component's function and navigation context; they may not correspond exactly to the original repository layout.

```
project/
├── pages/
│   ├── index/
│   │   ├── index.vue        # Home / instructions page (navRecognize); "Start Scan" navigates to scanner
│   │   └── scanner.vue       # Scan records list (navScan, scroll-view + exportToExcel)
│   ├── records/
│   │   └── records.vue       # Records list (navRecords, mescroll pagination + selectExportType)
│   ├── plugins/
│   │   ├── addPage.vue       # Add/edit record page (navAddRecord, image upload + OCR recognition)
│   │   └── reportDetail.vue  # Report detail page (navReportDetail, parses markdown report + Excel export)
│   └── mine/
│       └── about.vue         # About / feedback / language switch page (navAbout)
└── common/
    ├── lang/
    │   └── i18n.js            # Chinese/English text configuration
    └── mixin/
        └── lang-mixin.js       # Language switching mixin ($lang method + switchLang)
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
