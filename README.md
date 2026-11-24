<p align="center">
  <img src="icon.png" alt="IcareScan icon" width="140" />
</p>

<h1 align="center">IcareScan</h1>

<p align="center">
  An open-source Android application (UniApp / Vue 3 + SQLite) for automated optical character recognition (OCR) and rule-based structured extraction of clinical laboratory report images into Excel-compatible tables for retrospective research data preparation.
</p>

<p align="center">
  <a href="com.icare.scan.apk.1.1.1?raw=true">Download Android APK (V1.1.1)</a>
</p>

- **Current Release Version:** `V1.1.1` (matching Code Metadata C1 and `src/manifest.json` / `src/package.json` `1.1.1`)
- **License:** Apache License, Version 2.0 (`Apache-2.0`)
- **Support Email:** `luohc@uestc.edu.cn`

---

## 1. Overview

IcareScan bridges paper-based, photographed, or screenshot clinical laboratory reports and structured tabular datasets for clinical research and clinlabomics analyses. Users capture or import laboratory report images on Android, submit them for online OCR recognition, store task metadata and Markdown OCR outputs locally in SQLite, and export structured Excel-compatible tables for external manual verification and downstream analysis.

---

## 2. Core Workflow & Actual Capabilities

![IcareScan architecture and workflow](Workflow.png)

1. **Manual Pre-Upload De-identification (External User Prerequisite):**
   IcareScan **does not perform automatic image de-identification**. Users must mask or remove patient-identifying details (e.g., name, hospital ID) on paper or screen reports before capturing or importing images.
2. **Image Acquisition & Task Management (`src/pages/plugins/addPage.vue`):**
   Users create a task (assigned a unique 6-digit task ID `billNo`), capture or import up to 100 images from the camera or gallery, preview/remove images, save local drafts, or submit the task for OCR.
3. **Remote OCR Transmission (`src/config.js`, `src/pages/plugins/addPage.vue`):**
   Selected images are uploaded sequentially over **HTTPS** via `uni.uploadFile` (`POST` multipart form-data) to the configured backend relay service (`https://df.qlzwonline.com/api/SubDev/XfyunOcrService/xfyun` by default in `V1.1.1`), which forwards recognition requests to the external **iFLYTEK Open Platform OCR API** and returns a JSON payload containing recognized Markdown text.
4. **Local SQLite Storage (`src/db/sqlite.js`, `src/db/action.js`):**
   Task metadata (`report_record_new`), original base64 images and OCR Markdown responses (`report_record_img`), and predefined laboratory test codes (`report_inspection_items`, ~150 common analytes) are stored locally in an **unencrypted** SQLite database (`_downloads/report.db`).
5. **Client-Side Rule-Based Parsing & Excel Export (`src/pages/index/scanner.vue`):**
   Upon export, the client parses Markdown headings, colon-delimited key–value lines, and pipe-delimited tables (`| ... |`), matches analyte abbreviations against `report_inspection_items` (dynamically appending unrecognized abbreviations as new columns), extracts numeric values via regular expression (`/-?\d+(\.\d+)?/`), and writes an HTML-wrapped Excel table (`.xlsx`) to the Android public downloads directory (`plus.io.PUBLIC_DOWNLOADS`).
   - **Normal Export:** Exports one `.xlsx` file per task with **one row per report image** (`img_billNo`, `img_name`, and analyte columns).
   - **Merge Export:** Computes the **column-wise arithmetic mean** across all images in the task and exports a single summary row (`平均值`).
6. **External Manual Verification:**
   IcareScan does not include an in-app tabular value editor; users open the exported `.xlsx` file on a mobile viewer or desktop computer and verify or correct values against source images using the task and image sequence ID (`billNo_001`, etc.).

---

## 3. External OCR Service, Operator, and Data Terms

- **External OCR Service:** iFLYTEK Open Platform Document/Table OCR API (operated by iFLYTEK Co., Ltd.).
- **Intermediate Relay Operator:** Chengdu Qianli Zhiwai Technology Co., Ltd., affiliated with co-author Yong Liao.
- **Transport Protocol & Security Notice (`V1.1.1`):** Selected images are transmitted over **HTTPS** to the hosted relay endpoint (`https://df.qlzwonline.com/api/SubDev/XfyunOcrService/xfyun`), while local SQLite storage on the Android device is **unencrypted** (local AES-256 database encryption is planned for future releases). Because report images leave the device and are processed by an external third-party OCR provider (iFLYTEK), **only fully de-identified report images should be uploaded**, or institutional users can deploy their own HTTPS relay (see Section 4.5).
- **Service Terms & Availability:** The hosted relay endpoint is provided free of charge for non-commercial academic research and software evaluation on a best-effort basis, subject to upstream iFLYTEK API quotas and terms of service. The relay acts solely as a pass-through proxy to sign and forward requests to iFLYTEK and is not operated as a clinical data repository.

