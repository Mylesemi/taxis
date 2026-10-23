/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { runAuditTests } from '../tax-engine';
import { AuditTestItem, TaxInputs } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Play, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditSectionProps {
  currentInputs: TaxInputs;
}

export const AuditSection: React.FC<AuditSectionProps> = ({ currentInputs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<AuditTestItem[] | null>(null);

  const handleRunAudit = () => {
    const results = runAuditTests(currentInputs);
    setTestResults(results);
    setIsOpen(true);
  };

  const handleExportCSV = () => {
    const results = testResults || runAuditTests(currentInputs);
    const csvContent =
      '\ufeff항목,결과,설명\r\n' +
      results
        .map(
          (x) =>
            `"${x.name.replace(/"/g, '""')}","${x.status}","${(x.description || '').replace(/"/g, '""')}"`
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TAXIS_2026_산식테스트.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const passCount = testResults?.filter((r) => r.pass).length ?? 0;
  const totalCount = testResults?.length ?? 25;

  return (
    <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 mb-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#60ddbb]" />
          <div>
            <h3 className="text-base font-bold text-white m-0">
              TAXIS 25개 핵심 세법 계산식 자체 점검 엔진 (Audit Suite)
            </h3>
            <p className="text-xs text-[#a7bdd4] m-0 mt-0.5">
              근로소득공제·누진세율·근로소득세액공제·연금한도·카드상한 경계값 정합성 자동 검증
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunAudit}
            className="px-3.5 py-2 bg-[#255e78] hover:bg-[#2f7596] text-white text-xs font-bold rounded-xl border border-[#448eb0] flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            산식 점검 실행
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-[#1c3852] hover:bg-[#284f73] text-[#dceaff] text-xs font-semibold rounded-xl border border-[#376185] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV 다운로드
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#8fcaff] hover:text-white rounded-lg bg-[#0e2136] border border-[#2b4b6b]"
            aria-label="결과 토글"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {testResults && (
        <div className="flex items-center gap-2 text-xs font-bold">
          <span
            className={`px-2.5 py-1 rounded-lg ${
              passCount === totalCount
                ? 'bg-[#12382e] text-[#60ddbb] border border-[#246653]'
                : 'bg-[#3d231e] text-[#ff8f80] border border-[#75342a]'
            }`}
          >
            기준값 테스트 {passCount} / {totalCount} 통과 (
            {passCount === totalCount ? 'ALL PASS' : 'FAIL DETECTED'})
          </span>
          <span className="text-[#a7bdd4] font-normal">
            ※ 법령 산식의 경계값 단위 테스트이며, 국세청 실제 개별 신고 사례 전체와의 일치를 뜻하지는 않습니다.
          </span>
        </div>
      )}

      {isOpen && (
        <div className="pt-3 border-t border-[#25425f] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            {(testResults || runAuditTests(currentInputs)).map((t, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between p-2.5 bg-[#0b1d30] border border-[#23425f] rounded-lg"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="text-[#eaf2ff] font-semibold">{t.name}</div>
                  {t.description && (
                    <div className="text-[11px] text-[#7ea0bf]">{t.description}</div>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    t.status === 'PASS'
                      ? 'bg-[#163f33] text-[#78e2b3] border border-[#29705b]'
                      : 'bg-[#40201d] text-[#ff9980] border border-[#70302b]'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#8aa6c0] leading-relaxed bg-[#0b1d30] p-3 rounded-xl border border-[#213f5c]">
            <strong>검증 범위 안내:</strong> 근로소득공제 5개 구간 경계값, 종합소득세 기본세율 8개 구간 경계값, 근로소득세액공제 총급여별 한도 공식, 연금계좌 600만/900만 한도 및 소득별 공제율(12%/15%), 신용카드 25% 문턱 및 자녀 가산 한도(250만~400만), 산출세액 범위 내 세액공제 차감 제한 등을 전수 검사합니다.
          </div>
        </div>
      )}
    </div>
  );
};
