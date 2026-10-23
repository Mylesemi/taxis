/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TaxInputs } from './types';
import { build, total, runAuditTests } from './tax-engine';
import { Header } from './components/Header';
import { TaxFlowchart } from './components/TaxFlowchart';
import { StepNavigation } from './components/StepNavigation';
import { Step1Salary } from './components/Step1Salary';
import { Step2Family } from './components/Step2Family';
import { Step3Card } from './components/Step3Card';
import { Step4TaxBase } from './components/Step4TaxBase';
import { Step5TaxCredits } from './components/Step5TaxCredits';
import { Step6ISA } from './components/Step6ISA';
import { Step7Settlement } from './components/Step7Settlement';
import { Step8Strategy } from './components/Step8Strategy';
import { Step9StockAppendix } from './components/Step9StockAppendix';
import { AuditSection } from './components/AuditSection';
import { ArrowLeft, ArrowRight, RotateCcw, AlertTriangle, ExternalLink } from 'lucide-react';

const INITIAL_INPUTS: TaxInputs = {
  // STEP 1
  salary: 13000,
  bonus: 13000,
  nonTaxPay: 0,
  withheld: 0,
  spouseSalary: 5000,
  spouseWithheld: 0,
  spouseEnabled: 'yes',

  // STEP 2
  children: 2,
  childOwner: 'self',
  childrenAgeEligible: 0,
  parentsSelf: 0,
  parentsSpouse: 0,
  npSelf: 0,
  npSpouse: 0,
  otherDedSelf: 0,
  otherDedSpouse: 0,

  // STEP 3
  creditSpend: 1500,
  debitSpend: 1500,
  cardShare: 50,

  // STEP 5
  psSelf: 600,
  irpSelf: 300,
  psSpouse: 0,
  irpSpouse: 0,
  medical: 0,
  medicalOwner: 'self',
  education: 0,
  eduOwner: 'self',
  creditOtherSelf: 0,
  creditOtherSpouse: 0,

  // STEP 6
  isaTransfer: 0,
  isaOwner: 'self',
  isaEligible: false,
};

