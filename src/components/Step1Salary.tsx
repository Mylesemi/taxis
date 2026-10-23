/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaxInputs } from '../types';
import { fmtManwon } from '../tax-engine';
import { AlertCircle, User, Users } from 'lucide-react';

interface Step1SalaryProps {
  inputs: TaxInputs;
  onChange: <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => void;
}

export const Step1Salary: React.FC<Step1SalaryProps> = ({ inputs, onChange }) => {
  const totalSelf = Math.max(0, inputs.salary + inputs.bonus - inputs.nonTaxPay);
  const totalSpouse = inputs.spouseEnabled === 'yes' ? inputs.spouseSalary : 0;

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 1 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          급여 및 기납부세액 입력
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          본인과 배우자의 2026년 총급여와 기납부세액을 입력하세요. 맞벌이 가구의 부부 합산 절세 시뮬레이션을 실시간으로 지원합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 본인 카드 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <User className="w-5 h-5 text-[#65afff]" />
            <h3 className="text-base font-bold text-white">본인 급여 정보</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              기본급 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.salary || ''}
              onChange={(e) => onChange('salary', Math.max(0, Number(e.target.value) || 0))}
              placeholder="예: 13000"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              성과급·상여금 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.bonus || ''}
              onChange={(e) => onChange('bonus', Math.max(0, Number(e.target.value) || 0))}
              placeholder="예: 13000"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              비과세 급여 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.nonTaxPay || ''}
              onChange={(e) => onChange('nonTaxPay', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1.5">
              식대(월 20만원 한도), 자가운전보조금 등 기본급·성과급에 포함된 비과세 금액만 입력
            </small>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              2026년 이미 원천징수된 소득세+지방세 (만원)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={inputs.withheld || ''}
              onChange={(e) => onChange('withheld', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1.5">
              0이면 환급액이 아니라 예상 결정세액만 확인 가능 (STEP 7에서 재확인 가능)
            </small>
          </div>
        </div>

        {/* 배우자 카드 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <Users className="w-5 h-5 text-[#60ddbb]" />
            <h3 className="text-base font-bold text-white">배우자 급여 정보 (선택)</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              배우자 근로소득 연말정산 포함 여부
            </label>
            <select
              value={inputs.spouseEnabled}
              onChange={(e) => onChange('spouseEnabled', e.target.value as 'yes' | 'no')}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              <option value="yes">포함 (맞벌이 부부 합산 절세 시뮬레이션)</option>
              <option value="no">본인만 계산 (단독 세액 산출)</option>
            </select>
          </div>

          {inputs.spouseEnabled === 'yes' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
                  배우자 총급여 (만원)
                </label>
                <input
                  type="number"
                  min="0"
                  value={inputs.spouseSalary || ''}
                  onChange={(e) => onChange('spouseSalary', Math.max(0, Number(e.target.value) || 0))}
                  placeholder="예: 5000"
                  className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
                  배우자 기납부 소득세+지방세 (만원)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputs.spouseWithheld || ''}
                  onChange={(e) => onChange('spouseWithheld', Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
                />
              </div>
            </>
          ) : (
            <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-4 text-xs text-[#a7bdd4]">
              배우자 계산이 제외되었습니다. 본인의 소득공제 및 세액공제만 단독으로 시뮬레이션합니다.
            </div>
          )}

          <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-4 text-xs leading-relaxed text-[#b5cbde] space-y-1">
            <div className="font-bold text-[#8fcaff]">급여 요약</div>
            <div>본인 총급여(비과세 제외): <span className="text-white font-bold">{fmtManwon(totalSelf)}</span></div>
            <div>배우자 총급여: <span className="text-white font-bold">{inputs.spouseEnabled === 'yes' ? fmtManwon(totalSpouse) : '미포함'}</span></div>
            <div className="text-[#88a8c4] pt-1">
              ※ 2026년 귀속 연말정산은 통상 2027년 1~2월 회사 급여 시스템을 통해 진행됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
