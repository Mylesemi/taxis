/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StepNavigationProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
}

export const STEP_LABELS = [
  '급여 및 기납부',
  '인적·공적연금',
  '카드 소득공제',
  '과세표준·산출세액',
  '세액공제(연금·의료·교육)',
  'ISA·기타공제',
  '결정세액·환급정산',
  '절세 전략·결과',
  'Appendix · 해외주식 증여',
];

export const StepNavigation: React.FC<StepNavigationProps> = ({ currentStep, onSelectStep }) => {
  return (
    <div className="overflow-x-auto pb-3 mb-4 scrollbar-thin">
      <div className="flex gap-2 min-w-max">
        {STEP_LABELS.map((label, idx) => {
          const isActive = currentStep === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectStep(idx)}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                isActive
                  ? 'bg-[#65afff] text-[#091525] border-[#65afff] shadow-md font-bold'
                  : 'bg-[#182c44] text-[#dceaff] border-[#35526c] hover:bg-[#203a5a] hover:border-[#486b8c]'
              }`}
            >
              <span className="opacity-75 mr-1 font-mono">{idx + 1}.</span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
