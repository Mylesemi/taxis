/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaxInputs, PersonTaxResult } from '../types';
import {
  fmtWon,
  fmtManwon,
  build,
  total,
  optimize,
  optimalRangeText,
} from '../tax-engine';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  ChevronRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface Step8StrategyProps {
  inputs: TaxInputs;
  people: PersonTaxResult[];
  onReset: () => void;
}

export const Step8Strategy: React.FC<Step8StrategyProps> = ({ inputs, people, onReset }) => {
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set());

  const currentTotal = total(people);
  const baselinePeople = build(inputs, null, true);
  const beforeTax = total(baselinePeople);
  const saving = Math.max(0, beforeTax - currentTotal);

  // Attribution calculation
  const taxBeforeCredits = people.reduce(
    (v, x) =>
      v + (x.enabled ? Math.max(0, x.assessed - x.employment) * 1.1 : 0),
    0
  );
  const deductionGain = Math.max(0, beforeTax - taxBeforeCredits);
  const creditGain = Math.max(0, taxBeforeCredits - currentTotal);

  // Optimization for card
  const opt = optimize(inputs);
  const cardExtraGain = Math.max(0, currentTotal - opt.tax);

  // Helper for counterfactual recalculations
  const getSimulatedTax = (overrides: Partial<TaxInputs>) => {
    const testInputs = { ...inputs, ...overrides };
    return total(build(testInputs));
  };

  const impactOfRemoving = (overrides: Partial<TaxInputs>) =>
    Math.max(0, getSimulatedTax(overrides) - currentTotal);

  const gainFromApplying = (overrides: Partial<TaxInputs>) =>
    Math.max(0, currentTotal - getSimulatedTax(overrides));

  // Build tailored checklist items
  interface ActionItem {
    id: string;
    title: string;
    detail: string;
    gain?: number;
    already?: number;
    cost?: number;
    kind: 'cash' | 'allocation' | 'verified' | 'unverified';
    note: string;
  }

  const actions: ActionItem[] = [];

  // Pension items
  const suffixes: ('Self' | 'Spouse')[] = ['Self', 'Spouse'];
  suffixes.forEach((suffix, i) => {
    if (!people[i].enabled) return;
    const who = people[i].who;
    const ps = suffix === 'Self' ? inputs.psSelf : inputs.psSpouse;
    const irp = suffix === 'Self' ? inputs.irpSelf : inputs.irpSpouse;
    const eligible = Math.min(900, Math.min(600, ps) + irp);
    const gap = Math.max(0, 900 - eligible);

    const already = impactOfRemoving(
      suffix === 'Self' ? { psSelf: 0, irpSelf: 0 } : { psSpouse: 0, irpSpouse: 0 }
    );

    let psTarget = ps;
    let irpTarget = irp;
    if (gap > 0) {
      const addPs = Math.min(Math.max(0, 600 - ps), gap);
      psTarget += addPs;
      irpTarget += Math.max(0, gap - addPs);
    }
    const additional = psTarget - ps + (irpTarget - irp);
    const benefit = gainFromApplying(
      suffix === 'Self'
        ? { psSelf: psTarget, irpSelf: irpTarget }
        : { psSpouse: psTarget, irpSpouse: irpTarget }
    );

    actions.push({
      id: 'pension' + suffix,
      title: `${who} 연금저축·IRP 납입 최적화`,
      detail: `공제대상 ${fmtManwon(eligible)} / 일반 한도 900만원. 추가 적격 납입 ${fmtManwon(additional)} 시뮬레이션. 연금계좌는 중도인출 제약과 추후 연금소득세 과세가 있습니다.`,
      already,
      gain: benefit,
      cost: additional,
      kind: 'cash',
      note: '추가 납입금은 지출로 소멸하는 비용이 아니라 장기 묶이는 본인 금융자산입니다. 세액공제 한도 및 실제 산출세액 범위 내에서만 감면됩니다.',
    });
  });

  // Children
  const c = inputs.children;
  if (c > 0) {
    const eligible = inputs.childrenAgeEligible;
    const cc =
      eligible === 0
        ? 0
        : eligible === 1
        ? 25
        : eligible === 2
        ? 55
        : 55 + (eligible - 2) * 40;
    const oldChild = impactOfRemoving({ children: 0, childrenAgeEligible: 0 });

    actions.push({
      id: 'children',
      title: '자녀 기본공제 & 자녀세액공제 자격 확인',
      detail: `입력 자녀 ${c}명, 2026년 9세 이상 적격 자녀 ${eligible}명. 지출을 늘려 공제받는 구조가 아니며, 기본공제 귀속과 맞벌이 중복 신청 여부를 점검하세요.`,
      already: oldChild,
      kind: 'verified',
      note: `자녀세액공제 소득세 산출 공제액 ${fmtManwon(cc)}은 기본공제의 소득공제 효과와 별개입니다. 현재 확보액은 자녀 관련 입력을 제외했을 때의 세금 증가분입니다.`,
    });
  }

  // Card allocation
  const cardAlready = impactOfRemoving({ creditSpend: 0, debitSpend: 0 });
  actions.push({
    id: 'card',
    title: '신용·체크카드 결제 명의 최적 배분 계획',
    detail: `본인 25% 문턱 ${fmtManwon(people[0].g * 0.25)}${people[1].enabled ? ' / 배우자 ' + fmtManwon(people[1].g * 0.25) : ''}. 현재 본인 비중 ${inputs.cardShare}%, 최저세액 최적 배분 ${optimalRangeText(opt)}.`,
    already: cardAlready,
    gain: cardExtraGain,
    kind: 'allocation',
    note: '추가 절세 이익은 동일한 가구 지출을 미래에 다른 사람 명의로 결제한다는 계획 가정이며, 이미 결제된 카드 내역을 사후에 변경할 수는 없습니다.',
  });

  // Medical
  const medOwner = inputs.medicalOwner;
  const mg = medOwner === 'self' ? people[0].g : people[1].g;
  const med = inputs.medical;
  const threshold = mg * 0.03;
  if (mg > 0) {
    const gap = Math.max(0, threshold - med);
    const medAlready = impactOfRemoving({ medical: 0 });
    actions.push({
      id: 'medical',
      title: '의료비 누락 영수증 및 실손보험금 정산 점검',
      detail: `부담자 총급여 3% 문턱 ${fmtManwon(threshold)}, 입력 의료비 ${fmtManwon(med)}. ${gap > 0 ? '문턱까지 ' + fmtManwon(gap) + ' 남음. ' : ''}안경·콘택트렌즈·보청기 등 간소화 미반영 영수증을 확인하세요.`,
      already: medAlready,
      kind: 'verified',
      note: '추가 적격 의료비의 누락액이 입력되지 않아 추가 절세액은 산출하지 않습니다. 절세를 위해 불필요한 의료비를 지출하는 것은 경제적 손실입니다.',
    });
  }

  // Education
  const edu = inputs.education;
  const maxEdu = c * 300;
  if (c > 0) {
    const gap = Math.max(0, maxEdu - edu);
    const eduAlready = impactOfRemoving({ education: 0 });
    actions.push({
      id: 'education',
      title: '자녀 교육비 적격 증빙 확인',
      detail: `입력 교육비 ${fmtManwon(edu)}, 취학 전 아동 ${c}명 기준 법정 한도 ${fmtManwon(maxEdu)}. 한도까지 ${fmtManwon(gap)}. 유치원·어린이집·학원비 영수증을 확인하세요.`,
      already: eduAlready,
      kind: 'verified',
      note: '한도까지의 차액은 추가 지출 권장액이 아닙니다. 이미 지출했으나 간소화에 누락된 학원비·체육시설 영수증을 찾아 반영하세요.',
    });
  }

  // ISA
  const isaAlready = impactOfRemoving({ isaTransfer: 0 });
  if (!inputs.isaEligible) {
    actions.push({
      id: 'isa',
      title: 'ISA 만기금 연금계좌 이전 검토',
      detail: '만기일로부터 60일 이내 연금계좌로 이전 시 이전액의 10%(최대 300만원) 한도 추가. STEP 6에서 적격 여부를 확인하세요.',
      kind: 'unverified',
      note: '적격 이전 여부가 미확인되어 절세액이 반영되지 않았습니다. ISA 계좌 자체의 비과세 혜택은 연말정산 결정세액과 별도입니다.',
    });
  } else {
    actions.push({
      id: 'isa',
      title: 'ISA 만기 이전 증빙 보관',
      detail: `적격 이전액 ${fmtManwon(inputs.isaTransfer)}, 추가 공제대상 한도 최대 300만원 확보 완료.`,
      already: isaAlready,
      kind: 'verified',
      note: 'ISA 추가 공제는 해당 연도 산출세액 범위 내에서 최종 감면됩니다.',
    });
  }

  // Public Pension & Others
  const npAlready = impactOfRemoving({ npSelf: 0, npSpouse: 0 });
  actions.push({
    id: 'np',
    title: '국민연금 등 공적연금보험료 납부확인서 대조',
    detail: '현재 입력한 공적연금 근로자 부담액을 공단 납부확인서와 대조하세요. 미납분 추납은 납부 연도에 전액 소득공제됩니다.',
    already: npAlready,
    kind: 'verified',
    note: '추납은 절세 효과 외에도 미래 국민연금 수령액 증가 여부를 종합적으로 비교해야 합니다.',
  });

  const otherAlready = impactOfRemoving({
    otherDedSelf: 0,
    otherDedSpouse: 0,
    creditOtherSelf: 0,
    creditOtherSpouse: 0,
  });
  actions.push({
    id: 'other',
    title: '보장성 보험료·기부금·월세 세액공제 점검',
    detail: '증빙과 법정 요건을 확인한 금액만 STEP 2 기타 소득공제 또는 STEP 5 기타 세액공제에 반영하세요.',
    already: otherAlready,
    kind: 'unverified',
    note: '여러 공제의 합산값이므로 증빙 자료 확인 전 가상 추정치입니다.',
  });

  actions.push({
    id: 'proof',
    title: '국세청 홈택스 간소화 자료 & 원천징수영수증 최종 대조',
    detail: '부양가족 소득·나이 요건, 자녀 중복공제 여부, 기납부세액 및 누락 증빙을 회사 최종 제출 전 점검하세요.',
    kind: 'unverified',
    note: '실제 누락 자료가 확인되지 않아 추가 절세액은 산출하지 않습니다.',
  });

  const toggleAction = (id: string) => {
    const next = new Set(checkedActions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedActions(next);
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 8 / 8 · 최종 결과
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          2026년 귀속 연말정산 종합 절세 시뮬레이션 결과
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          현재 입력 상태를 기준으로 아무런 추가 공제를 적용하지 않은 기본 비교 시나리오와 대비한 종합 절세 효과입니다.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5">
          <span className="text-xs text-[#a7bdd4] block">공제 전 비교 시나리오 가구 세금</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {fmtWon(beforeTax)}
          </div>
          <small className="text-[11px] text-[#8aa6c0] mt-1 block">
            근로소득공제 + 본인기본공제(150만) + 근로소득세액공제만 적용
          </small>
        </div>

        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5">
          <span className="text-xs text-[#a7bdd4] block">현재 입력 기준 예상 가구 결정세액</span>
          <div className="text-2xl sm:text-3xl font-black text-[#9fe2ff] mt-2">
            {fmtWon(currentTotal)}
          </div>
          <small className="text-[11px] text-[#8aa6c0] mt-1 block">
            입력된 모든 인적·카드·연금·의료·교육 세액공제 반영
          </small>
        </div>

        <div className="bg-[#13263c] border border-[#2e6b52] rounded-2xl p-5 bg-gradient-to-b from-[#13263c] to-[#0d2a23]">
          <span className="text-xs text-[#73d7b0] block font-bold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#60ddbb]" />
            공제에 따른 추정 절세액 (세금 절감)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#60ddbb] mt-2">
            {fmtWon(saving)}
          </div>
          <small className="text-[11px] text-[#9bd9c4] mt-1 block">
            비교 시나리오 대비 순수하게 줄어든 세금 합계
          </small>
        </div>
      </div>

      {/* Attribution Table: 어떤 항목이 세금을 줄였을까? */}
      <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
          <Layers className="w-5 h-5 text-[#65afff]" />
          <h3 className="text-base font-bold text-white">어떤 항목이 세금을 줄였을까? (절세 구성 분해)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-right">
            <thead>
              <tr className="border-b border-[#2c4d6c] text-[#8fcaff]">
                <th className="text-left py-2 font-bold">절세 구성 항목</th>
                <th className="py-2 font-bold">추정 절세액</th>
                <th className="py-2 font-bold">비율</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3b56]">
              <tr>
                <td className="text-left py-2.5 text-[#dceaff]">
                  가족 부양·카드·공적연금 등 소득공제에 따른 세금 감소
                </td>
                <td className="py-2.5 font-bold text-white">{fmtWon(deductionGain)}</td>
                <td className="py-2.5 text-[#a7bdd4]">
                  {saving > 0 ? Math.round((deductionGain / saving) * 100) : 0}%
                </td>
              </tr>
              <tr>
                <td className="text-left py-2.5 text-[#dceaff]">
                  연금저축·IRP·의료·교육·자녀 등 세액공제에 따른 세금 감소
                </td>
                <td className="py-2.5 font-bold text-white">{fmtWon(creditGain)}</td>
                <td className="py-2.5 text-[#a7bdd4]">
                  {saving > 0 ? Math.round((creditGain / saving) * 100) : 0}%
                </td>
              </tr>
              <tr className="bg-[#0b1d30] font-extrabold text-[#78e2b3]">
                <td className="text-left py-3 px-2 rounded-l-lg">총 추정 절세액</td>
                <td className="py-3 font-black text-base">{fmtWon(saving)}</td>
                <td className="py-3 px-2 rounded-r-lg">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[#8aa6c0] leading-relaxed">
          ※ 기본 비교 시나리오는 근로소득공제·본인 기본공제·근로소득세액공제만 적용합니다. 위 두 효과는 법정 순서(소득공제 후 세액공제)에 따라 분해한 단계별 차이입니다.
        </p>
      </div>

      {/* 맞춤 실행 체크리스트 (Action Plan) */}
      <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#243e59] pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#60ddbb]" />
            <h3 className="text-base font-bold text-white">최대 절세를 위한 맞춤 실행 체크리스트</h3>
          </div>
          <span className="text-xs text-[#8fcaff] font-mono">
            {checkedActions.size} / {actions.length} 항목 완료
          </span>
        </div>

        <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed text-[#b5cbde]">
          현재 입력한 공제 전체에 따른 추정 세금 감소: <strong className="text-white font-bold">{fmtWon(saving)}</strong>
          <br />
          아래 항목별 금액은 ‘해당 공제를 제외하면 세금이 얼마나 늘어나는가(현재 반영분)’와 ‘추가 행동 시 세금이 얼마나 더 줄어드는가(추가 가능분)’를 정밀하게 분리 계산한 수치입니다. (개별 항목 계산값은 중복될 수 있으므로 단순 합산 금지)
        </div>

        <div className="space-y-3">
          {actions.map((item) => {
            const isChecked = checkedActions.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleAction(item.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-[#0f2d26] border-[#3e8a71]'
                    : 'bg-[#0b1d30] border-[#25425f] hover:border-[#385e82]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent div
                    className="mt-1 accent-[#60ddbb] w-4 h-4 cursor-pointer"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className={`text-sm font-bold ${isChecked ? 'text-[#80e6bb]' : 'text-white'}`}>
                        {item.title}
                      </span>
                    </div>

                    <p className="text-xs text-[#b0c6db] leading-relaxed">
                      {item.detail}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                      {item.already !== undefined && item.already > 0 && (
                        <span className="bg-[#102a45] text-[#9fc9ff] border border-[#2d527a] px-2 py-0.5 rounded-md font-semibold">
                          현재 반영된 세금 감소: {fmtManwon(item.already)}
                        </span>
                      )}

                      {item.gain !== undefined && item.gain > 0 && (
                        <span className="bg-[#12382e] text-[#7ee4b8] border border-[#296653] px-2 py-0.5 rounded-md font-bold">
                          추가 행동 시 세금 감소: +{fmtWon(item.gain)}
                        </span>
                      )}

                      {item.cost !== undefined && item.cost > 0 && (
                        <span className="bg-[#36271c] text-[#ffd19b] border border-[#6b4c30] px-2 py-0.5 rounded-md">
                          필요 추가 납입금: {fmtManwon(item.cost)}
                        </span>
                      )}

                      {(!item.gain || item.gain === 0) && item.already === undefined && (
                        <span className="bg-[#1b2633] text-[#b6c5d5] border border-[#35485d] px-2 py-0.5 rounded-md">
                          추가 이익: 증빙·적격금액 확인 후 산출
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#829db5] leading-relaxed">
                      {item.note}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 부부 카드 배분 변경 추가 절세 안내 */}
      {people[1].enabled && (
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#ffcf7a]" />
            <h3 className="text-base font-bold text-white">부부 카드 배분 변경으로 추가 절세 가능성</h3>
          </div>
          <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed text-[#dceaff]">
            현재 본인 결제 비중: <span className="font-bold text-white">{inputs.cardShare}%</span> → 단순 모델상 최저세액 최적 배분:{' '}
            <strong className="text-[#60ddbb] font-bold">{optimalRangeText(opt)}</strong>
            <br />
            이 배분을 미래 가구 지출 계획에 적용할 경우 추가 세금 감소 잠재력:{' '}
            <strong className="text-[#60ddbb] font-bold">+{fmtWon(cardExtraGain)}</strong>
          </div>
          <p className="text-[11px] text-[#8aa6c0]">
            ※ 미래 지출 계획 참고용입니다. 이미 발생한 카드 결제는 사후에 다른 사람 명의로 변경할 수 없습니다.
          </p>
        </div>
      )}

      {/* 주의 및 법적 한계 고지 */}
      <div className="bg-[#332c20] border-l-4 border-[#e4b46c] p-4 rounded-r-2xl space-y-2 text-xs text-[#ffe1ad] leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-sm text-[#ffd580]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          결과 해석 시 유의사항 및 신뢰도 안내
        </div>
        <p>
          본 서비스의 추정치는 <strong>학습 및 절세 계획 수립을 위한 시뮬레이션</strong>이며, 국세청 공식 세액 확정 신고 프로그램이 아닙니다. 실제 지출·납입 증빙과 다르게 최대 공제 프리셋을 적용한 경우 결과는 가상 시나리오입니다.
        </p>
        <p>
          2026년 귀속 세법 특례, 추가 소득공제 종합한도, 보장성 보험료·주택·기부금 세부요건, 특별공제와 표준세액공제 선택, 부양가족 자격, 연말정산 세액공제 적용 순서 등을 완전 반영하지 않습니다.
        </p>
        <p className="font-bold text-white">
          추정 절세액 {fmtWon(saving)}은 '공제 전 비교 시나리오 대비 예상 세금 감소'이며 실제 현금 환급액이 아닙니다. 실제 환급은 이미 원천징수된 기납부세액에 따라 결정됩니다.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-3 bg-[#29455f] hover:bg-[#385c7e] text-[#eaf2ff] font-bold text-sm rounded-xl border border-[#446a8f] flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          기본값으로 초기화
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="w-full sm:w-auto px-6 py-3 bg-[#6db7ff] hover:bg-[#85c4ff] text-[#081725] font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          결과 인쇄 / PDF 저장
        </button>
      </div>
    </div>
  );
};