---

## 4. Build, Packaging, and Deployment Instructions

### 4.1 Quick Installation (Prebuilt Android APK)

1. Download the Android package: [com.icare.scan.apk.1.1.1](com.icare.scan.apk.1.1.1?raw=true).
2. Transfer the package to an Android device (Android 6.0+), if not downloaded directly on-device.
3. Enable installation from unknown sources if prompted by Android, and install the application.

### 4.2 Build Prerequisites (From Source)

- **HBuilderX** (App Development Edition, v3.9+ / v4.x recommended; https://www.dcloud.io/hbuilderx.html) — required because IcareScan uses UniApp `APP-PLUS` native HTML5+ modules (`plus.sqlite`, `plus.io`, `plus.android`, `Camera`).
- **Node.js** (v16+ / v18+ LTS) and **npm** (v8+).
- **Android device** (or Android emulator) running Android 6.0+ (`minSdkVersion = 23`, `targetSdkVersion = 30`).
- *(Optional, for offline native Android compilation)* **Android Studio / Android SDK** and the **DCloud UniApp Android Offline SDK**.

### 4.3 Local Source Setup

1. **Clone the repository and enter `src/`:**
   ```bash
   git clone https://github.com/Huaichao2018/Icare-scan.git
   cd Icare-scan/src
   ```
2. **Install JavaScript dependencies (`image-tools` and `xlsx`):**
   ```bash
   npm install
   ```
3. **Configure the OCR relay endpoint (optional):**
   Inspect [`src/config.js`](src/config.js):
   ```js
   export default {
     ocrApiUrl: 'https://df.qlzwonline.com/api/SubDev/XfyunOcrService/xfyun',
     feedbackApiUrl: 'https://df.qlzwonline.com/api/SubDev/XfyunOcrService/feedback/'
   }
   ```
   To use a self-hosted HTTPS relay or institutional OCR backend, update `ocrApiUrl` before packaging.

### 4.4 Building and Installing the Android Application

1. **Import `src/` into HBuilderX:**
   - Open **HBuilderX** → **File** → **Import** → **From Local Directory** and select `Icare-scan/src`.
   - Open `manifest.json` in HBuilderX and verify:
     - **Basic Config:** App Name = `IcareScan`, Version Name = `1.1.1`, Vue Version = **Vue 3** (if building under your own DCloud account, click **Re-acquire** next to `appid`).
     - **App Module Configuration:** **SQLite** and **Camera** are enabled.
     - **Android Permissions:** `CAMERA`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, and network state permissions are included.
2. **Run directly on a connected Android device (Debug Mode):**
   - Enable **USB Debugging** on the Android device and connect via USB.
   - In HBuilderX, click **Run** → **Run to Mobile App Emulator / Device** → **Run to Android App Base**.
3. **Build an installable Android APK (Release Packaging):**
   - **Option A — HBuilderX Cloud Packaging (recommended):**
     1. Click **Publish** → **Native App - Cloud Packaging** (requires a free DCloud developer account).
     2. Select **Android (APK)**, provide your Android signing certificate (`.keystore`) or select the DCloud public test certificate for evaluation, and click **Package**.
     3. Download the generated `.apk` once cloud compilation completes and install it on an Android device.
   - **Option B — Offline Local Packaging (Android Studio):**
     1. In HBuilderX, click **Publish** → **Native App - Local Packaging** to export compiled `www` resources under `src/unpackage/resources/`.
     2. Integrate the exported `www` directory into the DCloud Android Offline SDK project in Android Studio (including the `sqlite` and `camera` AAR libraries) and build via Gradle (`./gradlew assembleRelease`).

### 4.5 Deploying a Self-Hosted HTTPS OCR Relay (Optional / Recommended for Institutional Use)

This repository contains the full Android client source; the default relay service is hosted separately. Research teams requiring encrypted HTTPS transit and full institutional control over API credentials can deploy a minimal HTTPS relay server (e.g., behind Nginx/TLS using their own iFLYTEK Open Platform credentials or another OCR engine) implementing the following contract:

- **Request:** `POST` `multipart/form-data` with file field name `image` (`.jpg` / `.jpeg` / `.png` / `.bmp`).
- **Response (`200 OK`, `application/json`):**
  ```json
  {
    "code": 200,
    "data": {
      "code": 0,
      "data": "{\"document\":[{\"name\":\"markdown\",\"value\":\"# Example Hospital Laboratory Report\\n|Item|Result|\\n|--|--|\\n|WBC|6.5|\"}]}"
    }
  }
  ```
- Point `ocrApiUrl` in [`src/config.js`](src/config.js) to your `https://...` endpoint and rebuild the APK following Section 4.4.

---

## 5. Project File Structure

```text
Icare-scan/
├── LICENSE                       # Apache-2.0 license
├── README.md                     # Documentation, build, and deployment instructions
├── Workflow.png                  # Software architecture and processing workflow diagram
├── icon.png                      # Application icon
├── src/                          # Complete, buildable UniApp (Vue 3) Android client source
│   ├── App.vue                   # Application lifecycle & SQLite table initialization
│   ├── main.js                   # Vue 3 entry point & global i18n mixin registration
│   ├── config.js                 # Configurable OCR relay and feedback endpoints
│   ├── manifest.json             # UniApp / Android permissions, SQLite & Camera modules
│   ├── pages.json                # Application pages and tab-bar routing
│   ├── package.json              # NPM dependencies (image-tools, xlsx)
│   ├── db/
│   │   ├── sqlite.js             # HTML5+ SQLite wrapper (_downloads/report.db)
│   │   └── action.js             # CRUD operations for task, image, and item tables
│   ├── libs/
│   │   ├── i18n.js               # Bilingual (ZH/EN) UI text & accurate privacy disclosures
│   │   ├── lang.js               # Reactive language switcher mixin
│   │   └── resources.js          # Static asset path definitions
│   ├── pages/
│   │   ├── index/index.vue       # Startup instructions & predefined analyte dictionary seeding
│   │   ├── index/scanner.vue     # Task list, Markdown parser, Excel export (normal & averaged)
│   │   ├── plugins/addPage.vue   # Task creation, camera/gallery capture, OCR submission
│   │   ├── plugins/scanner.vue   # Legacy single-mode task view
│   │   ├── report/ocr-report.vue # Legacy single-report detail preview
│   │   └── regard/index.vue      # Language switching (ZH/EN) & feedback submission
│   ├── components/               # Shared UI components
│   ├── assets/ & static/         # Stylesheets, icon fonts, and static images
│   ├── uni_modules/ & uview-ui/  # Bundled UniApp & uView UI modules
│   └── unpackage/res/icons/      # Application launcher icons referenced by manifest.json
└── evaluation/                   # De-identified multi-hospital evaluation dataset (187 reports, 3,610 items)
    ├── README.md                 # Dataset schema and audited summary metrics
    ├── evaluation_dataset.csv    # Full item-level evaluation table across 3 hospitals
    └── fushun_cbc_alias_columns.csv # Raw alias-column outputs (NEUT%, NEUT#, MONO#, EO#, BASO#)
```

---

## 6. Notes on Localization

IcareScan offers both Chinese and English user interfaces. The current rule-based Markdown parser is tailored to Chinese-language clinical laboratory reports (matching Chinese headings and result-column labels such as `检验报告单` and `结果`). Supporting English-language laboratory reports requires extending and validating these parsing rules.

---

## 7. Multi-Hospital Evaluation Dataset (`evaluation/`)

The [`evaluation/`](evaluation/) directory provides the complete, de-identified, manually audited evaluation dataset across **187 laboratory reports** (97 CBC, 90 Biochemistry; **3,610 target items**) from Sichuan Cancer Hospital, Jintang First People's Hospital, and Fushun People's Hospital, together with the 35-report Fushun CBC alias-column verification table (`NEUT%`, `NEUT#`, `MONO#`, `EO#`, `BASO#`). See [`evaluation/README.md`](evaluation/README.md) for the schema and summary statistics.

---

## 8. Citation

If you use IcareScan in your research, please cite the accompanying *SoftwareX* article (citation details will be updated upon publication):

> Tang H, Zhou X, Mo B, Wang H, Guo X, Peng Y, Liao Y, Huang J, Luo H, Li S. *IcareScan: A Tool for Automated Recognition and Structured Extraction of Clinical Laboratory Reports.* SoftwareX (submitted).

---

## 9. License

This project is licensed under the **Apache License, Version 2.0** — see the [LICENSE](LICENSE) file for details.
