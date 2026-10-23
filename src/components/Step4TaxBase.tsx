/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PersonTaxResult } from '../types';
import { fmtWon, fmtManwon } from '../tax-engine';
import { Calculator, ArrowRight, ShieldCheck } from 'lucide-react';

interface Step4TaxBaseProps {
  people: PersonTaxResult[];
}

export const Step4TaxBase: React.FC<Step4TaxBaseProps> = ({ people }) => {
  const self = people[0];
  const spouse = people[1];

  const renderPersonFlow = (p: PersonTaxResult) => {
    if (!p.enabled) {
      return (
        <div className="bg-[#0b1d30] border border-[#23425f] rounded-2xl p-5 text-sm text-[#a7bdd4]">
          배우자 계산이 제외되었습니다. STEP 1에서 배우자를 포함하면 부부 비교가 가능합니다.
        </div>
      );
    }

    const netIncome = Math.max(0, p.g - p.ded);
    const totalDeductions = p.personDed + p.np + p.other + p.card;

    return (
      <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#243e59] pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#65afff]" />
            <h3 className="text-base font-bold text-white">{p.who} 과세표준 및 산출세액</h3>
          </div>
          <span className="text-xs text-[#8fcaff] font-mono font-semibold">
            총급여 {fmtManwon(p.g)}
          </span>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between py-1.5 border-b border-[#1b344c] text-[#dceaff]">
            <span>총급여 (비과세 제외)</span>
            <span className="font-bold text-white">{fmtWon(p.g)}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-[#1b344c] text-[#ff9980]">
            <span>− 근로소득공제 (법정 상한 2,000만원)</span>
            <span className="font-semibold">−{fmtWon(p.ded)}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-[#203c58] text-[#80e6bb] font-bold bg-[#0b1d30] px-2 rounded-lg">
            <span>= 근로소득금액</span>
            <span>{fmtWon(netIncome)}</span>
          </div>

          <div className="pt-2 text-xs font-bold text-[#8fcaff]">종합소득공제 내역</div>

          <div className="flex justify-between py-1 border-b border-[#1b344c] text-[#a7bdd4] pl-2">
            <span>− 인적공제 (본인 + 부양가족)</span>
            <span>−{fmtWon(p.personDed)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#1b344c] text-[#a7bdd4] pl-2">
            <span>− 국민연금 등 공적연금보험료</span>
            <span>−{fmtWon(p.np)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#1b344c] text-[#a7bdd4] pl-2">
            <span>− 신용·체크카드 소득공제</span>
            <span>−{fmtWon(p.card)}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-[#1b344c] text-[#a7bdd4] pl-2">
            <span>− 기타 적격 소득공제</span>
            <span>−{fmtWon(p.other)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-[#203c58] text-[#ffd078] font-bold bg-[#0e243a] px-2 rounded-lg">
            <span>= 과세표준 (Tax Base)</span>
            <span className="text-sm font-extrabold">{fmtWon(p.base)}</span>
          </div>

          <div className="flex justify-between py-2 text-[#9dd7ff] font-bold bg-[#0b2136] border border-[#2e5375] px-2 rounded-lg">
            <span>→ 산출세액 (소득세 기준)</span>
            <span className="text-base font-black text-[#9fe2ff]">{fmtWon(p.assessed)}</span>
          </div>
        </div>

        <div className="text-[11px] text-[#8aa6c0] leading-relaxed bg-[#0b1d30] p-3 rounded-xl border border-[#213f5c]">
          과세표준 {fmtManwon(p.base)}에 대해 소득세법 제55조의 8단계 초과누진세율(6%~45%)이 적용되었습니다. 다음 단계(STEP 5)에서 근로소득세액공제 및 특별세액공제가 차감됩니다.
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 4 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          과세표준 및 산출세액 계산
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          지금까지 입력한 모든 소득공제(근로소득, 인적, 연금, 카드, 기타)를 반영하여 과세표준을 도출하고 8단계 종합소득세 누진세율을 적용한 산출세액입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderPersonFlow(self)}
        {renderPersonFlow(spouse)}
      </div>

      {/* Tax Brackets Reference Banner */}
      <div className="bg-[#10233a] border border-[#304d68] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-[#60ddbb]" />
          <h4 className="text-xs font-bold text-[#eaf2ff] uppercase tracking-wide">
            2026년 귀속 소득세 기본세율표 (소득세법 제55조)
          </h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">1,400만 이하</div>
            <div className="font-extrabold text-[#78e2b3]">6%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">1,400~5,000만</div>
            <div className="font-extrabold text-[#78e2b3]">15%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">5,000~8,800만</div>
            <div className="font-extrabold text-[#8fcaff]">24%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">8,800만~1.5억</div>
            <div className="font-extrabold text-[#8fcaff]">35%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">1.5억~3억원</div>
            <div className="font-extrabold text-[#ffcf7a]">38%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">3억~5억원</div>
            <div className="font-extrabold text-[#ffcf7a]">40%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">5억~10억원</div>
            <div className="font-extrabold text-[#ff9980]">42%</div>
          </div>
          <div className="bg-[#0b1d30] border border-[#243e59] p-2 rounded-lg">
            <div className="text-[#a7bdd4] text-[10px]">10억원 초과</div>
            <div className="font-extrabold text-[#ff9980]">45%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
