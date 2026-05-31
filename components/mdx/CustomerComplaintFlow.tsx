"use client";

export function CustomerComplaintFlow() {
  return (
    <div className="not-prose my-8 overflow-x-auto">
      <div className="rounded-2xl border border-border bg-white px-4 py-5">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-gray-600 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-sm bg-orange-50 border border-orange-400 shrink-0" />
            품질팀 주도
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-sm bg-blue-50 border border-blue-400 shrink-0" />
            생산팀 실행
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-3 rounded-sm bg-red-50 border border-red-300 shrink-0" />
            경영보고(긴급)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rotate-45 bg-white border border-gray-400 shrink-0" />
            의사결정
          </span>
          <span className="text-gray-400 italic">* 설계 포함 시 조건부 적용</span>
        </div>

        <svg
          viewBox="0 0 640 892"
          width="100%"
          style={{ maxWidth: 520, display: "block", margin: "0 auto", fontFamily: "Pretendard, -apple-system, sans-serif" }}
          aria-label="고객 불만 처리 프로세스 흐름도 (8D 기반)"
        >
          <defs>
            <marker id="ccf-ar" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill="#9CA3AF" />
            </marker>
            <marker id="ccf-ar-red" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 7 3, 0 6" fill="#FCA5A5" />
            </marker>
          </defs>

          {/* ═══════════ ARROWS ═══════════ */}

          {/* START → P1 */}
          <line x1="230" y1="50" x2="230" y2="68" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* P1 → Diamond1 */}
          <line x1="230" y1="131" x2="230" y2="155" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* Diamond1 RIGHT → Urgency (긴급) */}
          <line x1="286" y1="182" x2="413" y2="182" stroke="#FCA5A5" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#ccf-ar-red)" />

          {/* Diamond1 DOWN → P2 (일반) */}
          <line x1="230" y1="209" x2="230" y2="231" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* P2 → P3 */}
          <line x1="230" y1="299" x2="230" y2="326" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* P3 → P4 */}
          <line x1="230" y1="408" x2="230" y2="431" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* P4 → P5 */}
          <line x1="230" y1="493" x2="230" y2="518" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* P5 → Diamond2 */}
          <line x1="230" y1="580" x2="230" y2="605" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* Diamond2 DOWN → P6 (합격) */}
          <line x1="230" y1="657" x2="230" y2="677" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* Diamond2 LEFT loop → P3 center-left (실패) */}
          <path d="M 174,631 H 55 V 367 H 129" fill="none" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* P6 → Terminal APPR */}
          <line x1="230" y1="745" x2="230" y2="770" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* Terminal APPR → Terminal END */}
          <line x1="230" y1="804" x2="230" y2="833" stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ccf-ar)" />

          {/* ═══════════ ARROW LABELS ═══════════ */}

          <text x="237" y="222" fontSize="10" fill="#6B7280">일반</text>
          <text x="346" y="175" textAnchor="middle" fontSize="10" fill="#EF4444">긴급</text>
          <text x="237" y="669" fontSize="10" fill="#6B7280">합격</text>
          {/* 실패 — rotated vertical text */}
          <text x="45" y="499" textAnchor="middle" fontSize="10" fill="#6B7280" transform="rotate(-90 45 499)">실패</text>

          {/* ═══════════ SHAPES ═══════════ */}

          {/* ── Terminal: 고객불만 접수 ── */}
          <rect x="140" y="16" width="180" height="34" rx="17" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="230" y="37" textAnchor="middle" fontSize="12" fontWeight="600" fill="#1A1F2E">고객불만 접수</text>

          {/* ── P1: 불만 접수 및 등록 (영업팀) ── */}
          <rect x="130" y="69" width="200" height="62" rx="8" fill="#FFF7ED" stroke="#FB923C" strokeWidth="1.5" />
          <text x="230" y="89" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C2410C">P1. 불만 접수 및 등록</text>
          <text x="230" y="104" textAnchor="middle" fontSize="9.5" fill="#78350F">접수대장 등록 · 유형 분류</text>
          <rect x="272" y="113" width="52" height="14" rx="7" fill="#FEF9C3" stroke="#FDE047" strokeWidth="0.8" />
          <text x="298" y="123" textAnchor="middle" fontSize="9" fill="#713F12">영업팀</text>

          {/* ── Diamond1: 긴급 판단 ── */}
          <polygon points="230,156 286,182 230,208 174,182" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="230" y="179" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">긴급</text>
          <text x="230" y="192" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">판단</text>

          {/* ── Urgency box: 경영진 즉시 보고 ── */}
          <rect x="413" y="157" width="150" height="50" rx="8" fill="#FEF2F2" stroke="#F87171" strokeWidth="1.5" />
          <text x="488" y="178" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#DC2626">경영진 즉시 보고</text>
          <text x="488" y="196" textAnchor="middle" fontSize="9.5" fill="#991B1B">긴급 사안 즉시 에스컬레이션</text>

          {/* ── P2: 긴급 봉쇄조치 (품질·생산팀) ── */}
          <rect x="130" y="231" width="200" height="68" rx="8" fill="#FFF7ED" stroke="#FB923C" strokeWidth="1.5" />
          <text x="230" y="251" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C2410C">P2. 긴급 봉쇄조치 (D3)</text>
          <text x="230" y="267" textAnchor="middle" fontSize="9.5" fill="#78350F">불량품 격리 · 임시대책 수립</text>
          <text x="230" y="281" textAnchor="middle" fontSize="9.5" fill="#78350F">48h 이내 고객 보고</text>
          <rect x="257" y="285" width="68" height="14" rx="7" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="0.8" />
          <text x="291" y="295" textAnchor="middle" fontSize="9" fill="#14532D">품질 · 생산팀</text>

          {/* ── P3: 근본원인 분석 (품질팀) ── */}
          <rect x="130" y="326" width="200" height="82" rx="8" fill="#FFF7ED" stroke="#FB923C" strokeWidth="1.5" />
          <text x="230" y="347" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C2410C">P3. 근본원인 분석 (D4~D5)</text>
          <text x="230" y="362" textAnchor="middle" fontSize="9.5" fill="#78350F">5-Why · 특성요인도 · Is/Is Not · FTA</text>
          <text x="230" y="376" textAnchor="middle" fontSize="9" fontStyle="italic" fill="#92400E">설계기인 → DFMEA 검토 *</text>
          <rect x="274" y="388" width="50" height="14" rx="7" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="0.8" />
          <text x="299" y="398" textAnchor="middle" fontSize="9" fill="#14532D">품질팀</text>

          {/* ── P4: 시정조치 실행 (생산팀) ── */}
          <rect x="130" y="431" width="200" height="62" rx="8" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="230" y="451" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1D4ED8">P4. 시정조치 실행 (D6)</text>
          <text x="230" y="466" textAnchor="middle" fontSize="9.5" fill="#1E40AF">공정변경 · 샘플개선 · 표준서 개정</text>
          <rect x="274" y="472" width="50" height="14" rx="7" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="0.8" />
          <text x="299" y="482" textAnchor="middle" fontSize="9" fill="#1E40AF">생산팀</text>

          {/* ── P5: 유효성 검증 (품질팀) ── */}
          <rect x="130" y="518" width="200" height="62" rx="8" fill="#FFF7ED" stroke="#FB923C" strokeWidth="1.5" />
          <text x="230" y="538" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#C2410C">P5. 유효성 검증 (D7)</text>
          <text x="230" y="554" textAnchor="middle" fontSize="9.5" fill="#78350F">동일 불량 재발 모니터링 · 30일</text>
          <rect x="274" y="560" width="50" height="14" rx="7" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="0.8" />
          <text x="299" y="570" textAnchor="middle" fontSize="9" fill="#14532D">품질팀</text>

          {/* ── Diamond2: 검증 결과? ── */}
          <polygon points="230,605 286,631 230,657 174,631" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="230" y="628" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">검증</text>
          <text x="230" y="641" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">결과?</text>

          {/* ── P6: 수평전개 및 종결 (품질팀) ── */}
          <rect x="130" y="677" width="200" height="68" rx="8" fill="#EFF6FF" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="230" y="697" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#1D4ED8">P6. 수평전개 및 종결 (D8)</text>
          <text x="230" y="712" textAnchor="middle" fontSize="9.5" fill="#1E40AF">FMEA · 관리계획서 개정 검토</text>
          <text x="230" y="727" textAnchor="middle" fontSize="9.5" fill="#1E40AF">8D 최종 제출</text>
          <rect x="274" y="731" width="50" height="14" rx="7" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="0.8" />
          <text x="299" y="741" textAnchor="middle" fontSize="9" fill="#14532D">품질팀</text>

          {/* ── Terminal: 고객 최종 승인 수령 ── */}
          <rect x="108" y="770" width="244" height="34" rx="17" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="230" y="791" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#1A1F2E">고객 최종 승인 수령</text>

          {/* ── Terminal: 불만 종결 처리 ── */}
          <rect x="118" y="833" width="224" height="34" rx="17" fill="#F0FDF4" stroke="#4ADE80" strokeWidth="1.5" />
          <text x="230" y="854" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="#166534">불만 종결 처리</text>

        </svg>

        <p className="text-center text-[11px] text-gray-400 mt-3">
          ▲ 8D 방법론 기반 고객 불만 처리 표준 흐름도 (IATF 16949 §10.2)
        </p>
      </div>
    </div>
  );
}
