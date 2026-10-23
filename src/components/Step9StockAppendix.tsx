/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StockGiftInputs } from '../types';
import { calculateStockGift, fmtWon } from '../tax-engine';
import { Globe2, AlertTriangle, ExternalLink, ShieldCheck, CheckSquare } from 'lucide-react';

export const Step9StockAppendix: React.FC = () => {
  const [stockInputs, setStockInputs] = useState<StockGiftInputs>({
    stockCost: 2000,
    stockGift: 10000,
    stockSale: 11000,
    stockHold: 'short',
    stockPrior: 0,
    stockSelfGains: 0,
    stockSpouseGains: 0,
    stockFees: 0,
  });

  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const result = calculateStockGift(stockInputs);

  const toggleCheck = (idx: number) => {
    const next = new Set(checkedItems);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCheckedItems(next);
  };

  const checklistItems = [
    {
      title: '증여가액 산정 (법정 평가방법 준수)',
      detail: '해외 상장주식의 세법상 평가액(증여일 전후 각 2개월간의 최종시세가액 평균액 또는 증여일 종가 규정)과 증여일 기준환율을 정확히 확인합니다.',
    },
    {
      title: '10년간 배우자 증여 누계 (6억원 한도)',
      detail: '배우자 증여재산공제 10년간 6억원에서 기존에 증여한 부동산, 현금, 주식 등 증여가액을 차감하여 잔여 공제액을 확인합니다.',
    },
    {
      title: '실제 주식 이전 및 증여세 신고',
      detail: '배우자 명의 해외주식 계좌로 실질적으로 소유권을 대체 이전(대체출고)하고, 증여일이 속하는 달의 말일부터 3개월 이내 증여세를 정식 신고합니다.',
    },
    {
      title: '이월과세 기간 (1년) 및 양도소득세 확정신고',
      detail: '2025년 1월 1일 이후 증여받은 주식은 1년 이내 양도 시 이월과세(증여자 원래 취득가액 적용)가 적용되므로 보유기간 요건을 확인하고, 매도 다음 해 5월 양도세를 신고합니다.',
    },
    {
      title: '소유·처분대금의 실질적 귀속 (차명 거래 배제)',
      detail: '증여받은 배우자가 주식을 실질적으로 소유·관리하고 매각대금을 본인의 자산으로 운용해야 합니다. 매각대금을 곧바로 원래 증여자에게 송금하면 증여가 부인될 수 있습니다.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1a4167] to-[#142d47] border border-[#304d68] rounded-2xl p-5">
        <span className="inline-block bg-[#244a6a] text-[#cce9ff] text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
          STEP 9 · APPENDIX
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          해외주식 부부간 증여 절세 시뮬레이터
        </h2>
        <p className="text-sm text-[#a7bdd4]">
          수익이 크게 난 해외 상장주식을 배우자에게 <strong>증여</strong>한 뒤 양도(매도)할 때의 양도소득세 차이를 시뮬레이션합니다. (상속은 사망에 따른 별도 세목입니다)
        </p>
      </div>

      {/* 법적 배경 안내 Banner */}
      <div className="bg-[#12334b] border-l-4 border-[#65afff] p-4 rounded-r-2xl space-y-2 text-xs text-[#dceaff] leading-relaxed">
        <div className="font-bold text-sm text-[#9fe2ff] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#60ddbb]" />
          합법성 및 2025년 개정 주식 이월과세 제도
        </div>
        <p>
          배우자에게 실제로 주식 소유권을 이전하고 세법상 평가·신고·이월과세 요건을 지키는 증여 자체는 합법적인 절세 방법입니다.
        </p>
        <p>
          단, <strong>2025년 1월 1일 이후 증여받은 주식을 증여일로부터 1년 이내에 양도하는 경우</strong>, 소득세법 제97조의2 개정에 따라 <strong>증여자의 원래 취득가액</strong>을 취득가액으로 보아 양도소득세를 계산하는 <strong>이월과세</strong>가 적용됩니다. 취득가액을 높여 양도세를 절세하려면 1년 초과 보유가 필요합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 증여·매도 시나리오 입력 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-[#243e59] pb-3">
            증여 및 매도 시나리오
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              증여자 최초 취득가액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={stockInputs.stockCost || ''}
              onChange={(e) => setStockInputs({ ...stockInputs, stockCost: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="예: 2000"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              증여 당시 세법상 평가가액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={stockInputs.stockGift || ''}
              onChange={(e) => setStockInputs({ ...stockInputs, stockGift: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="예: 10000"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1">
              상장주식은 법정 평가방법(증여일 전후 2개월 종가평균 등)으로 산정 필요
            </small>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              배우자의 예상 매도가액 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={stockInputs.stockSale || ''}
              onChange={(e) => setStockInputs({ ...stockInputs, stockSale: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="예: 11000"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              증여 후 매도 시점 (보유기간)
            </label>
            <select
              value={stockInputs.stockHold}
              onChange={(e) => setStockInputs({ ...stockInputs, stockHold: e.target.value as 'short' | 'long' })}
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              <option value="short">1년 이내 매도 (소득세법 제97조의2 이월과세 적용)</option>
              <option value="long">1년 초과 매도 (증여 평가가액 취득가 인정)</option>
            </select>
          </div>
        </div>

        {/* 부부별 조건 및 기타 정보 */}
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-[#243e59] pb-3">
            부부별 양도차익 및 증여공제 조건
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              최근 10년 배우자 증여 누계 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={stockInputs.stockPrior || ''}
              onChange={(e) => setStockInputs({ ...stockInputs, stockPrior: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
            <small className="block text-xs text-[#aac0d6] mt-1">
              10년간 배우자 증여재산공제 한도 6억원(60,000만원)
            </small>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
                증여자 타 주식 순차익 (만원)
              </label>
              <input
                type="number"
                value={stockInputs.stockSelfGains || ''}
                onChange={(e) => setStockInputs({ ...stockInputs, stockSelfGains: Number(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#65afff]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
                배우자 타 주식 순차익 (만원)
              </label>
              <input
                type="number"
                value={stockInputs.stockSpouseGains || ''}
                onChange={(e) => setStockInputs({ ...stockInputs, stockSpouseGains: Number(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#65afff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#dceaff] mb-1.5">
              증여·매도 관련 수수료 및 비용 (만원)
            </label>
            <input
              type="number"
              min="0"
              value={stockInputs.stockFees || ''}
              onChange={(e) => setStockInputs({ ...stockInputs, stockFees: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="0"
              className="w-full bg-[#091b2d] text-white border border-[#486480] rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            />
          </div>

          <p className="text-[11px] text-[#8aa6c0] leading-relaxed">
            기본 가정: 국내 거주자 부부, 일반 해외 상장주식, 양도소득세 20% + 지방소득세 2% = 22%, 1인당 연간 기본공제 250만원. 실제 거래 시점별 결제 환율 및 필요경비 인정 여부에 따라 오차가 발생할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 3 Metric Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5">
          <span className="text-xs text-[#a7bdd4] block">증여 없이 본인 직접 매도 시 양도세</span>
          <div className="text-xl sm:text-2xl font-black text-white mt-2">
            {fmtWon(result.direct)}
          </div>
          <small className="text-[11px] text-[#8aa6c0] mt-1 block">
            최초 취득가 기준 양도차익 과세
          </small>
        </div>

        <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5">
          <span className="text-xs text-[#a7bdd4] block">배우자 증여 후 매도 시 양도세</span>
          <div className="text-xl sm:text-2xl font-black text-[#9fe2ff] mt-2">
            {fmtWon(result.gifted)}
          </div>
          <small className="text-[11px] text-[#8aa6c0] mt-1 block">
            {stockInputs.stockHold === 'short' ? '1년 이내 이월과세 적용 가정' : '1년 초과 증여평가액 취득가 인정'}
          </small>
        </div>

        <div className="bg-[#13263c] border border-[#2e6b52] rounded-2xl p-5 bg-gradient-to-b from-[#13263c] to-[#0d2a23]">
          <span className="text-xs text-[#73d7b0] block font-bold">
            양도소득세 차이 (비용 차감 전)
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#60ddbb] mt-2">
            {result.delta >= 0 ? '+' : ''}{fmtWon(result.delta)}
          </div>
          <small className="text-[11px] text-[#9bd9c4] mt-1 block">
            {result.delta >= 0 ? '예상 절세 가능성' : '증여 후 세금 증가'}
          </small>
        </div>
      </div>

      {/* Detailed Analysis Output */}
      <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
        <h3 className="text-base font-bold text-white border-b border-[#243e59] pb-3">
          시뮬레이션 상세 분석 및 세무 점검
        </h3>

        <div className="bg-[#0b1d30] border border-[#23425f] rounded-xl p-4 text-xs sm:text-sm leading-relaxed text-[#dceaff] space-y-2 font-mono">
          {result.messages.map((msg, i) => (
            <div
              key={i}
              className={msg.startsWith('주의:') ? 'text-[#ffd078] font-bold' : 'text-[#b5cbde]'}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>

      {/* 5 Real-world Action Checklists */}
      <div className="bg-[#13263c] border border-[#304d68] rounded-2xl p-5 space-y-3">
        <h3 className="text-base font-bold text-white border-b border-[#243e59] pb-3">
          실행 전 반드시 확인해야 할 5대 실무 사항
        </h3>

        <div className="space-y-2.5">
          {checklistItems.map((item, idx) => {
            const isChecked = checkedItems.has(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-[#0f2d26] border-[#3e8a71]'
                    : 'bg-[#0b1d30] border-[#25425f] hover:border-[#385e82]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#60ddbb] w-4 h-4 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className={`text-xs font-bold ${isChecked ? 'text-[#80e6bb]' : 'text-white'}`}>
                    {item.title}
                  </div>
                  <p className="text-xs text-[#a7bdd4] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer on separation from year-end settlement */}
      <div className="bg-[#10233a] border border-[#304d68] rounded-2xl p-4 text-xs text-[#a7bdd4] space-y-1">
        <div className="font-bold text-[#8fcaff]">근로소득 연말정산과의 명확한 구분</div>
        <p>
          해외주식 양도소득세 및 증여세는 근로소득 연말정산의 세액공제나 소득공제 항목이 아닙니다. 해외주식 양도소득은 5월 종합소득세 신고기간에 별도로 확정신고·납부하며, 이 Appendix의 계산 결과는 STEP 8의 근로소득 절세액에 합산되지 않습니다.
        </p>
        <div className="flex gap-4 pt-2 text-[11px] text-[#8fcaff]">
          <a
            href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7728&mi=2356"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline"
          >
            국세청 증여재산공제 안내 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
