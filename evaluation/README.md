# IcareScan Multi-Hospital Evaluation Dataset

This directory contains the complete, de-identified, item-level evaluation dataset supporting the *SoftwareX* manuscript for **IcareScan** (`V1.1.1`).

## Files

1. **`evaluation_dataset.csv`** (3,610 rows across 187 clinical laboratory reports):
   - Covers **97 complete blood count (CBC)** and **90 biochemistry** reports from three hospitals:
     - Sichuan Cancer Hospital (`SC-001` to `SC-032`: 16 CBC, 16 Biochemistry; 673 target items)
     - Jintang First People's Hospital (`JT-001` to `JT-086`: 46 CBC, 40 Biochemistry; 1,646 target items)
     - Fushun People's Hospital (`FC-001` to `FC-035` CBC, `FB-001` to `FB-034` Biochemistry; 1,291 target items)
   - Columns: `Report_ID`, `Hospital`, `Report_Type`, `Test_Code`, `Extracted_Result`, `Verified_Reference`, `Abnormal_Flag`, `Evaluation_Status`, `Alias_Column`, `Alias_Extracted_Value`, `Notes`.
2. **`fushun_cbc_alias_columns.csv`** (35 rows):
   - Directly documents the 175 field-mapping mismatches in Fushun CBC reports: the predefined target columns (`Neu%`, `Neu#`, `Mon#`, `Eos#`, `Bas#`) remained blank while the dynamically appended alias columns (`NEUT%`, `NEUT#`, `MONO#`, `EO#`, `BASO#`) contained all 35 recognized numeric values each.

## Summary Metrics (Audited)

| Scope | Reports | Target Items ($M$) | Extracted ($M-D$) | Missing ($D$) | Discrepant ($E$) | Correct ($M-D-E$) | Completeness (%) | Accuracy Among Outputs (%) | Overall Match Rate (%) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Overall (3 hospitals)** | **187** | **3,610** | **3,423** | **187** | **12** | **3,411** | **94.82%** | **99.65%** | **94.49%** |
| CBC (pooled) | 97 | 2,324 | 2,148 | 176 | 0 | 2,148 | 92.43% | 100.00% | 92.43% |
| Biochemistry (pooled) | 90 | 1,286 | 1,275 | 11 | 12 | 1,263 | 99.14% | 99.06% | 98.21% |
| Sichuan Cancer Hospital | 32 | 673 | 673 | 0 | 1 | 672 | 100.00% | 99.85% | 99.85% |
| Jintang First People's Hospital | 86 | 1,646 | 1,644 | 2 | 4 | 1,640 | 99.88% | 99.76% | 99.64% |
| Fushun People's Hospital | 69 | 1,291 | 1,106 | 185 | 7 | 1,099 | 85.67% | 99.37% | 85.13% |

- **Adjacent-row merge discrepancies ($n=7$):** Seven Fushun Biochemistry entries (`FB-002`, `FB-012`, `FB-014`, `FB-017`, `FB-023`, `FB-032` for `TBIL`; `FB-022` for `DBIL`) concatenated two adjacent analytes (`A/G` + `TBIL` or `TBIL` + `DBIL`) into one cell; all seven are classified as discrepant outputs.
- **Analyzer placeholders ($n=9$):** Three Fushun CBC reports (`FC-018`, `FC-019`, `FC-021`) contained literal `'-'` placeholders printed by the hematology analyzer for uncalculated platelet indices (`MPV`, `PDW`, `P-LCR`). Preserved verbatim, they are retained as matched outputs in the primary analysis; a sensitivity analysis excluding these 9 non-numeric placeholders yields 94.81% completeness (3,414/3,601), 99.65% accuracy (3,402/3,414), and 94.47% overall match rate (3,402/3,601).
- **De-identification:** All patient names, hospital IDs, task bill numbers, and original image filenames have been removed and replaced with anonymous report IDs (`SC-001`, `JT-001`, `FC-001`, `FB-001`).
