/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaxInputs } from '../types';
import { fmtWon, fmtManwon } from '../tax-engine';
import { Landmark, CheckSquare, Sparkles, AlertTriangle } from 'lucide-react';

interface Step6ISAProps {
  inputs: TaxInputs;
  onChange: <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => void;
  onBatchChange: (updates: Partial<TaxInputs>) => void;
}

export const Step6ISA: React.FC<Step6ISAProps> = ({ inputs, onChange, onBatchChange }) => {
  const [explain, setExplain] = useState<string>(
    '먼저 이전한 사람을 선택하고, 만기·이전기한(만기일로부터 60일 이내)·증빙 요건을 확인하세요. 버튼은 금액만 입력하며 적격 여부를 자동으로 인정하지 않습니다.'
  );

  const handlePresetISA = () => {
    onBatchChange({
      isaTransfer: 3000,
      isaEligible: true,
    });
    setExplain(
      'ISA 만기 이전 최대 공제한도(300만원)를 모두 확보하기 위한 적격 이전액 3,000만원 및 요건 확인을 적용했습니다. 연금계좌 납입한도에 300만원이 즉시 추가됩니다.'
    );
  };

  const handleClearISA = () => {
    onBatchChange({
      isaTransfer: 0,
      isaEligible: false,
    });
    setExplain('ISA 이전액을 0원으로 초기화했습니다.');
  };

  const extraCap = inputs.isaEligible ? Math.min(inputs.isaTransfer * 0.1, 300) : 0;

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 6 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          ISA 만기 이전 및 놓치기 쉬운 절세 항목 점검
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          ISA(개인종합자산관리계좌) 자체의 비과세·분리과세는 금융소득 혜택이며, 만기금을 연금계좌로 이전할 때 이전액의 10%(최대 300만원)가 연말정산 세액공제 대상 한도에 추가됩니다.
        </p>
      </div>

      {/* ISA Preset Box */}
      <div className="bg-[#102d3e] border border-[#2c7490] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#60ddbb]" />
          <h3 className="text-base font-bold text-white">ISA 추가 세액공제 한도 맞춤 입력</h3>
        </div>
        <p className="text-xs text-[#a7bdd4]">
          ISA 만기금의 <strong>10% (최대 300만원)</strong>가 연금계좌 세액공제 대상 납입한도에 추가됩니다. 이를 모두 확보하기 위한 이전액은 <strong>3,000만원</strong>입니다.
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePresetISA}
            className="px-3.5 py-2 bg-[#1a415a] hover:bg-[#235372] text-[#dceaff] text-xs font-bold rounded-xl border border-[#386b8c] transition-colors"
          >
            ISA 최대 공제대상액: 3,000만원 입력 + 요건 확인
          </button>
          <button
            type="button"
            onClick={handleClearISA}
            className="px-3.5 py-2 bg-[#3a2828] hover:bg-[#4a3434] text-[#ffc4c4] text-xs font-semibold rounded-xl border border-[#6b4242] transition-colors"
          >
            ISA 이전액 0원으로 초기화
          </button>
        </div>

        <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed text-[#b5cbde]">
          {explain}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ISA 만기 연금계좌 이전 카드 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <Landmark className="w-5 h-5 text-[#65afff]" />
            <h3 className="text-base font-bold text-white">ISA 만기 연금계좌 이전</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              2026년 적격 이전액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.isaTransfer || ''}
              onChange={(e) => onChange('isaTransfer', Math.max(0, Number(e.target.value) || 0))}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              이전한 사람
            </label>
            <select
              value={inputs.isaOwner}
              onChange={(e) => onChange('isaOwner', e.target.value as 'self' | 'spouse')}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              <option value="self">본인 계좌로 이전</option>
              <option value="spouse" disabled={inputs.spouseEnabled !== 'yes'}>배우자 계좌로 이전</option>
            </select>
          </div>

          <label className="flex items-start gap-2.5 bg-[#091b2d] border border-[#335372] p-3 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.isaEligible}
              onChange={(e) => onChange('isaEligible', e.target.checked)}
              className="mt-0.5 accent-[#65afff] w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-[#dceaff] font-medium leading-relaxed">
              만기 및 이전기한(만기일로부터 60일 이내) 등 법정 요건 확인 완료
            </span>
          </label>

          <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed text-[#b5cbde]">
            {inputs.isaEligible ? (
              <div>
                추가 세액공제 대상 한도:{' '}
                <strong className="text-[#60ddbb] font-bold">{fmtManwon(extraCap)}</strong>
                <div className="text-[11px] text-[#8aa6c0] mt-1">
                  선택한 이전자의 급여 구간별 세액공제율(12% 또는 15%)을 STEP 5 연금공제에 즉시 합산 적용합니다.
                </div>
              </div>
            ) : (
              <div className="text-[#e4b46c] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                ISA 이전 요건 확인 체크가 되지 않아 자동 공제 0원으로 처리됩니다.
              </div>
            )}
          </div>
        </div>

        {/* 놓치기 쉬운 7가지 체크리스트 카드 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <CheckSquare className="w-5 h-5 text-[#60ddbb]" />
            <h3 className="text-base font-bold text-white">놓치기 쉬운 7대 절세 항목 점검</h3>
          </div>

          <p className="text-xs text-[#a7bdd4]">
            아래 항목들은 개별 요건(소득, 주택 수, 증빙)이 까다로워 시스템에서 임의로 자동 공제하지 않습니다. 해당 시 STEP 2 또는 STEP 5의 해당 입력란에 직접 반영하세요.
          </p>

          <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3.5 space-y-2 text-xs text-[#dceaff] font-mono leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>보장성 보험료 (연 100만원 한도 12%) 및 기부금 영수증</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>장기주택저당차입금 이자상환액 및 월세액(총급여 8,000만원 이하) 공제</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>부모님 연령(만 60세↑)·소득금액(100만↓) 및 형제자매 중복공제 배제</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>전통시장·대중교통 이용분 등 신용카드 추가공제 한도</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>장애인(1인 200만)·경로우대(1인 100만)·한부모(100만) 추가공제</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>국민연금 과거 미납 보험료 추납액 (실제 납부연도 전액 소득공제)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#65afff]">□</span>
              <span>중소기업 취업 청년·경력단절여성 소득세 감면 (조특법 제30조)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