export default function App() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [inputs, setInputs] = useState<TaxInputs>(INITIAL_INPUTS);

  // Expose global snapshot and audit functions for backward compatibility with automated test harnesses
  useEffect(() => {
    (window as unknown as { TAXIS_getSnapshot: () => unknown }).TAXIS_getSnapshot = () => {
      return build(inputs).map((x) => ({
        who: x.who,
        enabled: x.enabled,
        g: x.g,
        base: x.base,
        assessed: x.assessed,
        employment: x.employment,
        allCredits: x.allCredits,
        final: x.final,
        withheld: x.withheld,
      }));
    };

    (window as unknown as { taxPilotAudit: () => unknown }).taxPilotAudit = () => {
      return runAuditTests(inputs);
    };
  }, [inputs]);

  const handleChange = <K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBatchChange = (updates: Partial<TaxInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleReset = () => {
    setInputs(INITIAL_INPUTS);
    setCurrentStep(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentStep === 8) {
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => Math.min(8, prev + 1));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const people = build(inputs);

  return (
    <div className="min-h-screen bg-[#091525] text-[#eaf2ff] font-sans antialiased selection:bg-[#65afff] selection:text-[#091525]">
      {/* Header */}
      <Header selectedYear={selectedYear} onSelectYear={setSelectedYear} />

      {/* Main Wrap */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Year & Trust Footnote Banner */}
        <div className="bg-[#0f2941] border border-[#315775] rounded-xl p-3.5 text-xs text-[#b8d2e7] leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#ffd078] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#e8f7ff]">
              TAXIS 2026 v1.4 Pro · 2026년 귀속 공식 세법 계산 엔진 탑재
            </strong>
            <span className="mx-1.5 opacity-60">|</span>
            다음 귀속연도(2027, 2028년)는 국회 세법 통과 및 시행령 공포 후 독립 검증 버전으로 제공됩니다. 연도가 바뀌어도 현재 계산식을 임의로 재사용하지 않습니다. 본 서비스는 대한민국 근로소득자 대상 교육·계획용 간이 추정 시뮬레이터입니다.
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <StepNavigation currentStep={currentStep} onSelectStep={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />

        {/* Tax Flowchart (Visual Stage Pipeline) */}
        <TaxFlowchart self={people[0]} spouse={people[1]} />

        {/* Reliability Advisory Card */}
        <div className="bg-[#241e17] border border-[#b18c44] rounded-2xl p-4 text-xs text-[#ffe1ad] leading-relaxed">
          <h4 className="text-sm font-bold text-[#ffcf7a] m-0 mb-1">
            계산 신뢰도 및 절세 계획 안내 · TAXIS 2026
          </h4>
          <p className="m-0 mb-1">
            현재 버전은 <strong>절세 계획을 위한 정밀 간이 추정</strong>입니다. 근로소득세액공제·누진세율·일반 연금한도 등 핵심 산식은 검증되었으나, 카드 특수사용분(전통시장 등)·의료비 특례·공제 종합한도·표준세액공제 선택 등은 사용자 확인이 필요합니다.
          </p>
          <p className="m-0 text-[11px] text-[#ffdd99] opacity-80">
            ① 실제 지출액 입력 → ② 시나리오 비교 → ③ 국세청 간소화 자료와 원천징수영수증으로 최종 확인. '최대 공제 입력'은 실제 지출이 아닌 가상 가정값이며 추가 지출을 권장하지 않습니다. 개인정보는 서버로 전송되지 않는 브라우저 로컬 실행 모델입니다.
          </p>
        </div>

        {/* Step Content Panels */}
        <section className="transition-opacity duration-200">
          {currentStep === 0 && (
            <Step1Salary inputs={inputs} onChange={handleChange} />
          )}

          {currentStep === 1 && (
            <Step2Family inputs={inputs} people={people} onChange={handleChange} />
          )}

          {currentStep === 2 && (
            <Step3Card inputs={inputs} people={people} onChange={handleChange} />
          )}

          {currentStep === 3 && (
            <Step4TaxBase people={people} />
          )}

          {currentStep === 4 && (
            <Step5TaxCredits
              inputs={inputs}
              people={people}
              onChange={handleChange}
              onBatchChange={handleBatchChange}
            />
          )}

          {currentStep === 5 && (
            <Step6ISA
              inputs={inputs}
              onChange={handleChange}
              onBatchChange={handleBatchChange}
            />
          )}

          {currentStep === 6 && (
            <Step7Settlement
              inputs={inputs}
              people={people}
              onChange={handleChange}
            />
          )}

          {currentStep === 7 && (
            <Step8Strategy
              inputs={inputs}
              people={people}
              onReset={handleReset}
            />
          )}

          {currentStep === 8 && (
            <Step9StockAppendix />
          )}
        </section>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#1e3b58]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors ${
              currentStep === 0
                ? 'bg-[#13263c] text-[#557391] border border-[#233d59] cursor-not-allowed opacity-50'
                : 'bg-[#182c44] hover:bg-[#233f61] text-[#dceaff] border border-[#35526c]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            이전 단계
          </button>

          <span className="text-xs text-[#8fcaff] font-mono font-semibold">
            STEP {currentStep + 1} / 9
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black bg-[#6db7ff] hover:bg-[#85c4ff] text-[#081725] shadow-lg flex items-center gap-1.5 transition-colors"
          >
            {currentStep === 8 ? (
              <>
                <RotateCcw className="w-4 h-4" />
                처음으로 ↺
              </>
            ) : (
              <>
                다음 단계
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Automated Audit Section (25 tests) */}
        <AuditSection currentInputs={inputs} />

        {/* Footer */}
        <footer className="pt-6 pb-12 border-t border-[#1e3b58] text-xs text-[#88a5bf] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong>TAXIS (Tax Analysis &amp; Intelligence Simulator)</strong> · 2026년 귀속 근로소득 연말정산 (2027년 초 정산)
            </div>
            <div className="text-[11px] text-[#60ddbb] font-medium">
              Static Web · GitHub Pages 배포 지원
            </div>
          </div>

          <p className="text-[11px] leading-relaxed m-0 text-[#738ea8]">
            본 시뮬레이터는 국세청 공식 세액 신고 시스템이 아니며, 근로소득자의 절세 계획 및 맞벌이 부부 가구의 최적 세무 의사결정을 돕기 위한 교육용 도구입니다. 일부 2026년 귀속 세법 특례 및 시행령 세부 요건은 국세청 확정 신고 전 홈택스 간소화 자료와 회사 원천징수영수증으로 반드시 최종 확인하시기 바랍니다.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#8fcaff]">
            <a
              href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&mi=2312"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              국세청 연말정산 종합 계산 흐름 <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6437"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              소득세 기본세율표 <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://g.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              특별세액공제 및 연금계좌 공제 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
