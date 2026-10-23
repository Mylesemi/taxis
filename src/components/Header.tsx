/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { SUPPORTED_TAX_YEARS } from '../tax-rules';

interface HeaderProps {
  selectedYear: number;
  onSelectYear: (year: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedYear, onSelectYear }) => {
  return (
    <header className="bg-radial-[ellipse_at_85%_10%] from-[#193f64] via-[#122d49] to-[#091525] border-b border-[#304d68] pt-6 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#f3f9ff]">
                TAXIS<span className="text-[#60ddbb]">.</span>
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8fcaff] px-2.5 py-1 bg-[#102d49] border border-[#355874] rounded-md">
                2026 v1.4 Pro
              </span>
            </div>
            <div className="text-xs text-[#9bbad4] tracking-wide mt-1.5 font-medium">
              Tax Analysis & Intelligence Simulator
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#132e48] border border-[#3d6a87] rounded-xl p-2 sm:p-2.5">
            <Calendar className="w-4 h-4 text-[#8fcaff]" />
            <label htmlFor="taxYearSelect" className="text-xs font-semibold text-[#b2c9df] whitespace-nowrap">
              귀속연도
            </label>
            <select
              id="taxYearSelect"
              value={selectedYear}
              onChange={(e) => onSelectYear(Number(e.target.value))}
              aria-label="귀속연도 선택"
              className="bg-[#091b2d] text-[#eaf2ff] text-xs sm:text-sm font-medium border border-[#486480] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#65afff]"
            >
              {SUPPORTED_TAX_YEARS.map((y) => (
                <option key={y.year} value={y.year} disabled={!y.isVerified}>
                  {y.year}년 귀속 {y.isVerified ? '· 검증완료' : '· 추후 지원'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-7">
          <div className="text-xs font-bold tracking-widest text-[#67ddbe] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            2026 TAX YEAR · 2027 SETTLEMENT
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#f3f9ff] tracking-tight mt-2 leading-tight">
            세금을 이해하고,<br />
            <span className="text-[#80c5ff]">절세를 설계하다.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#b9cee0] mt-2 max-w-2xl">
            2026년 귀속 대한민국 근로소득 연말정산 및 맞벌이 부부 합산 지출 배분 절세 시뮬레이터
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-[#b9d7ec]">
            <span className="bg-[#112c45] border border-[#355874] rounded-lg px-2.5 py-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#60ddbb]" />
              9단계 정밀 시뮬레이션
            </span>
            <span className="bg-[#112c45] border border-[#355874] rounded-lg px-2.5 py-1">
              실시간 부부 세액 비교 &amp; 최적화
            </span>
            <span className="bg-[#112c45] border border-[#355874] rounded-lg px-2.5 py-1">
              브라우저 단독 실행 (개인정보 서버 미전송)
            </span>
            <span className="bg-[#112c45] border border-[#355874] rounded-lg px-2.5 py-1">
              GitHub Pages 배포 규격 준수
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
