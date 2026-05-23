export interface GlossaryTerm {
  term: string;        // 표시 용어 (한글 또는 영문)
  abbr?: string;       // 약어 (예: SPC, FMEA)
  definition: string;  // 간단한 설명
  category: string;    // 분류 카테고리
  related?: string[];  // 연관 용어
}

export const GLOSSARY_CATEGORIES = [
  { id: "all",       label: "전체" },
  { id: "qms",       label: "품질경영시스템" },
  { id: "apqp",      label: "APQP·PPAP" },
  { id: "fmea",      label: "FMEA" },
  { id: "spc",       label: "SPC·공정능력" },
  { id: "msa",       label: "MSA·측정" },
  { id: "statistics",label: "통계" },
  { id: "sampling",  label: "샘플링·검사" },
  { id: "lean",      label: "린·생산" },
  { id: "6sigma",    label: "6시그마·DOE" },
  { id: "reliability",label: "신뢰성" },
  { id: "nc-capa",   label: "부적합·CAPA" },
  { id: "cost",      label: "품질비용" },
  { id: "tools",     label: "QC 도구" },
] as const;

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  // ─── 품질경영시스템 ─────────────────────────────────────────
  {
    term: "품질경영시스템",
    abbr: "QMS",
    definition: "조직의 품질 목표 달성을 위한 정책·프로세스·책임을 규정한 경영 시스템.",
    category: "qms",
    related: ["ISO 9001", "IATF 16949"],
  },
  {
    term: "ISO 9001",
    definition: "품질경영시스템 국제 표준. 고객 만족과 지속적 개선을 위한 요구사항을 정의한다.",
    category: "qms",
    related: ["IATF 16949", "QMS"],
  },
  {
    term: "IATF 16949",
    definition: "자동차 산업 품질경영시스템 표준. ISO 9001에 자동차 고객 특수 요구사항(CSR)을 추가한 규격.",
    category: "qms",
    related: ["ISO 9001", "CSR"],
  },
  {
    term: "내부심사",
    definition: "조직이 자체적으로 QMS가 요구사항에 적합한지 확인하는 정기 심사 활동.",
    category: "qms",
  },
  {
    term: "경영검토",
    definition: "최고경영자가 QMS의 적절성·충족성·효과성을 주기적으로 검토하는 활동.",
    category: "qms",
  },
  {
    term: "품질방침",
    definition: "최고경영자가 표명하는 품질에 관한 조직의 의도와 방향. 품질목표 수립의 기준.",
    category: "qms",
  },
  {
    term: "품질목표",
    definition: "품질방침에서 도출된, 측정 가능한 세부 목표. SMART 원칙에 따라 설정한다.",
    category: "qms",
  },
  {
    term: "문서화된 정보",
    definition: "ISO 9001:2015에서 '문서'와 '기록'을 통합한 용어. 유지(절차서)와 보유(기록)로 구분.",
    category: "qms",
  },
  {
    term: "고객별 특수 요구사항",
    abbr: "CSR",
    definition: "고객사가 ISO/IATF 외에 추가로 요구하는 특수 사항. 현대, GM, Toyota 등 각각 다르다.",
    category: "qms",
    related: ["IATF 16949"],
  },
  {
    term: "외부 공급자",
    definition: "조직에 제품·서비스·공정을 제공하는 외부 업체. IATF 16949에서는 협력업체 관리가 강조된다.",
    category: "qms",
  },
  {
    term: "비상 계획",
    definition: "설비 고장, 천재지변, 공급망 이슈 등 긴급 상황 시 품질·납기를 유지하기 위한 사전 대응 계획.",
    category: "qms",
  },
  {
    term: "적격성",
    definition: "특정 업무 수행에 필요한 교육·훈련·경험·기술 능력의 충족 여부.",
    category: "qms",
  },

  // ─── APQP / PPAP ───────────────────────────────────────────
  {
    term: "사전 제품 품질 계획",
    abbr: "APQP",
    definition: "제품 개발 초기부터 양산까지 품질을 체계적으로 계획하는 5단계 프로세스. DFMEA→PFMEA→관리계획→MSA→SPC 흐름.",
    category: "apqp",
    related: ["PPAP", "PFMEA", "관리계획서"],
  },
  {
    term: "양산 부품 승인 프로세스",
    abbr: "PPAP",
    definition: "협력업체가 설계·공정 변경 시 고객에게 제출하는 18가지 서류로 구성된 승인 프로세스.",
    category: "apqp",
    related: ["APQP", "PSW"],
  },
  {
    term: "양산 승인서",
    abbr: "PSW",
    definition: "PPAP 패키지의 핵심 문서. 협력업체 책임자가 서명하며 고객 승인 요청의 표지 역할.",
    category: "apqp",
    related: ["PPAP"],
  },
  {
    term: "관리계획서",
    abbr: "CP",
    definition: "공정의 각 단계에서 무엇을 어떻게 관리할지 명시한 문서. 제품특성·공정특성·관리 방법·반응계획 포함.",
    category: "apqp",
    related: ["PFMEA", "APQP"],
  },
  {
    term: "설계 검증 계획 및 보고서",
    abbr: "DVP&R",
    definition: "설계 검증 시험의 계획·기준·결과를 기록하는 문서. APQP 2단계 산출물.",
    category: "apqp",
  },
  {
    term: "기술 변경 통보",
    abbr: "ECN/ECR",
    definition: "설계 변경 사항을 공식화하는 문서. PPAP 재제출 여부를 결정하는 기준이 된다.",
    category: "apqp",
  },

  // ─── FMEA ──────────────────────────────────────────────────
  {
    term: "고장모드 및 영향 분석",
    abbr: "FMEA",
    definition: "제품·공정의 잠재 고장모드를 사전에 파악하고 위험을 평가·개선하는 분석 기법.",
    category: "fmea",
    related: ["DFMEA", "PFMEA", "RPN"],
  },
  {
    term: "설계 FMEA",
    abbr: "DFMEA",
    definition: "제품 설계 단계에서 설계 결함으로 인한 고장을 예방하기 위한 FMEA.",
    category: "fmea",
    related: ["PFMEA"],
  },
  {
    term: "공정 FMEA",
    abbr: "PFMEA",
    definition: "제조 공정에서 발생 가능한 고장모드를 분석하는 FMEA. 관리계획서와 연동된다.",
    category: "fmea",
    related: ["DFMEA", "관리계획서"],
  },
  {
    term: "위험 우선순위 수",
    abbr: "RPN",
    definition: "심각도(S) × 발생도(O) × 검출도(D)로 계산하는 위험 지표. 높을수록 우선 개선 필요. AIAG VDA에서는 AP로 대체.",
    category: "fmea",
    related: ["심각도", "발생도", "검출도", "AP"],
  },
  {
    term: "심각도",
    abbr: "S",
    definition: "FMEA에서 고장 영향이 고객에게 미치는 심각성. 1~10점 척도, 10이 가장 심각.",
    category: "fmea",
  },
  {
    term: "발생도",
    abbr: "O",
    definition: "FMEA에서 고장 원인이 발생할 빈도. 1~10점 척도, 10이 가장 자주 발생.",
    category: "fmea",
  },
  {
    term: "검출도",
    abbr: "D",
    definition: "FMEA에서 고장이 고객에게 전달되기 전에 검출할 수 있는 능력. 1~10점, 10이 검출 거의 불가.",
    category: "fmea",
  },
  {
    term: "조치 우선순위",
    abbr: "AP",
    definition: "AIAG VDA FMEA 방법론에서 RPN 대신 사용하는 개선 우선순위 지표. H/M/L 3단계.",
    category: "fmea",
    related: ["RPN"],
  },
  {
    term: "특별특성",
    abbr: "SC",
    definition: "안전, 법규, 기능에 영향을 미치는 제품·공정 특성. 관리계획서에 별도 표시하고 강화된 관리 적용.",
    category: "fmea",
  },
  {
    term: "고장모드",
    definition: "제품·공정이 의도한 기능을 수행하지 못하는 방식. FMEA 분석의 출발점.",
    category: "fmea",
  },
  {
    term: "고장 원인",
    definition: "고장모드가 발생하는 이유. FMEA에서 발생도와 예방 관리가 여기에 연결된다.",
    category: "fmea",
  },
  {
    term: "예방 관리",
    definition: "FMEA에서 고장 원인이 발생하지 않도록 막는 관리 활동.",
    category: "fmea",
    related: ["검출 관리"],
  },
  {
    term: "검출 관리",
    definition: "FMEA에서 고장이 다음 공정·고객에게 전달되기 전에 발견하는 관리 활동.",
    category: "fmea",
    related: ["예방 관리"],
  },

  // ─── SPC / 공정능력 ─────────────────────────────────────────
  {
    term: "통계적 공정 관리",
    abbr: "SPC",
    definition: "통계적 방법으로 공정을 실시간 모니터링하여 이상 변동을 조기에 감지하는 기법.",
    category: "spc",
    related: ["관리도", "Cp", "Cpk"],
  },
  {
    term: "관리도",
    definition: "공정 데이터를 시간 순서로 타점하여 UCL·LCL 이탈 여부로 공정 이상을 감지하는 차트.",
    category: "spc",
    related: ["UCL", "LCL"],
  },
  {
    term: "관리 상한선",
    abbr: "UCL",
    definition: "관리도에서 공정이 관리 상태일 때 데이터가 벗어나지 않아야 할 상한. 보통 평균 +3σ.",
    category: "spc",
  },
  {
    term: "관리 하한선",
    abbr: "LCL",
    definition: "관리도에서 공정이 관리 상태일 때 데이터가 벗어나지 않아야 할 하한. 보통 평균 -3σ.",
    category: "spc",
  },
  {
    term: "이상 원인",
    definition: "공정 외부에서 유입된 특별한 요인으로 인한 비정상 변동. 관리도에서 규칙 위반으로 감지된다.",
    category: "spc",
    related: ["우연 원인"],
  },
  {
    term: "우연 원인",
    definition: "공정에 내재된 정상적인 변동 요인. 제거하려면 공정 자체를 바꿔야 한다.",
    category: "spc",
    related: ["이상 원인"],
  },
  {
    term: "Xbar-R 관리도",
    definition: "소 집단 평균(Xbar)과 범위(R)를 동시에 관리하는 계량형 관리도. 가장 많이 쓰인다.",
    category: "spc",
  },
  {
    term: "p 관리도",
    definition: "부분군 내 불량률(p)을 관리하는 계수형 관리도. 부분군 크기가 달라도 사용 가능.",
    category: "spc",
  },
  {
    term: "c 관리도",
    definition: "단위 당 결점 수(c)를 관리하는 계수형 관리도. 부분군 크기가 일정할 때 사용.",
    category: "spc",
  },
  {
    term: "공정능력지수",
    abbr: "Cp",
    definition: "규격 공차(USL-LSL)를 6σ(공정 산포)로 나눈 값. 치우침을 고려하지 않는다. Cp ≥ 1.33이 일반 기준.",
    category: "spc",
    related: ["Cpk", "USL", "LSL"],
  },
  {
    term: "수정 공정능력지수",
    abbr: "Cpk",
    definition: "Cp에 치우침을 반영한 지수. min(Cpu, Cpl)로 계산. 1.33 이상이면 양호.",
    category: "spc",
    related: ["Cp"],
  },
  {
    term: "예비 공정능력지수",
    abbr: "Pp",
    definition: "초기 양산 또는 단기 데이터로 계산한 공정능력지수. Cp와 달리 총 표준편차를 사용.",
    category: "spc",
    related: ["Ppk", "Cp"],
  },
  {
    term: "규격 상한",
    abbr: "USL",
    definition: "제품·공정 특성의 허용 최댓값. 이를 초과하면 불합격.",
    category: "spc",
  },
  {
    term: "규격 하한",
    abbr: "LSL",
    definition: "제품·공정 특성의 허용 최솟값. 이 미만이면 불합격.",
    category: "spc",
  },
  {
    term: "런 규칙",
    definition: "관리도에서 이상 징후를 판정하는 규칙 모음. Nelson, Western Electric 규칙 등. 예: 9점 연속 중심선 편향.",
    category: "spc",
  },

  // ─── MSA / 측정 ─────────────────────────────────────────────
  {
    term: "측정 시스템 분석",
    abbr: "MSA",
    definition: "측정 시스템의 변동(반복성·재현성·정확도 등)을 통계적으로 평가하여 측정 신뢰성을 확인하는 기법.",
    category: "msa",
    related: ["GR&R", "반복성", "재현성"],
  },
  {
    term: "게이지 반복성 및 재현성",
    abbr: "GR&R",
    definition: "동일 측정기로 반복 측정 시 나타나는 변동(반복성)과 측정자 간 차이(재현성)의 합산 변동.",
    category: "msa",
    related: ["반복성", "재현성"],
  },
  {
    term: "반복성",
    definition: "동일 작업자가 동일 측정기·부품을 반복 측정할 때 나타나는 변동. EV(Equipment Variation).",
    category: "msa",
    related: ["재현성"],
  },
  {
    term: "재현성",
    definition: "서로 다른 작업자가 동일 측정기·부품을 측정할 때 나타나는 작업자 간 변동. AV(Appraiser Variation).",
    category: "msa",
    related: ["반복성"],
  },
  {
    term: "정확도",
    abbr: "Bias",
    definition: "측정 평균값과 참값(기준값) 사이의 차이. 편의라고도 한다.",
    category: "msa",
  },
  {
    term: "직선성",
    definition: "측정 범위 전반에 걸쳐 정확도가 일정한지를 나타내는 MSA 지표.",
    category: "msa",
  },
  {
    term: "안정성",
    definition: "시간 경과에 따라 측정 시스템의 변동이 일정하게 유지되는 정도.",
    category: "msa",
  },
  {
    term: "구별 범주 수",
    abbr: "NDC",
    definition: "측정 시스템이 제품 변동을 구별할 수 있는 범주 수. 5 이상이면 적합.",
    category: "msa",
  },
  {
    term: "교정",
    definition: "측정기를 국가 기준에 소급되는 기준기와 비교하여 오차를 확인·조정하는 활동.",
    category: "msa",
    related: ["소급성"],
  },
  {
    term: "소급성",
    definition: "측정값이 끊김 없는 비교 사슬을 통해 국가·국제 측정 표준까지 연결되는 성질.",
    category: "msa",
    related: ["교정"],
  },
  {
    term: "3차원 측정기",
    abbr: "CMM",
    definition: "x·y·z 축으로 제품의 치수·형상을 측정하는 정밀 측정 장비.",
    category: "msa",
  },

  // ─── 통계 ───────────────────────────────────────────────────
  {
    term: "평균",
    definition: "데이터 합계를 데이터 수로 나눈 값. 가장 기본적인 대푯값.",
    category: "statistics",
  },
  {
    term: "중앙값",
    definition: "정렬된 데이터에서 정가운데 위치하는 값. 이상치에 강건하다.",
    category: "statistics",
  },
  {
    term: "표준편차",
    abbr: "σ (또는 s)",
    definition: "데이터가 평균으로부터 얼마나 퍼져 있는지 나타내는 값. 분산의 제곱근.",
    category: "statistics",
    related: ["분산"],
  },
  {
    term: "분산",
    definition: "각 데이터와 평균의 차이를 제곱하여 평균한 값. 산포를 나타낸다.",
    category: "statistics",
    related: ["표준편차"],
  },
  {
    term: "범위",
    abbr: "R",
    definition: "데이터의 최댓값과 최솟값의 차이. 계산이 단순해 관리도에서 자주 사용.",
    category: "statistics",
  },
  {
    term: "변동계수",
    abbr: "CV",
    definition: "표준편차를 평균으로 나눈 비율(%). 단위가 다른 데이터의 산포를 비교할 때 유용.",
    category: "statistics",
  },
  {
    term: "정규분포",
    definition: "평균을 중심으로 종 모양의 대칭 분포. 자연현상과 제조 데이터에서 가장 많이 나타난다.",
    category: "statistics",
  },
  {
    term: "중심극한정리",
    abbr: "CLT",
    definition: "모집단 분포 형태와 무관하게 표본 크기가 충분히 크면(n≥30) 표본 평균이 정규분포를 따른다는 정리.",
    category: "statistics",
  },
  {
    term: "t 분포",
    definition: "소표본(n<30) 또는 모집단 표준편차를 모를 때 사용하는 분포. 자유도가 클수록 정규분포에 가까워진다.",
    category: "statistics",
  },
  {
    term: "F 분포",
    definition: "두 집단의 분산 비교(F 검정)나 분산 분석(ANOVA)에 사용되는 분포.",
    category: "statistics",
    related: ["ANOVA"],
  },
  {
    term: "카이제곱 분포",
    abbr: "χ²",
    definition: "분산 검정, 적합도 검정, 독립성 검정에 사용하는 분포.",
    category: "statistics",
  },
  {
    term: "이항분포",
    definition: "성공·실패 두 결과만 있는 반복 시행에서 성공 횟수의 분포. p 관리도의 이론적 기반.",
    category: "statistics",
  },
  {
    term: "포아송 분포",
    definition: "일정 단위(면적·시간·개수)당 사건 발생 횟수의 분포. c·u 관리도의 이론적 기반.",
    category: "statistics",
  },
  {
    term: "가설검정",
    definition: "표본 데이터를 근거로 모집단에 관한 통계적 가설의 채택·기각을 결정하는 절차.",
    category: "statistics",
    related: ["p-값", "1종 오류", "2종 오류"],
  },
  {
    term: "p-값",
    definition: "귀무가설(H₀)이 참이라는 전제 하에, 현재 데이터보다 극단적인 결과가 나올 확률. 보통 0.05 미만이면 유의.",
    category: "statistics",
    related: ["가설검정"],
  },
  {
    term: "1종 오류",
    abbr: "α 오류",
    definition: "귀무가설이 참인데 잘못 기각하는 오류. 생산자 위험. 유의수준(α)으로 통제.",
    category: "statistics",
  },
  {
    term: "2종 오류",
    abbr: "β 오류",
    definition: "귀무가설이 거짓인데 채택하는 오류. 소비자 위험. 검정력(1-β)을 높이면 감소.",
    category: "statistics",
  },
  {
    term: "상관계수",
    abbr: "r",
    definition: "두 변수 사이의 선형 관계 강도와 방향을 -1~+1로 나타내는 지수.",
    category: "statistics",
    related: ["회귀분석"],
  },
  {
    term: "회귀분석",
    definition: "독립변수(x)와 종속변수(y) 사이의 관계를 수식으로 모델링하는 통계 기법.",
    category: "statistics",
    related: ["상관계수"],
  },
  {
    term: "결정계수",
    abbr: "R²",
    definition: "회귀모델이 실제 데이터 변동을 얼마나 설명하는지 나타내는 지표. 0~1, 1에 가까울수록 좋다.",
    category: "statistics",
  },

  // ─── 샘플링 / 검사 ──────────────────────────────────────────
  {
    term: "합격 품질 수준",
    abbr: "AQL",
    definition: "샘플링 검사에서 합격 판정을 받을 수 있는 최대 불량률 기준.",
    category: "sampling",
    related: ["LTPD", "OC 곡선"],
  },
  {
    term: "로트 허용 불량률",
    abbr: "LTPD",
    definition: "소비자가 허용하는 최대 불량률. 이를 초과하는 로트는 불합격 확률이 높다.",
    category: "sampling",
    related: ["AQL"],
  },
  {
    term: "검사 특성 곡선",
    abbr: "OC 곡선",
    definition: "로트 불량률에 따른 합격 확률을 나타내는 곡선. 샘플링 검사 계획의 성능을 시각화.",
    category: "sampling",
  },
  {
    term: "계수형 검사",
    definition: "제품을 합격·불합격으로 판정하는 검사 방식. KS Q ISO 2859 적용.",
    category: "sampling",
  },
  {
    term: "계량형 검사",
    definition: "제품 특성을 수치로 측정하여 판정하는 검사. KS Q ISO 3951 적용.",
    category: "sampling",
  },
  {
    term: "생산자 위험",
    abbr: "α",
    definition: "좋은 로트가 불합격될 확률. 1종 오류. 보통 5%.",
    category: "sampling",
  },
  {
    term: "소비자 위험",
    abbr: "β",
    definition: "나쁜 로트가 합격될 확률. 2종 오류. 보통 10%.",
    category: "sampling",
  },
  {
    term: "전수검사",
    definition: "로트 내 모든 제품을 검사하는 방식. 비용이 높지만 중요 안전부품에 적용.",
    category: "sampling",
  },

  // ─── 린 생산 ────────────────────────────────────────────────
  {
    term: "가치흐름지도",
    abbr: "VSM",
    definition: "원재료부터 고객까지 자재·정보의 흐름을 한 장으로 표현한 지도. 낭비를 시각화한다.",
    category: "lean",
    related: ["린", "7대 낭비"],
  },
  {
    term: "7대 낭비",
    abbr: "Muda",
    definition: "린에서 제거해야 할 7가지 낭비: 과잉생산·대기·운반·과잉가공·재고·동작·불량. 8번째로 미활용 인재를 추가하기도 한다.",
    category: "lean",
    related: ["린"],
  },
  {
    term: "5S",
    definition: "정리(Seiri)·정돈(Seiton)·청소(Seiso)·청결(Seiketsu)·습관화(Shitsuke). 작업장 표준화의 기초.",
    category: "lean",
  },
  {
    term: "택트 타임",
    abbr: "Takt Time",
    definition: "고객 수요를 맞추기 위해 한 제품을 완성해야 하는 목표 시간. = 가용 시간 ÷ 고객 요구 수량.",
    category: "lean",
    related: ["사이클 타임"],
  },
  {
    term: "사이클 타임",
    abbr: "CT",
    definition: "작업자 또는 설비가 한 제품을 완성하는 데 실제로 걸리는 시간.",
    category: "lean",
    related: ["택트 타임"],
  },
  {
    term: "리드 타임",
    abbr: "LT",
    definition: "고객 주문부터 납품까지 걸리는 전체 시간. 낭비 제거를 통해 단축한다.",
    category: "lean",
  },
  {
    term: "적시 생산",
    abbr: "JIT",
    definition: "필요한 것을, 필요한 때에, 필요한 양만 생산하는 방식. 재고를 최소화한다.",
    category: "lean",
  },
  {
    term: "칸반",
    definition: "생산 또는 자재 보충 신호 역할을 하는 카드·신호 시스템. 풀(Pull) 방식 생산의 핵심 도구.",
    category: "lean",
  },
  {
    term: "설비 종합 효율",
    abbr: "OEE",
    definition: "설비 가용률 × 성능률 × 품질률로 계산하는 설비 효율 종합 지표. 세계 수준은 85% 이상.",
    category: "lean",
  },
  {
    term: "포카요케",
    abbr: "Poka-Yoke",
    definition: "작업자 실수를 물리적·기계적으로 예방하거나 즉시 감지하는 장치. 실수 방지(Mistake Proofing).",
    category: "lean",
  },
  {
    term: "안돈",
    definition: "생산라인에서 이상 발생 시 라인을 정지시키고 관리자·팀원에게 알리는 시각·청각 신호 시스템.",
    category: "lean",
  },
  {
    term: "헤이준카",
    definition: "생산량과 품종을 고르게 분산하여 부하를 평준화하는 방식.",
    category: "lean",
  },
  {
    term: "카이젠",
    definition: "전원이 참여하는 지속적이고 점진적인 개선 활동.",
    category: "lean",
  },
  {
    term: "풀 시스템",
    definition: "후공정의 소비 신호에 따라 전공정이 생산하는 방식. 과잉생산을 방지한다.",
    category: "lean",
    related: ["칸반"],
  },

  // ─── 6시그마 / DOE ───────────────────────────────────────────
  {
    term: "DMAIC",
    definition: "6시그마 문제 해결 프로세스: 정의(Define)→측정(Measure)→분석(Analyze)→개선(Improve)→관리(Control).",
    category: "6sigma",
  },
  {
    term: "품질 핵심 인자",
    abbr: "CTQ",
    definition: "고객 관점에서 품질에 결정적 영향을 미치는 특성. VOC에서 도출한다.",
    category: "6sigma",
    related: ["VOC"],
  },
  {
    term: "분산 분석",
    abbr: "ANOVA",
    definition: "세 집단 이상의 평균을 동시에 비교하는 통계 기법. F 통계량을 이용한다.",
    category: "6sigma",
    related: ["F 분포"],
  },
  {
    term: "실험계획법",
    abbr: "DOE",
    definition: "입력 변수(요인)와 출력(반응) 간 관계를 효율적으로 파악하기 위한 실험 설계·분석 방법론.",
    category: "6sigma",
  },
  {
    term: "완전요인배치법",
    definition: "모든 요인의 모든 수준 조합을 실험하는 방법. 교호작용을 완전히 추정할 수 있다.",
    category: "6sigma",
  },
  {
    term: "부분요인배치법",
    definition: "완전요인배치 중 일부 실험만 수행하는 방법. 실험 횟수를 줄이되 일부 교호작용 정보를 포기.",
    category: "6sigma",
  },
  {
    term: "교호작용",
    definition: "두 요인이 결합했을 때 각각의 단순 효과 합산과 다른 추가적 효과. DOE에서 중요한 분석 대상.",
    category: "6sigma",
  },
  {
    term: "다구찌 방법",
    definition: "잡음(noise) 인자에 강건한 제품·공정을 설계하는 방법론. S/N 비로 최적 조건을 선정한다.",
    category: "6sigma",
    related: ["S/N 비"],
  },
  {
    term: "S/N 비",
    definition: "다구찌 방법에서 신호(목표)와 잡음(변동)의 비. 클수록 잡음에 강건하다. 망목·망소·망대 특성별로 공식이 다르다.",
    category: "6sigma",
  },
  {
    term: "망목특성",
    definition: "목표값을 중심으로 산포를 최소화해야 하는 품질 특성. 예: 치수, 저항값.",
    category: "6sigma",
  },
  {
    term: "망소특성",
    definition: "작을수록 좋은 품질 특성. 예: 불량률, 오차, 마모량.",
    category: "6sigma",
  },
  {
    term: "망대특성",
    definition: "클수록 좋은 품질 특성. 예: 강도, 수명, 효율.",
    category: "6sigma",
  },
  {
    term: "블랙벨트",
    abbr: "BB",
    definition: "6시그마 프로젝트를 전담 수행하는 고급 전문가. DMAIC 전 과정을 이끈다.",
    category: "6sigma",
  },
  {
    term: "중심합성계획법",
    abbr: "CCD",
    definition: "2ᵏ 완전요인배치에 중심점·축점을 추가한 반응표면 분석용 실험 계획.",
    category: "6sigma",
  },

  // ─── 신뢰성 ─────────────────────────────────────────────────
  {
    term: "신뢰도",
    definition: "규정된 조건에서 정해진 기간 동안 요구 기능을 수행할 확률. R(t)로 표현.",
    category: "reliability",
  },
  {
    term: "평균 고장 간격",
    abbr: "MTBF",
    definition: "수리 가능한 시스템에서 연속적인 고장 사이의 평균 작동 시간.",
    category: "reliability",
    related: ["MTTF", "MTTR"],
  },
  {
    term: "평균 고장 시간",
    abbr: "MTTF",
    definition: "수리 불가능한 부품·시스템이 최초 고장까지 걸리는 평균 시간.",
    category: "reliability",
    related: ["MTBF"],
  },
  {
    term: "평균 수리 시간",
    abbr: "MTTR",
    definition: "고장 발생부터 수리 완료까지 걸리는 평균 시간.",
    category: "reliability",
    related: ["MTBF"],
  },
  {
    term: "욕조 곡선",
    definition: "시간에 따른 고장률 변화를 보여주는 곡선. 초기 고장(감소)→우발 고장(일정)→마모 고장(증가) 3단계.",
    category: "reliability",
  },
  {
    term: "와이블 분포",
    definition: "형상 모수(β)를 조정하여 다양한 고장 패턴을 표현할 수 있는 분포. 신뢰성 분석의 대표 분포.",
    category: "reliability",
  },
  {
    term: "결함 나무 분석",
    abbr: "FTA",
    definition: "최상위 바람직하지 않은 사건(Top Event)에서 원인을 AND/OR 논리로 역추적하는 분석 기법.",
    category: "reliability",
    related: ["FMEA"],
  },
  {
    term: "가속 수명 시험",
    abbr: "ALT",
    definition: "온도·진동·전압 등을 가혹하게 높여 단시간에 제품 수명을 평가하는 시험.",
    category: "reliability",
  },
  {
    term: "가용도",
    definition: "시스템이 요구된 시점에 정상 작동 중인 시간 비율. MTBF÷(MTBF+MTTR).",
    category: "reliability",
  },

  // ─── 부적합 / CAPA ──────────────────────────────────────────
  {
    term: "부적합",
    abbr: "NC",
    definition: "요구사항(규격·표준·절차)을 충족하지 못한 상태 또는 제품.",
    category: "nc-capa",
    related: ["시정조치", "CAPA"],
  },
  {
    term: "시정조치 및 예방조치",
    abbr: "CAPA",
    definition: "발생한 부적합의 재발 방지(시정조치)와 잠재 부적합의 사전 차단(예방조치)을 통합한 개선 활동.",
    category: "nc-capa",
    related: ["부적합", "8D"],
  },
  {
    term: "8D 보고서",
    abbr: "8D",
    definition: "8단계 문제 해결 프로세스: D1 팀 구성→D2 문제 기술→D3 응급조치→D4 근본 원인→D5 시정조치→D6 적용→D7 예방→D8 완료.",
    category: "nc-capa",
  },
  {
    term: "특채",
    abbr: "Concession",
    definition: "규격을 벗어난 부적합 제품을 그대로 사용하도록 고객이 일시적으로 승인하는 것.",
    category: "nc-capa",
  },
  {
    term: "재작업",
    abbr: "Rework",
    definition: "부적합 제품을 원래 요구사항 내로 복원하는 처리. 합격 판정 후 출하 가능.",
    category: "nc-capa",
  },
  {
    term: "수리",
    abbr: "Repair",
    definition: "부적합 제품의 기능을 복구하지만 원래 요구사항에 완전히 적합하지는 않은 처리.",
    category: "nc-capa",
  },
  {
    term: "근본 원인 분석",
    abbr: "RCA",
    definition: "문제가 발생한 근본적인 이유를 체계적으로 파악하는 활동. 5Why, 특성요인도 등을 사용.",
    category: "nc-capa",
    related: ["5Why", "특성요인도"],
  },
  {
    term: "5Why",
    definition: "'왜?'를 최소 5번 반복하여 표면 현상에서 근본 원인까지 파고드는 단순하고 강력한 기법.",
    category: "nc-capa",
    related: ["근본 원인 분석"],
  },
  {
    term: "4M",
    definition: "불량 원인 분류 체계: Man(사람)·Machine(설비)·Material(재료)·Method(방법). 변경관리에도 동일 분류 사용.",
    category: "nc-capa",
    related: ["특성요인도"],
  },
  {
    term: "현장 반환 부품",
    definition: "고객 필드에서 반환된 불량 부품. 실제 사용 조건에서 나타난 고장 분석에 핵심 자료.",
    category: "nc-capa",
  },

  // ─── 품질 비용 ───────────────────────────────────────────────
  {
    term: "품질 비용",
    abbr: "COQ",
    definition: "품질 관련 모든 비용. 예방 비용 + 평가 비용 + 내부 실패 비용 + 외부 실패 비용.",
    category: "cost",
    related: ["PAF 모델"],
  },
  {
    term: "PAF 모델",
    definition: "품질 비용을 예방(Prevention)·평가(Appraisal)·실패(Failure) 세 범주로 분류하는 모델.",
    category: "cost",
  },
  {
    term: "예방 비용",
    definition: "불량이 발생하지 않도록 사전에 투자하는 비용. 교육·FMEA·SPC 구축 등.",
    category: "cost",
  },
  {
    term: "평가 비용",
    definition: "제품·공정이 요구사항을 만족하는지 확인하는 비용. 검사·시험·교정 등.",
    category: "cost",
  },
  {
    term: "내부 실패 비용",
    definition: "출하 전에 발견된 불량의 처리 비용. 폐기·재작업·재검사 등.",
    category: "cost",
  },
  {
    term: "외부 실패 비용",
    definition: "고객에게 전달된 불량으로 인한 비용. 클레임 처리·반품·리콜·보증 수리 등.",
    category: "cost",
  },

  // ─── QC 도구 ─────────────────────────────────────────────────
  {
    term: "특성요인도",
    abbr: "Fishbone / Ishikawa",
    definition: "문제(결과)에 영향하는 원인을 4M(또는 6M) 뼈대 구조로 분류·시각화하는 도구.",
    category: "tools",
    related: ["4M", "5Why"],
  },
  {
    term: "파레토 차트",
    definition: "항목을 발생 빈도 내림차순으로 나열한 막대그래프와 누적 비율 선의 조합. 80%를 차지하는 핵심 원인 20%를 파악.",
    category: "tools",
  },
  {
    term: "히스토그램",
    definition: "데이터의 도수 분포를 막대그래프로 나타낸 것. 분포 형태·치우침·이봉 분포 등을 시각적으로 확인.",
    category: "tools",
  },
  {
    term: "산점도",
    definition: "두 변수 사이의 관계를 점으로 표시한 그래프. 상관 관계와 이상점을 확인한다.",
    category: "tools",
    related: ["상관계수"],
  },
  {
    term: "체크시트",
    definition: "데이터를 현장에서 체계적으로 수집·집계하기 위한 양식. 불량 유형별 빈도 기록 등에 사용.",
    category: "tools",
  },
  {
    term: "층별",
    definition: "수집한 데이터를 기계·작업자·시간·재료 등으로 그룹을 나누어 차이를 분석하는 방법.",
    category: "tools",
  },
  {
    term: "품질기능전개",
    abbr: "QFD",
    definition: "고객 요구(VOC)를 제품 특성·부품 특성·공정 특성으로 단계별로 변환하는 기법.",
    category: "tools",
    related: ["HOQ", "VOC"],
  },
  {
    term: "품질의 집",
    abbr: "HOQ",
    definition: "QFD에서 VOC와 제품 특성을 매트릭스로 연결한 핵심 분석 도구.",
    category: "tools",
    related: ["QFD"],
  },
  {
    term: "고객의 소리",
    abbr: "VOC",
    definition: "고객이 제품·서비스에서 원하는 것을 표현한 요구사항. QFD 입력 데이터.",
    category: "tools",
    related: ["QFD"],
  },
  {
    term: "친화도",
    abbr: "KJ법",
    definition: "신 QC 7가지 도구 중 하나. 다수의 아이디어·사실을 친화성에 따라 그룹화하는 기법.",
    category: "tools",
  },
  {
    term: "연관도",
    definition: "복잡한 문제에서 원인과 결과의 논리적 관계를 화살표로 연결하여 시각화하는 도구.",
    category: "tools",
  },
  {
    term: "계통도",
    definition: "목표 달성을 위한 수단·방법을 계층 구조로 전개하여 실행 과제를 구체화하는 도구.",
    category: "tools",
  },
  {
    term: "전원 참여 생산 보전",
    abbr: "TPM",
    definition: "작업자부터 관리자까지 전원이 참여하여 설비 고장 제로, 불량 제로, 재해 제로를 추구하는 활동.",
    category: "tools",
    related: ["OEE", "자주 보전"],
  },
  {
    term: "자주 보전",
    definition: "TPM에서 작업자가 직접 수행하는 일상 청소·점검·급유·조임 활동. 작업자의 설비 주인 의식 함양.",
    category: "tools",
  },
];

/** 정렬: 가나다 → 알파벳 → 숫자 순 (용어 기준) */
export function getSortedTerms(terms: GlossaryTerm[]): GlossaryTerm[] {
  return [...terms].sort((a, b) =>
    a.term.localeCompare(b.term, "ko", { sensitivity: "base" })
  );
}

/** 초성 또는 알파벳 첫 글자 추출 */
export function getInitial(term: string): string {
  const ch = term.charAt(0);
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    // 한글 초성 19자 전체 (ㄲ·ㄸ·ㅃ·ㅆ·ㅉ 포함)
    const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    const idx = Math.floor((code - 0xac00) / 28 / 21);
    // 된소리 → 예사소리로 통합 (ㄲ→ㄱ, ㄸ→ㄷ, ㅃ→ㅂ, ㅆ→ㅅ, ㅉ→ㅈ)
    const NORMALIZE: Record<string, string> = {
      ㄲ:"ㄱ", ㄸ:"ㄷ", ㅃ:"ㅂ", ㅆ:"ㅅ", ㅉ:"ㅈ",
    };
    const cho = CHO[idx] ?? "기타";
    return NORMALIZE[cho] ?? cho;
  }
  if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  if (/[0-9]/.test(ch)) return "#";
  return "기타";
}
