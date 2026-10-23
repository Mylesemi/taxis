/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaxInputs, PersonTaxResult } from '../types';
import { fmtWon, fmtManwon } from '../tax-engine';
import { PiggyBank, Sparkles, Stethoscope, GraduationCap, Users2, RotateCcw } from 'lucide-react';

interface Step5TaxCreditsProps {
  inputs: TaxInputs;
  people: PersonTaxResult[];
  onChange: <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => void;
  onBatchChange: (updates: Partial<TaxInputs>) => void;
}

export const Step5TaxCredits: React.FC<Step5TaxCreditsProps> = ({
  inputs,
  people,
  onChange,
  onBatchChange,
}) => {
  const [presetExplain, setPresetExplain] = useState<string>(
    '의료비는 총급여 3% 초과분부터 공제대상입니다. 일반 의료비 700만원은 공제대상액 한도이며, 본인·6세 이하 자녀 등 특정 의료비에는 이 한도가 적용되지 않습니다. 자녀세액공제는 납입·지출액으로 최대화할 수 없습니다.'
  );

  const self = people[0];
  const spouse = people[1];

  // Presets logic
  const handlePensionPreset = () => {
    const updates: Partial<TaxInputs> = {
      psSelf: 600,
      irpSelf: 300,
    };
    if (inputs.spouseEnabled === 'yes' && inputs.spouseSalary > 0) {
      updates.psSpouse = 600;
      updates.irpSpouse = 300;
    } else {
      updates.psSpouse = 0;
      updates.irpSpouse = 0;
    }
    onBatchChange(updates);
    setPresetExplain(
      '연금저축 600만원 + IRP/DC 개인 추가납입 300만원을 납입자별로 입력했습니다. 이는 일반적인 세액공제 대상 한도(합산 900만원)이며, 실제 절세액은 총급여와 산출세액에 따라 결정됩니다.'
    );
  };

  const handleMedicalPreset = () => {
    const owner = inputs.medicalOwner;
    const g =
      owner === 'self'
        ? self.g
        : inputs.spouseEnabled === 'yes'
        ? spouse.g
        : 0;

    if (g <= 0) {
      setPresetExplain('의료비 부담자의 총급여를 먼저 입력해 주세요.');
      return;
    }

    const target = Math.round((g * 0.03 + 700) * 10) / 10;
    onChange('medical', target);
    setPresetExplain(
      `일반 의료비 700만원 공제대상 한도에 도달하는 지출액 ${target.toLocaleString('ko-KR')}만원을 입력했습니다 (총급여 ${g.toLocaleString('ko-KR')}만원 × 3% + 700만원). 실제 의료비를 이만큼 추가 지출하라는 뜻이 아닙니다. 본인·6세 이하 자녀 등 한도 없는 특례 의료비는 이 간이 계산에 포함되지 않습니다.`
    );
  };

  const handleEducationPreset = () => {
    const count = inputs.children;
    const target = count * 300;
    onChange('education', target);
    setPresetExplain(
      `취학 전 아동 ${count}명 각각 적격 교육비 300만원을 지출한 것으로 가정해 총 ${target.toLocaleString('ko-KR')}만원을 입력했습니다. 실제 취학 여부·인가 교육기관·교육비 적격성 및 부부 중 공제 귀속을 확인해야 합니다.`
    );
  };

  const handleChildInfo = () => {
    setPresetExplain(
      '일반 자녀세액공제는 자녀의 연령(2026년 귀속 기준 9세 이상)·인원과 법정 요건으로 결정되며 납입액을 늘려 최대화할 수 없습니다. STEP 2에서 9세 이상 적격 자녀 수를 입력하면 자동 계산됩니다.'
    );
  };

  const handleAllPresets = () => {
    const updates: Partial<TaxInputs> = {
      psSelf: 600,
      irpSelf: 300,
    };
    if (inputs.spouseEnabled === 'yes' && inputs.spouseSalary > 0) {
      updates.psSpouse = 600;
      updates.irpSpouse = 300;
    }
    const owner = inputs.medicalOwner;
    const g = owner === 'self' ? self.g : spouse.g;
    if (g > 0) {
      updates.medical = Math.round((g * 0.03 + 700) * 10) / 10;
    }
    updates.education = inputs.children * 300;
    onBatchChange(updates);
    setPresetExplain(
      '연금저축·IRP 최대 한도, 일반 의료비 700만원 도달 지출액, 자녀 교육비 한도액을 일괄 적용했습니다. 이는 가상 가정값이며 추가 지출을 권장하지 않습니다.'
    );
  };

  const handleClearPresets = () => {
    onBatchChange({
      psSelf: 0,
      irpSelf: 0,
      psSpouse: 0,
      irpSpouse: 0,
      medical: 0,
      education: 0,
    });
    setPresetExplain('연금 납입액, 의료비, 교육비 입력값을 0으로 초기화했습니다.');
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 5 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          세액공제: 연금계좌·자녀·의료비·교육비
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          세액공제는 과세표준이 아닌 산출세액에서 직접 차감되는 매우 강력한 절세 수단입니다. 납입자 및 지출자 귀속 요건을 꼼꼼히 확인하세요.
        </p>
      </div>

      {/* Preset Action Bar */}
      <div className="bg-[#102d3e] border border-[#2c7490] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#60ddbb]" />
          <h3 className="text-base font-bold text-white">공제 한도 맞춤 간편 입력 (Preset)</h3>
        </div>
        <p className="text-xs text-[#a7bdd4]">
          버튼을 누르면 해당 항목의 <strong>공제대상 한도에 도달하는 납입·지출액</strong>을 자동 입력합니다. 실제로 납입하거나 지출한 금액만 최종 신고에 사용하세요.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={handlePensionPreset}
            className="p-2.5 bg-[#1a415a] hover:bg-[#235372] text-[#dceaff] text-xs font-semibold rounded-xl border border-[#386b8c] transition-colors text-left"
          >
            연금: 부부 각각 900만원
          </button>
          <button
            type="button"
            onClick={handleMedicalPreset}
            className="p-2.5 bg-[#1a415a] hover:bg-[#235372] text-[#dceaff] text-xs font-semibold rounded-xl border border-[#386b8c] transition-colors text-left"
          >
            의료비: 700만 한도 도달
          </button>
          <button
            type="button"
            onClick={handleEducationPreset}
            className="p-2.5 bg-[#1a415a] hover:bg-[#235372] text-[#dceaff] text-xs font-semibold rounded-xl border border-[#386b8c] transition-colors text-left"
          >
            교육비: 자녀수×300만원
          </button>
          <button
            type="button"
            onClick={handleChildInfo}
            className="p-2.5 bg-[#1a415a] hover:bg-[#235372] text-[#dceaff] text-xs font-semibold rounded-xl border border-[#386b8c] transition-colors text-left"
          >
            자녀: 법정 요건 안내
          </button>
          <button
            type="button"
            onClick={handleAllPresets}
            className="p-2.5 bg-[#255e78] hover:bg-[#2e7494] text-white text-xs font-bold rounded-xl border border-[#4ea2c7] transition-colors text-left"
          >
            3가지 한번에 입력
          </button>
          <button
            type="button"
            onClick={handleClearPresets}
            className="p-2.5 bg-[#3a2828] hover:bg-[#4a3434] text-[#ffc4c4] text-xs font-semibold rounded-xl border border-[#6b4242] transition-colors text-left flex items-center justify-between"
          >
            <span>초기화</span>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed text-[#b5cbde]">
          {presetExplain}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 연금저축·IRP */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <PiggyBank className="w-5 h-5 text-[#60ddbb]" />
            <h3 className="text-base font-bold text-white">연금저축 · IRP</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              본인 연금저축 납입액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.psSelf || ''}
              onChange={(e) => onChange('psSelf', Math.max(0, Number(e.target.value) || 0))}
              placeholder="600"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="text-xs text-[#8aa6c0]">연간 한도 600만원</small>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              본인 IRP·DC 추가납입액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.irpSelf || ''}
              onChange={(e) => onChange('irpSelf', Math.max(0, Number(e.target.value) || 0))}
              placeholder="300"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="text-xs text-[#8aa6c0]">연금저축 합산 900만원 한도</small>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              배우자 연금저축 납입액 (만원)
            </label>
            <input
              type="number"
              min="0"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={inputs.psSpouse || ''}
              onChange={(e) => onChange('psSpouse', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              배우자 IRP·DC 추가납입액 (만원)
            </label>
            <input
              type="number"
              min="0"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={inputs.irpSpouse || ''}
              onChange={(e) => onChange('irpSpouse', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <p className="text-[11px] text-[#8aa6c0] leading-relaxed pt-1">
            공제율: 총급여 5,500만원 이하 15%, 5,500만원 초과 12% (지방소득세 10% 별도 가산 반영).
          </p>
        </div>

        {/* 의료비·교육비 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <Stethoscope className="w-5 h-5 text-[#ff8fa3]" />
            <h3 className="text-base font-bold text-white">의료비 · 교육비</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              일반 의료비 적격 지출 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.medical || ''}
              onChange={(e) => onChange('medical', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              실제 의료비 부담자
            </label>
            <select
              value={inputs.medicalOwner}
              onChange={(e) => onChange('medicalOwner', e.target.value as 'self' | 'spouse')}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              <option value="self">본인 부담</option>
              <option value="spouse" disabled={inputs.spouseEnabled !== 'yes'}>배우자 부담</option>
            </select>
            <small className="text-xs text-[#8aa6c0]">총급여 3% 문턱 계산 기준자</small>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              적격 취학 전 아동 교육비 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.education || ''}
              onChange={(e) => onChange('education', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              교육비 공제 귀속자
            </label>
            <select
              value={inputs.eduOwner}
              onChange={(e) => onChange('eduOwner', e.target.value as 'self' | 'spouse')}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              <option value="self">본인 공제</option>
              <option value="spouse" disabled={inputs.spouseEnabled !== 'yes'}>배우자 공제</option>
            </select>
          </div>

          <p className="text-[11px] text-[#8aa6c0] leading-relaxed pt-1">
            일반 의료비: 총급여 3% 초과분, 공제대상액 700만원 한도, 15% 공제. 교육비: 취학 전 1인당 300만원 한도, 15% 공제.
          </p>
        </div>

        {/* 자녀세액공제 & 기타세액공제 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <Users2 className="w-5 h-5 text-[#8fcaff]" />
            <h3 className="text-base font-bold text-white">자녀 &amp; 기타 세액공제</h3>
          </div>

          <div className="bg-[#0b1d30] border border-[#23425f] p-3 rounded-xl space-y-1">
            <div className="text-xs font-bold text-[#8fcaff]">2026년 귀속 자녀세액공제</div>
            <div className="text-xs text-[#dceaff]">
              적격 자녀 수(9세 이상): <strong className="text-white">{inputs.childrenAgeEligible}명</strong>
            </div>
            <div className="text-sm font-extrabold text-[#78e2b3]">
              세액공제액: {fmtWon((self.childCredit || 0) + (spouse.childCredit || 0))}
            </div>
            <p className="text-[10px] text-[#8aa6c0] mt-1">
              소득세법 제59조의2에 따라 1인 25만, 2인 55만, 3인이상 55만+(인원-2)×40만원 자동 산출.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              본인 확인된 기타 세액공제 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.creditOtherSelf || ''}
              onChange={(e) => onChange('creditOtherSelf', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1">
              배우자 확인된 기타 세액공제 (만원)
            </label>
            <input
              type="number"
              min="0"
              disabled={inputs.spouseEnabled !== 'yes'}
              value={inputs.creditOtherSpouse || ''}
              onChange={(e) => onChange('creditOtherSpouse', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-base disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <p className="text-[11px] text-[#8aa6c0] leading-relaxed pt-1">
            보장성 보험료(100만원 한도 12%), 기부금, 월세액 세액공제, 출산·입양 세액공제 등 법정 증빙이 확인된 금액만 입력하세요.
          </p>
        </div>
      </div>

      {/* Summary of credits */}
      <div className="bg-[#0b1d30] border border-[#23425f] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed text-[#b5cbde] space-y-1">
        <div className="font-bold text-[#8fcaff]">세액공제 합계 요약 (소득세 기준)</div>
        <div>
          연금 세액공제: 본인 <span className="font-semibold text-white">{fmtManwon(self.pension)}</span> / 배우자 <span className="font-semibold text-white">{spouse.enabled ? fmtManwon(spouse.pension) : '제외'}</span>
        </div>
        <div>
          의료비 세액공제: <span className="font-semibold text-white">{fmtManwon(self.medCredit + spouse.medCredit)}</span> · 교육비 세액공제: <span className="font-semibold text-white">{fmtManwon(self.eduCredit + spouse.eduCredit)}</span>
        </div>
        <div>
          근로소득세액공제(자동산출): 본인 <span className="font-semibold text-white">{fmtManwon(self.employment)}</span> / 배우자 <span className="font-semibold text-white">{spouse.enabled ? fmtManwon(spouse.employment) : '제외'}</span>
        </div>
      </div>
    </div>
  );
};
