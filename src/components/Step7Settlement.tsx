/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaxInputs, PersonTaxResult, OfficialCompareInputs } from '../types';
import {
  fmtWon,
  fmtManwon,
  calculatePublishedReconciliation,
  calculateOfficialDiscrepancy,
  total,
} from '../tax-engine';
import { Coins, CheckCircle, Download, Trash2, HelpCircle, FileSpreadsheet } from 'lucide-react';

interface Step7SettlementProps {
  inputs: TaxInputs;
  people: PersonTaxResult[];
  onChange: <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => void;
}

export const Step7Settlement: React.FC<Step7SettlementProps> = ({
  inputs,
  people,
  onChange,
}) => {
  const [official, setOfficial] = useState<OfficialCompareInputs>({
    officialSelfTax: '',
    officialSpouseTax: '',
    officialSelfBase: '',
    officialSpouseBase: '',
  });

  const self = people[0];
  const spouse = people[1];
  const totalTax = total(people);
  const activePeople = people.filter((p) => p.enabled);
  const totalWithheld = activePeople.reduce((sum, p) => sum + p.withheld, 0);
  const netRefund = totalWithheld - totalTax;

  const published = calculatePublishedReconciliation();
  const discrepancies = calculateOfficialDiscrepancy(inputs, official);

  const signedWon = (v: number | null) => {
    if (v === null) return '-';
    return (v > 0 ? '+' : '') + fmtWon(v);
  };

  const handleExportCSV = () => {
    const head = [
      '대상',
      '계산대상',
      'TAXIS 결정세액(만원)',
      '공식 결정세액(만원)',
      '결정세액 오차(만원)',
      'TAXIS 과세표준(만원)',
      '공식 과세표준(만원)',
      '과세표준 오차(만원)',
    ];

    const lines = [
      head,
      ...discrepancies.map((r) => [
        r.who,
        r.enabled ? 'Y' : 'N',
        r.estimatedTax,
        r.officialTax ?? '',
        r.taxGap ?? '',
        r.estimatedBase,
        r.officialBase ?? '',
        r.baseGap ?? '',
      ]),
    ];

    const csvContent =
      '\ufeff' +
      lines
        .map((row) =>
          row.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TAXIS_2026_공식결과_대조.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleClearOfficial = () => {
    setOfficial({
      officialSelfTax: '',
      officialSpouseTax: '',
      officialSelfBase: '',
      officialSpouseBase: '',
    });
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 7 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          결정세액 및 예상 환급·추가납부액 정산
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          연말정산의 최종 결과는 공제액 자체가 아니라, <strong>최종 결정세액</strong>에서 1년 동안 월급에서 이미 뗀 <strong>기납부 원천징수세액</strong>을 차감하여 결정됩니다.
        </p>
      </div>

      {/* 기납부세액 입력 & 환급 즉시 계산 카드 */}
      <div className="bg-[#12334b] border border-[#4b91c7] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2d597f] pb-3">
          <Coins className="w-5 h-5 text-[#ffcf7a]" />
          <h3 className="text-base font-bold text-white">기납부세액 입력 → 환급·추가납부 즉시 계산</h3>
        </div>

        <p className="text-xs text-[#b8cbe0]">
          2026년 급여·성과급에서 원천징수된 소득세와 지방소득세의 <strong>연간 합계</strong>를 입력하세요. (STEP 1과 자동 연동됩니다)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              본인 기납부세액 (소득세+지방세 합계, 만원)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={inputs.withheld || ''}
              onChange={(e) => onChange('withheld', Math.max(0, Number(e.target.value) || 0))}
              placeholder="예: 3000"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              배우자 기납부세액 (소득세+지방세 합계, 만원)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={inputs.spouseWithheld || ''}
              onChange={(e) => onChange('spouseWithheld', Math.max(0, Number(e.target.value) || 0))}
              placeholder="예: 250"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>
        </div>

        {/* Immediate Refund Card */}
        <div className="bg-[#0b1d30] border border-[#2d597f] rounded-xl p-4 text-xs sm:text-sm leading-relaxed space-y-2">
          <div className="font-bold text-[#8fcaff] border-b border-[#1f3d5a] pb-1.5">
            개인별 및 가구 합산 정산 결과
          </div>
          <div className="text-[#dceaff]">
            본인: 결정세액 <span className="font-bold text-white">{fmtWon(self.final)}</span> / 기납부 <span className="font-bold text-white">{fmtWon(self.withheld)}</span> →{' '}
            {self.withheld > 0 ? (
              <span className={self.withheld >= self.final ? 'text-[#60ddbb] font-bold' : 'text-[#ff9980] font-bold'}>
                {self.withheld >= self.final ? '예상 환급' : '예상 추가납부'} {fmtWon(Math.abs(self.withheld - self.final))}
              </span>
            ) : (
              <span className="text-[#8aa6c0]">기납부세액 미입력</span>
            )}
          </div>

          {spouse.enabled && (
            <div className="text-[#dceaff]">
              배우자: 결정세액 <span className="font-bold text-white">{fmtWon(spouse.final)}</span> / 기납부 <span className="font-bold text-white">{fmtWon(spouse.withheld)}</span> →{' '}
              {spouse.withheld > 0 ? (
                <span className={spouse.withheld >= spouse.final ? 'text-[#60ddbb] font-bold' : 'text-[#ff9980] font-bold'}>
                  {spouse.withheld >= spouse.final ? '예상 환급' : '예상 추가납부'} {fmtWon(Math.abs(spouse.withheld - spouse.final))}
                </span>
              ) : (
                <span className="text-[#8aa6c0]">기납부세액 미입력</span>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-[#1f3d5a] text-sm sm:text-base font-extrabold flex justify-between items-center">
            <span className="text-white">가구 합계:</span>
            {totalWithheld > 0 ? (
              <span className={netRefund >= 0 ? 'text-[#60ddbb]' : 'text-[#ff9980]'}>
                {netRefund >= 0 ? '총 예상 환급액 ' : '총 예상 추가납부액 '}
                {fmtWon(Math.abs(netRefund))}
              </span>
            ) : (
              <span className="text-xs font-normal text-[#8aa6c0]">
                기납부세액을 입력하면 가구 합산 환급/추가납부를 계산합니다.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Side by side final details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-2 text-xs sm:text-sm">
          <h4 className="text-base font-bold text-white border-b border-[#243e59] pb-2">본인 세액 계산 상세</h4>
          <div className="flex justify-between text-[#a7bdd4]">
            <span>산출소득세</span>
            <span className="text-white font-semibold">{fmtWon(self.assessed)}</span>
          </div>
          <div className="flex justify-between text-[#78e2b3]">
            <span>− 세액공제 합계</span>
            <span>−{fmtWon(self.allCredits)}</span>
          </div>
          <div className="flex justify-between text-[#dceaff]">
            <span>= 소득세 결정세액</span>
            <span>{fmtWon(Math.max(0, self.assessed - self.allCredits))}</span>
          </div>
          <div className="flex justify-between text-[#a7bdd4]">
            <span>+ 지방소득세(10%)</span>
            <span>+{fmtWon(Math.max(0, self.assessed - self.allCredits) * 0.1)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#8fcaff] pt-1 border-t border-[#1e3b56]">
            <span>= 최종 결정세액 (소득세+지방세)</span>
            <span>{fmtWon(self.final)}</span>
          </div>
        </div>

        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-2 text-xs sm:text-sm">
          <h4 className="text-base font-bold text-white border-b border-[#243e59] pb-2">배우자 세액 계산 상세</h4>
          {spouse.enabled ? (
            <>
              <div className="flex justify-between text-[#a7bdd4]">
                <span>산출소득세</span>
                <span className="text-white font-semibold">{fmtWon(spouse.assessed)}</span>
              </div>
              <div className="flex justify-between text-[#78e2b3]">
                <span>− 세액공제 합계</span>
                <span>−{fmtWon(spouse.allCredits)}</span>
              </div>
              <div className="flex justify-between text-[#dceaff]">
                <span>= 소득세 결정세액</span>
                <span>{fmtWon(Math.max(0, spouse.assessed - spouse.allCredits))}</span>
              </div>
              <div className="flex justify-between text-[#a7bdd4]">
                <span>+ 지방소득세(10%)</span>
                <span>+{fmtWon(Math.max(0, spouse.assessed - spouse.allCredits) * 0.1)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#8fcaff] pt-1 border-t border-[#1e3b56]">
                <span>= 최종 결정세액 (소득세+지방세)</span>
                <span>{fmtWon(spouse.final)}</span>
              </div>
            </>
          ) : (
            <div className="text-xs text-[#8aa6c0] py-6 text-center">
              배우자 계산 제외 상태입니다.
            </div>
          )}
        </div>
      </div>

      {/* 원천징수영수증 공개 예시 독립 검산 */}
      <div className="bg-[#13263c] border border-[#527a96] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#243e59] pb-2">
          <CheckCircle className="w-5 h-5 text-[#60ddbb]" />
          <h3 className="text-base font-bold text-white">원천징수영수증 공개 예시 · 차감징수세액 독립 검산</h3>
        </div>
        <p className="text-xs text-[#b8cbe0]">
          공개된 국세청 연말정산 공식 안내의 세액명세 예시로 <strong>결정세액 − 기납부세액 = 차감징수세액</strong>을 독립 검산합니다. (TAXIS 전체 소득공제 엔진을 국세청과 대조한 사례가 아닌 정산 산술 검증입니다)
        </p>
        <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed font-mono space-y-1">
          {published.rows.map((row) => (
            <div key={row.name} className="flex justify-between text-[#dceaff]">
              <span>{row.name}: 결정 {row.assessed.toLocaleString()}원 − 기납부 {row.prepaid.toLocaleString()}원</span>
              <span className="text-[#60ddbb] font-bold">
                = {row.result.toLocaleString()}원 ({row.pass ? '✓ 일치' : '✗ 불일치'})
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-[#1f3d5a] flex justify-between font-bold text-[#8fcaff]">
            <span>합계 환급액:</span>
            <span>{published.totalRefund.toLocaleString()}원 환급</span>
          </div>
        </div>
      </div>

      {/* 국세청·원천징수영수증 결과 대조 카드 */}
      <div className="bg-[#13263c] border border-[#42799b] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#243e59] pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#65afff]" />
            <h3 className="text-base font-bold text-white">🔎 국세청·원천징수영수증 공식 결과 대조</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="text-xs bg-[#244a6a] hover:bg-[#32628d] text-[#cce9ff] border border-[#487399] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#60ddbb]" />
              대조 결과 CSV 저장
            </button>
            <button
              type="button"
              onClick={handleClearOfficial}
              className="text-xs bg-[#3a2828] hover:bg-[#4a3434] text-[#ffc4c4] border border-[#6b4242] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              지우기
            </button>
          </div>
        </div>

        <p className="text-xs text-[#b8cbe0]">
          국세청 홈택스의 <strong>2026년 귀속 연말정산 자동계산</strong> 또는 회사 원천징수영수증에서 확인한 값을 입력하세요. TAXIS 계산 결과와 <strong>본인·배우자별 오차</strong>를 즉시 비교합니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              본인 공식 결정세액 (소득세+지방세, 만원)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={official.officialSelfTax}
              onChange={(e) => setOfficial({ ...official, officialSelfTax: e.target.value })}
              placeholder="예: 3500"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              배우자 공식 결정세액 (소득세+지방세, 만원)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={official.officialSpouseTax}
              onChange={(e) => setOfficial({ ...official, officialSpouseTax: e.target.value })}
              placeholder="예: 250"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              본인 공식 과세표준 (만원, 선택)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={official.officialSelfBase}
              onChange={(e) => setOfficial({ ...official, officialSelfBase: e.target.value })}
              placeholder="선택 입력"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              배우자 공식 과세표준 (만원, 선택)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={official.officialSpouseBase}
              onChange={(e) => setOfficial({ ...official, officialSpouseBase: e.target.value })}
              placeholder="선택 입력"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>
        </div>

        {/* Comparison Result Display */}
        <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-4 text-xs leading-relaxed space-y-2">
          {discrepancies.some((d) => d.officialTax !== null) ? (
            <div className="space-y-2">
              {discrepancies
                .filter((d) => d.enabled && d.officialTax !== null)
                .map((d) => (
                  <div key={d.who} className="p-2 bg-[#10243a] rounded-lg border border-[#24425f]">
                    <div className="font-bold text-[#8fcaff]">{d.who} 대조 결과</div>
                    <div className="text-[#dceaff] mt-1">
                      TAXIS 결정세액 {fmtWon(d.estimatedTax)} / 공식 {fmtWon(d.officialTax!)} →{' '}
                      <strong className={Math.abs(d.taxGap!) < 0.1 ? 'text-[#60ddbb]' : 'text-[#ffd078]'}>
                        오차(TAXIS − 공식): {signedWon(d.taxGap)}
                      </strong>
                    </div>
                    {d.baseGap !== null && (
                      <div className="text-[#a7bdd4] mt-0.5">
                        과세표준 오차(TAXIS − 공식): {signedWon(d.baseGap)}
                      </div>
                    )}
                  </div>
                ))}

              <div className="text-[11px] text-[#8aa6c0] pt-2 border-t border-[#1e3c59]">
                💡 <strong>진단 가이드:</strong> 과세표준부터 차이가 나면 소득·인적공제·연금보험료·카드공제를 확인하세요. 과세표준은 일치하나 결정세액만 다르면 근로소득세액공제, 연금/의료비/교육비/자녀 세액공제 한도 및 공제 순서를 검토해야 합니다.
              </div>
            </div>
          ) : (
            <div className="text-[#8aa6c0] text-center py-2">
              공식 결정세액을 입력하면 TAXIS 계산 결과와의 오차 및 진단 안내가 나타납니다.
            </div>
          )}
        </div>
      </div>

      {/* 기납부세액 확인 가이드 카드 */}
      <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#8fcaff]" />
          <h3 className="text-base font-bold text-white">기납부세액 확인 방법</h3>
        </div>
        <p className="text-xs text-[#b8cbe0]">
          기납부세액은 2026년 급여·성과급에서 이미 원천징수된 <strong>소득세 + 지방소득세</strong>입니다.
        </p>
        <ol className="text-xs text-[#dceaff] space-y-1.5 list-decimal pl-5 leading-relaxed">
          <li><strong>회사 급여 시스템</strong>에서 2026년 원천징수세액 누계를 확인하세요.</li>
          <li>조회가 어렵다면 <strong>1~12월 급여·성과급 명세서</strong>의 소득세와 지방소득세를 합산하세요.</li>
          <li>아직 지급되지 않은 월급은 예상 원천징수세액을 더해 <strong>STEP 1의 본인·배우자 기납부세액</strong>에 각각 입력하세요.</li>
        </ol>
        <p className="text-[11px] text-[#8aa6c0] pt-1">
          국민연금·건강보험료는 세금이 아니므로 기납부세액에 포함하지 않습니다. 홈택스 원천징수영수증은 주로 이미 정산된 과거 귀속연도의 확인용입니다.
        </p>
      </div>
    </div>
  );
};
