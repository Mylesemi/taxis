/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowDown, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';
import { PersonTaxResult } from '../types';
import { fmtWon } from '../tax-engine';

interface TaxFlowchartProps {
  self: PersonTaxResult;
  spouse: PersonTaxResult;
}

export const TaxFlowchart: React.FC<TaxFlowchartProps> = ({ self, spouse }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [target, setTarget] = useState<'self' | 'spouse' | 'both'>('self');

  const p = target === 'spouse' && spouse.enabled ? spouse : self;

  return (
    <div className="bg-[#10233a] border border-[#304d68] rounded-2xl p-5 mb-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#65afff]" />
          <div>
            <h3 className="text-base font-bold text-[#eaf2ff] m-0">
              근로소득 연말정산 6단계 세무 계산 흐름도
            </h3>
            <p className="text-xs text-[#a7bdd4] m-0 mt-0.5">
              총급여에서 최종 세액까지 법정 계산 단계와 현재 계산값
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {spouse.enabled && (
            <div className="inline-flex bg-[#091b2d] p-1 border border-[#35526c] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setTarget('self')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  target === 'self' ? 'bg-[#65afff] text-[#091525] font-bold' : 'text-[#a7bdd4] hover:text-white'
                }`}
              >
                본인
              </button>
              <button
                type="button"
                onClick={() => setTarget('spouse')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  target === 'spouse' ? 'bg-[#65afff] text-[#091525] font-bold' : 'text-[#a7bdd4] hover:text-white'
                }`}
              >
                배우자
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-[#8fcaff] hover:text-white p-1.5 rounded-lg bg-[#182c44] border border-[#35526c] flex items-center gap-1"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{isOpen ? '접기' : '흐름도 보기'}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[#253f58]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Step 1: 총급여 & 근로소득금액 */}
            <div className="bg-[#0b1d30] border border-[#2d4d6a] rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8fcaff] uppercase tracking-wider">
                  STAGE 1
                </span>
                <div className="text-xs font-bold text-[#eaf2ff] mt-0.5">총급여 및 근로소득공제</div>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>총급여</span>
                    <span className="font-semibold text-white">{fmtWon(p.g)}</span>
                  </div>
                  <div className="flex justify-between text-[#ff9980]">
                    <span>− 근로소득공제</span>
                    <span>{fmtWon(p.ded)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1e3852] flex justify-between text-xs font-bold text-[#73d7b0]">
                <span>근로소득금액</span>
                <span>{fmtWon(p.g - p.ded)}</span>
              </div>
            </div>

            {/* Step 2: 소득공제 차감 */}
            <div className="bg-[#0b1d30] border border-[#2d4d6a] rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8fcaff] uppercase tracking-wider">
                  STAGE 2
                </span>
                <div className="text-xs font-bold text-[#eaf2ff] mt-0.5">종합 소득공제 차감</div>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>인적공제</span>
                    <span>{fmtWon(p.personDed)}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>공적연금</span>
                    <span>{fmtWon(p.np)}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>카드공제</span>
                    <span>{fmtWon(p.card)}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>기타공제</span>
                    <span>{fmtWon(p.other)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1e3852] flex justify-between text-xs font-bold text-[#ffbf91]">
                <span>소득공제 합계</span>
                <span>{fmtWon(p.personDed + p.np + p.card + p.other)}</span>
              </div>
            </div>

            {/* Step 3: 과세표준 & 산출세액 */}
            <div className="bg-[#0b1d30] border border-[#2d4d6a] rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8fcaff] uppercase tracking-wider">
                  STAGE 3
                </span>
                <div className="text-xs font-bold text-[#eaf2ff] mt-0.5">과세표준 및 산출세액</div>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>과세표준</span>
                    <span className="font-bold text-[#9dd7ff]">{fmtWon(p.base)}</span>
                  </div>
                  <div className="text-[11px] text-[#7ea0bf] mt-1">
                    8단계 기본세율 적용 (6%~45% 누진)
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1e3852] flex justify-between text-xs font-bold text-[#ffcf7a]">
                <span>산출세액(국세)</span>
                <span>{fmtWon(p.assessed)}</span>
              </div>
            </div>

            {/* Step 4: 세액공제 차감 */}
            <div className="bg-[#0b1d30] border border-[#2d4d6a] rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#8fcaff] uppercase tracking-wider">
                  STAGE 4
                </span>
                <div className="text-xs font-bold text-[#eaf2ff] mt-0.5">세액공제 차감</div>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>근로소득세액</span>
                    <span>{fmtWon(p.employment)}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>연금계좌</span>
                    <span>{fmtWon(p.pension)}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>의료·교육</span>
                    <span>{fmtWon(p.medCredit + p.eduCredit)}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>자녀·기타</span>
                    <span>{fmtWon(p.childCredit + p.otherCredit)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1e3852] flex justify-between text-xs font-bold text-[#73d7b0]">
                <span>세액공제 합계</span>
                <span>{fmtWon(p.allCredits)}</span>
              </div>
            </div>

            {/* Step 5: 최종 결정세액 & 환급 */}
            <div className="bg-[#091f36] border border-[#3a6890] rounded-xl p-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#60ddbb] uppercase tracking-wider">
                  STAGE 5 &amp; 6
                </span>
                <div className="text-xs font-bold text-[#eaf2ff] mt-0.5">결정세액 &amp; 환급·추가납부</div>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>소득세 결정</span>
                    <span>{fmtWon(Math.max(0, p.assessed - p.allCredits))}</span>
                  </div>
                  <div className="flex justify-between text-[#a7bdd4]">
                    <span>지방세(10%)</span>
                    <span>{fmtWon(Math.max(0, p.assessed - p.allCredits) * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-[#8fcaff] font-bold pt-1 border-t border-[#1e3d5c]">
                    <span>결정세액(합계)</span>
                    <span>{fmtWon(p.final)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[#1e3d5c] text-xs">
                {p.withheld > 0 ? (
                  <div className="flex justify-between font-bold">
                    <span>{p.withheld >= p.final ? '예상 환급액' : '예상 추가납부'}</span>
                    <span className={p.withheld >= p.final ? 'text-[#60ddbb]' : 'text-[#ff9980]'}>
                      {fmtWon(Math.abs(p.withheld - p.final))}
                    </span>
                  </div>
                ) : (
                  <div className="text-[#a7bdd4] text-[11px] text-right">
                    기납부세액 미입력 (확인 필요)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
