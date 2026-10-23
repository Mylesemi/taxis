/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Multi-Year Tax Rules Registry
 */

import { TAX_RULES_2026 } from './2026';

export interface TaxYearConfig {
  year: number;
  label: string;
  isVerified: boolean;
  statusBadge: string;
  notes: string;
  rules?: typeof TAX_RULES_2026;
}

export const SUPPORTED_TAX_YEARS: TaxYearConfig[] = [
  {
    year: 2026,
    label: '2026년 귀속 (2027년 초 정산)',
    isVerified: true,
    statusBadge: '검증 완료 · 정식 지원',
    notes: '2026년 귀속 개정세법(자녀세액공제 연령 9세 이상 반영, 신용카드 기본한도 자녀 가산, 연금 900만원 등) 공식 반영',
    rules: TAX_RULES_2026,
  },
  {
    year: 2027,
    label: '2027년 귀속 (추후 지원)',
    isVerified: false,
    statusBadge: '미검증 · 세법 공포 후 지원',
    notes: '2027년 세법 개정안 국회 통과 및 시행령 확정 후 별도 검증 엔진으로 추가 예정 (현재 규칙 임의 적용 불가)',
  },
  {
    year: 2028,
    label: '2028년 귀속 (추후 지원)',
    isVerified: false,
    statusBadge: '미검증 · 추후 지원',
    notes: '2028년 귀속 세법 개정 시점 이후 신규 규칙 파일(tax-rules/2028.ts)로 확장 가능',
  },
];

export function getTaxRules(year: number = 2026) {
  if (year === 2026) {
    return TAX_RULES_2026;
  }
  throw new Error(`미검증 연도(${year}년)입니다. TAXIS 원칙에 따라 검증되지 않은 연도는 현재 규칙으로 임의 계산하지 않습니다.`);
}
