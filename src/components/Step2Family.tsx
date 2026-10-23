/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaxInputs, PersonTaxResult } from '../types';
import { fmtManwon } from '../tax-engine';
import { HeartHandshake, ShieldAlert } from 'lucide-react';

interface Step2FamilyProps {
  inputs: TaxInputs;
  people: PersonTaxResult[];
  onChange: <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => void;
}

export const Step2Family: React.FC<Step2FamilyProps> = ({ inputs, people, onChange }) => {
  const self = people[0];
  const spouse = people[1];

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 2 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          인적공제 및 공적연금보험료
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          본인 기본공제(150만원)는 자동 반영됩니다. 맞벌이 부부는 서로를 기본공제 대상자로 등록할 수 없으며, 자녀는 소득이 높은 배우자에게 몰아주는 것이 통상 유리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 가족 기본공제 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <HeartHandshake className="w-5 h-5 text-[#ff8fa3]" />
            <h3 className="text-base font-bold text-white">가족 기본공제 (1인당 150만원)</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              공제 요건을 충족한 자녀 수
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={inputs.children}
              onChange={(e) => onChange('children', Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              자녀 기본공제 귀속자
            </label>
            <select
              value={inputs.childOwner}
              onChange={(e) => onChange('childOwner', e.target.value as 'self' | 'spouse')}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              <option value="self">본인 공제</option>
              <option value="spouse" disabled={inputs.spouseEnabled !== 'yes'}>
                배우자 공제 {inputs.spouseEnabled !== 'yes' ? '(배우자 미포함 시 선택 불가)' : ''}
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="childrenAgeEligible" className="block text-xs font-bold text-[#dceaff] mb-1.5">
              2026년 귀속 자녀세액공제 적격 자녀 수 (9세 이상)
            </label>
            <input
              id="childrenAgeEligible"
              type="number"
              min="0"
              max="20"
              step="1"
              value={inputs.childrenAgeEligible}
              onChange={(e) => onChange('childrenAgeEligible', Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1.5 leading-relaxed">
              기본공제 대상 자녀 중 9세 이상인 자녀 수만 입력합니다. 2026년 귀속 기준 아동수당 지급 연령 확대(8세 이하)에 따라 9세 이상만 세액공제 대상입니다.
            </small>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
                본인 적격 부모님 등 부양가족 수
              </label>
              <input
                type="number"
                min="0"
                value={inputs.parentsSelf}
                onChange={(e) => onChange('parentsSelf', Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
                배우자 적격 부모님 등 부양가족 수
              </label>
              <input
                type="number"
                min="0"
                disabled={inputs.spouseEnabled !== 'yes'}
                value={inputs.parentsSpouse}
                onChange={(e) => onChange('parentsSpouse', Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
              />
            </div>
          </div>
          <p className="text-xs text-[#9bb7d0] leading-relaxed">
            기본공제 대상은 연령(부모 만 60세 이상, 자녀 만 20세 이하), 연간 소득금액 100만원(근로소득만 있는 경우 총급여 500만원) 이하 및 중복공제 배제 요건을 충족해야 합니다.
          </p>
        </div>

        {/* 공적연금 및 기타 추가공제 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <ShieldAlert className="w-5 h-5 text-[#65afff]" />
            <h3 className="text-base font-bold text-white">공적연금 및 기타 소득공제</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              본인 국민연금 등 근로자 부담액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.npSelf || ''}
              onChange={(e) => onChange('npSelf', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              배우자 국민연금 등 근로자 부담액 (만원)
            </label>
            <input
              type="number"
              min="0"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={inputs.npSpouse || ''}
              onChange={(e) => onChange('npSpouse', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              본인 기타 적격 소득공제 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.otherDedSelf || ''}
              onChange={(e) => onChange('otherDedSelf', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              배우자 기타 적격 소득공제 (만원)
            </label>
            <input
              type="number"
              min="0"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={inputs.otherDedSpouse || ''}
              onChange={(e) => onChange('otherDedSpouse', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <p className="text-xs text-[#9bb7d0] leading-relaxed">
            국민연금 추납액은 실제 납부한 연도의 적격 공적연금보험료 소득공제에 포함됩니다. 주택청약종합저축, 주택임차차입금 원리금상환액 등은 증빙 확인된 금액만 입력하세요.
          </p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-[#0b1d30] border border-[#23425f] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-[#b5cbde] space-y-1">
        <div className="font-bold text-[#8fcaff]">인적공제 및 가족 현황</div>
        <div>본인 인적공제: <span className="font-bold text-white">{fmtManwon(self.personDed)}</span> / 배우자: <span className="font-bold text-white">{spouse.enabled ? fmtManwon(spouse.personDed) : '계산 제외'}</span></div>
        <div>적격 자녀 {inputs.children}명은 선택한 <span className="text-[#65afff] font-semibold">{inputs.childOwner === 'self' ? '본인' : '배우자'}</span>에게 일괄 반영됩니다.</div>
        <div className="text-[#88a8c4] text-xs">근로소득공제는 총급여에 따라 소득세법 제47조에 의해 법정 상한(2,000만원) 내에서 자동 계산됩니다.</div>
      </div>
    </div>
  );
};
