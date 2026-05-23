import * as XLSX from "xlsx";
import type { SpecLimits } from "./statistics";

export interface CharacteristicData {
  name: string;
  spec: SpecLimits;
  data: number[];
}

/**
 * 일괄 분석용 Excel 파일 파싱
 *
 * 파일 형식:
 *   행1: 레이블   | 특성1   | 특성2   | ...
 *   행2: LSL      | 29.95   | 15.00   | ...
 *   행3: Target   | 30.00   | 15.25   | ...  (선택)
 *   행4: USL      | 30.05   | 15.50   | ...
 *   행5+: 데이터  | 30.01   | 15.22   | ...
 *
 * Target 행은 생략 가능. 생략 시 행3을 USL로 인식.
 */
export function parseCapabilityExcel(file: ArrayBuffer): CharacteristicData[] {
  const wb = XLSX.read(file, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  if (rows.length < 4) throw new Error("파일 형식이 올바르지 않습니다. 최소 4행 필요.");

  // 첫 번째 열의 레이블로 행 구조 파악
  const labels = rows.map((r) =>
    String(r[0] ?? "").trim().toUpperCase()
  );

  let lslRow = -1;
  let targetRow = -1;
  let uslRow = -1;
  let dataStartRow = -1;

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    if ((label.includes("LSL") || label.includes("하한")) && lslRow === -1) lslRow = i;
    else if ((label.includes("TARGET") || label.includes("타겟") || label.includes("목표")) && targetRow === -1) targetRow = i;
    else if ((label.includes("USL") || label.includes("상한")) && uslRow === -1) uslRow = i;
    else if (label === "" || label.match(/^\d/)) {
      if (lslRow !== -1 && uslRow !== -1 && dataStartRow === -1) {
        dataStartRow = i;
      }
    }
  }

  // 자동 감지 실패 시 기본값: 행1=이름, 행2=LSL, (행3=Target,) 행4=USL, 행5+=데이터
  if (lslRow === -1) lslRow = 1;
  if (uslRow === -1) uslRow = targetRow !== -1 ? 3 : 2;
  if (dataStartRow === -1) dataStartRow = uslRow + 1;

  const nameRow = rows[0] as (string | null)[];
  const numCols = nameRow.length;

  const characteristics: CharacteristicData[] = [];

  for (let col = 1; col < numCols; col++) {
    const name = String(nameRow[col] ?? `특성${col}`).trim();
    if (!name) continue;

    const toNum = (row: number): number | undefined => {
      const v = rows[row]?.[col];
      const n = parseFloat(String(v ?? ""));
      return isNaN(n) ? undefined : n;
    };

    const spec: SpecLimits = {
      lsl: toNum(lslRow),
      target: targetRow !== -1 ? toNum(targetRow) : undefined,
      usl: toNum(uslRow),
    };

    const data: number[] = [];
    for (let row = dataStartRow; row < rows.length; row++) {
      const v = rows[row]?.[col];
      const n = parseFloat(String(v ?? ""));
      if (!isNaN(n)) data.push(n);
    }

    if (data.length > 0) {
      characteristics.push({ name, spec, data });
    }
  }

  if (characteristics.length === 0) {
    throw new Error("데이터를 찾을 수 없습니다. 파일 형식을 확인하세요.");
  }

  return characteristics;
}

/** 샘플 Excel 템플릿 다운로드 */
export function downloadTemplate(): void {
  const templateData = [
    ["구분",    "외경 (mm)", "내경 (mm)", "두께 (mm)"],
    ["LSL",     29.95,       15.00,       4.90      ],
    ["Target",  30.00,       15.25,       5.00      ],
    ["USL",     30.05,       15.50,       5.10      ],
    ["",        30.01,       15.22,       4.98      ],
    ["",        29.98,       15.30,       5.02      ],
    ["",        30.02,       15.18,       5.01      ],
    ["",        30.00,       15.25,       4.99      ],
    ["",        30.03,       15.27,       5.03      ],
    ["",        29.97,       15.20,       4.97      ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);
  ws["!cols"] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "공정능력분석");
  XLSX.writeFile(wb, "공정능력_분석_템플릿.xlsx");
}
