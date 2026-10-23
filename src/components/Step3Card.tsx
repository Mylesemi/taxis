/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaxInputs, PersonTaxResult } from '../types';
import {
  fmtWon,
  fmtManwon,
  cardBasicCap,
  optimize,
  optimalRangeText,
  optimalSummary,
  total,
  build,
} from '../tax-engine';
import { CreditCard, TrendingDown, Wand2, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface Step3CardProps {
  inputs: TaxInputs;
  people: PersonTaxResult[];
  onChange: <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => void;
}

export const Step3Card: React.FC<Step3CardProps> = ({ inputs, people, onChange }) => {
  const [showTable, setShowTable] = useState(false);
  const self = people[0];
  const spouse = people[1];

  const currentTotal = total(people);
  const opt = optimize(inputs);
  const gain = Math.max(0, currentTotal - opt.tax);

  const selfKids = inputs.childOwner === 'self' ? inputs.children : 0;
  const spouseKids = inputs.childOwner === 'spouse' ? inputs.children : 0;
  const selfCap = cardBasicCap(self.g, selfKids);
  const spouseCap = spouse.enabled ? cardBasicCap(spouse.g, spouseKids) : 0;

  // Chart coordinate mapping
  const samples = opt.samples;
  const minTax = Math.min(...samples.map((s) => s.tax));
  const maxTax = Math.max(...samples.map((s) => s.tax));
  const span = Math.max(maxTax - minTax, 0.0001);

  const scaleX = (v: number) => 54 + (v / 100) * 618;
  const scaleY = (v: number) => 212 - ((v - minTax) / span) * 166;

  // Key points for comparative table
  const keyShares = Array.from(
    new Set([0, 25, 50, 75, 100, inputs.cardShare, ...opt.ranges.flat()])
  ).sort((a, b) => a - b);

  const handleApplyOptimal = () => {
    onChange('cardShare', opt.share);
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 3 / 8
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          신용카드·체크카드 소득공제 및 부부 지출 배분 최적화
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          신용카드 등 사용금액 소득공제는 각자의 총급여 25% 문턱을 넘는 금액부터 공제됩니다. 맞벌이 부부의 결제 명의를 어떻게 배분하느냐에 따라 가구 전체의 결정세액이 달라집니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 입력 패널 (5 cols) */}
        <div className="lg:col-span-5 bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#243e59] pb-3">
            <CreditCard className="w-5 h-5 text-[#65afff]" />
            <h3 className="text-base font-bold text-white">2026년 가구 카드 지출액</h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              일반 신용카드 지출 총액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.creditSpend || ''}
              onChange={(e) => onChange('creditSpend', Math.max(0, Number(e.target.value) || 0))}
              placeholder="1500"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1">공제율 15% 적용</small>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              체크카드·현금영수증 지출 총액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.debitSpend || ''}
              onChange={(e) => onChange('debitSpend', Math.max(0, Number(e.target.value) || 0))}
              placeholder="1500"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1">공제율 30% 적용</small>
          </div>

          {spouse.enabled ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#dceaff]">
                  본인 명의 결제 비율
                </label>
                <span className="text-sm font-extrabold text-[#60ddbb]">
                  본인 {inputs.cardShare}% · 배우자 {100 - inputs.cardShare}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inputs.cardShare}
                onChange={(e) => onChange('cardShare', Number(e.target.value))}
                className="w-full accent-[#65afff] h-2 bg-[#091b2d] rounded-lg cursor-pointer"
              />
              <small className="block text-xs text-[#aac0d6] mt-1">
                두 카드 종류에 동일한 비율을 적용하는 시뮬레이션 모델 가정
              </small>
            </div>
          ) : (
            <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs text-[#a7bdd4]">
              배우자 계산 제외 상태이므로 본인 명의 100% 지출로 자동 계산됩니다.
            </div>
          )}

          <div className="bg-[#332c20] border-l-4 border-[#e4b46c] p-3 rounded-r-xl text-xs text-[#ffe1ad] leading-relaxed">
            보험료, 국세·지방세, 공과금, 아파트 관리비, 일부 사교육비, 면세점 지출 등 소득공제 제외 대상 지출은 포함하지 마세요. 전통시장·대중교통 추가공제는 이번 기본 자동 계산에서 제외됩니다.
          </div>

          {/* 소득공제 기본 상한 정보 */}
          <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs text-[#b5cbde] space-y-1">
            <div className="font-bold text-[#8fcaff]">2026년 귀속 카드 소득공제 기본 상한</div>
            <div>본인 상한: <span className="font-semibold text-white">{fmtManwon(selfCap)}</span> (자녀 {selfKids}명 가산) · 현재 반영: <span className="font-semibold text-white">{fmtManwon(self.card)}</span></div>
            <div>배우자 상한: <span className="font-semibold text-white">{spouse.enabled ? fmtManwon(spouseCap) : '해당 없음'}</span> · 현재 반영: <span className="font-semibold text-white">{spouse.enabled ? fmtManwon(spouse.card) : '-'}</span></div>
            <div className="text-[11px] text-[#88a8c4] pt-1">
              기본 한도: 총급여 7천만원 이하 300/350/400만원, 초과 250/275/300만원 (적격 자녀 0/1/2명 이상).
            </div>
          </div>
        </div>

        {/* 시뮬레이션 및 차트 패널 (7 cols) */}
        <div className="lg:col-span-7 bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#243e59] pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#60ddbb]" />
              <h3 className="text-base font-bold text-white">가구 세금 배분 시뮬레이션</h3>
            </div>
            {spouse.enabled && (
              <button
                type="button"
                onClick={handleApplyOptimal}
                className="text-xs bg-[#244a6a] hover:bg-[#32628d] text-[#cce9ff] border border-[#487399] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#60ddbb]" />
                최저세액 배분 적용
              </button>
            )}
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0b2136] border border-[#345b79] rounded-xl p-3">
              <small className="text-xs text-[#b8cbe0] block">현재 가구 결정세액</small>
              <b className="text-base sm:text-lg font-black text-[#9fe2ff] mt-1 block">
                {fmtWon(currentTotal)}
              </b>
            </div>
            <div className="bg-[#0b2136] border border-[#345b79] rounded-xl p-3">
              <small className="text-xs text-[#b8cbe0] block">최적 배분 시 결정세액</small>
              <b className="text-base sm:text-lg font-black text-[#78e2b3] mt-1 block">
                {fmtWon(opt.tax)}
              </b>
            </div>
            <div className="bg-[#0b2136] border border-[#345b79] rounded-xl p-3">
              <small className="text-xs text-[#b8cbe0] block">현재 대비 추가 절세 가능액</small>
              <b className="text-base sm:text-lg font-black text-[#60ddbb] mt-1 block">
                +{fmtWon(gain)}
              </b>
            </div>
          </div>

          {/* SVG Interactive Chart */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#b5cde1] flex items-center justify-between">
              <span>본인 카드 배분 비율에 따른 가구 결정세액 곡선</span>
              <span className="text-[11px] text-[#88a8c4]">(1%p 단위 시뮬레이션)</span>
            </div>

            <svg
              className="w-full h-auto bg-[#091b2e] rounded-xl border border-[#385772]"
              viewBox="0 0 700 265"
              role="img"
              aria-label="본인 카드 배분 비율에 따른 가구 결정세액 곡선"
            >
              {/* Y Axis Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const yy = 212 - (i * 166) / 4;
                const amount = minTax + (span * i) / 4;
                return (
                  <g key={i}>
                    <line
                      x1="54"
                      y1={yy}
                      x2="672"
                      y2={yy}
                      stroke="#29475e"
                      strokeDasharray="4 5"
                    />
                    <text
                      x="47"
                      y={yy + 4}
                      fill="#aac4dc"
                      textAnchor="end"
                      fontSize="10"
                    >
                      {Math.round(amount).toLocaleString('ko-KR')}
                    </text>
                  </g>
                );
              })}

              {/* X Axis labels */}
              {[0, 25, 50, 75, 100].map((v) => (
                <text
                  key={v}
                  x={scaleX(v)}
                  y="241"
                  textAnchor="middle"
                  fill="#b5cde1"
                  fontSize="11"
                >
                  {v}%
                </text>
              ))}
              <text
                x="362"
                y="259"
                textAnchor="middle"
                fill="#aac4dc"
                fontSize="11"
              >
                본인 카드 사용 비율 (배우자는 나머지)
              </text>

              {/* Optimal zone shaded rectangles */}
              {opt.ranges.map(([lo, hi], idx) => (
                <rect
                  key={idx}
                  x={scaleX(lo) - 3}
                  y="32"
                  width={Math.max(6, scaleX(hi) - scaleX(lo) + 6)}
                  height="180"
                  fill="#57dbac"
                  opacity="0.16"
                />
              ))}

              {/* Polyline for all 101 points */}
              <polyline
                fill="none"
                stroke="#8fcaff"
                strokeWidth="2.5"
                strokeLinejoin="round"
                points={samples
                  .map((p) => `${scaleX(p.share)},${scaleY(p.tax)}`)
                  .join(' ')}
              />

              {/* Highlight line on optimal range */}
              {opt.ranges.map(([lo, hi], idx) => {
                const arr = samples.filter((z) => z.share >= lo && z.share <= hi);
                return (
                  <polyline
                    key={idx}
                    fill="none"
                    stroke="#57dbac"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                    points={arr
                      .map((p) => `${scaleX(p.share)},${scaleY(p.tax)}`)
                      .join(' ')}
                  />
                );
              })}

              {/* Pointer for current user share */}
              <circle
                cx={scaleX(inputs.cardShare)}
                cy={scaleY(currentTotal)}
                r="7"
                fill="#ffd078"
                stroke="#152d42"
                strokeWidth="3"
              />
              <text
                x="54"
                y="19"
                fill="#b5cde1"
                fontSize="11"
                fontWeight="bold"
              >
                가구 결정세액 (만원)
              </text>
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-[#c0d5e8] pt-1">
              <span className="flex items-center gap-1.5">
                <i className="inline-block w-2.5 h-2.5 rounded-sm bg-[#8fcaff]"></i>
                예상 결정세액 곡선
              </span>
              <span className="flex items-center gap-1.5">
                <i className="inline-block w-2.5 h-2.5 rounded-sm bg-[#57dbac]"></i>
                최저세액 최적 구간
              </span>
              <span className="flex items-center gap-1.5">
                <i className="inline-block w-2.5 h-2.5 rounded-sm bg-[#ffd078]"></i>
                현재 설정치 ({inputs.cardShare}%)
              </span>
            </div>
          </div>

          {/* Track Bar */}
          <div className="space-y-1">
            <div className="h-3 bg-[#28445d] rounded-lg relative overflow-hidden">
              {opt.ranges.map(([lo, hi], idx) => (
                <div
                  key={idx}
                  className="absolute top-0 h-full bg-[#56d5a7]"
                  style={{
                    left: `${lo}%`,
                    width: `${Math.max(1, hi - lo)}%`,
                  }}
                />
              ))}
              <div
                className="absolute top-0 h-full w-1.5 bg-[#ffcf7a] shadow-md -translate-x-1/2"
                style={{ left: `${inputs.cardShare}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#a6bed6]">
              <span>본인 0% · 배우자 100%</span>
              <span>본인 100% · 배우자 0%</span>
            </div>
          </div>

          {/* Narrative Tip */}
          <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-3 text-xs leading-relaxed text-[#c8d9e9]">
            현재 본인 {inputs.cardShare}% / 배우자 {100 - inputs.cardShare}% 배분. 최저세액 배분 범위는{' '}
            <strong className="text-[#60ddbb] font-bold">{optimalRangeText(opt)}</strong>이며, 현재 대비 예상 추가 절세액은{' '}
            <strong className="text-[#60ddbb] font-bold">{fmtWon(gain)}</strong>입니다.
            초록색 밴드는 1%p 단위 탐색에서 최저세액과 1원 이내 차이가 나는 동률 구간입니다.
          </div>

          {/* Comparative Table Accordion */}
          <div className="border border-[#2a455f] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              className="w-full p-2.5 bg-[#10273d] text-xs font-semibold text-[#a7d8ff] flex items-center justify-between hover:bg-[#15314c] transition-colors"
            >
              <span>배분 비율별 가구 세액 비교표 {showTable ? '접기' : '펼치기'}</span>
              {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTable && (
              <div className="p-3 bg-[#091b2e] overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="border-b border-[#2d4d6a] text-[#8fcaff]">
                      <th className="text-left py-1.5">본인 / 배우자</th>
                      <th className="py-1.5">가구 결정세액</th>
                      <th className="py-1.5">현재 대비 차이</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyShares.map((v) => {
                      const t = opt.samples[v].tax;
                      const isSelected = v === inputs.cardShare;
                      const isOptimal = opt.all.includes(v);
                      return (
                        <tr
                          key={v}
                          className={`border-b border-[#1b344c] ${
                            isSelected
                              ? 'text-[#ffda8d] font-bold bg-[#ffd078]/10'
                              : isOptimal
                              ? 'text-[#80e6bb] font-bold'
                              : 'text-[#dceaff]'
                          }`}
                        >
                          <td className="text-left py-1.5">
                            {v}% / {100 - v}% {isSelected ? '● 현재' : isOptimal ? '★ 최적' : ''}
                          </td>
                          <td className="py-1.5">{fmtWon(t)}</td>
                          <td className="py-1.5">{fmtWon(currentTotal - t)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
