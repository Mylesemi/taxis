/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TaxInputs {
  // STEP 1: Salary & Withholding
  salary: number; // 본인 기본급 (만원)
  bonus: number; // 본인 성과급 (만원)
  nonTaxPay: number; // 비과세 급여 (만원)
  withheld: number; // 본인 기납부세액 (소득세+지방세, 만원)

  spouseSalary: number; // 배우자 총급여 (만원)
  spouseWithheld: number; // 배우자 기납부세액 (만원)
  spouseEnabled: 'yes' | 'no'; // 배우자 합산 여부

  // STEP 2: Family & Pension
  children: number; // 공제 요건 충족 자녀 수
  childOwner: 'self' | 'spouse'; // 자녀 기본공제 귀속
  childrenAgeEligible: number; // 2026년 귀속 자녀세액공제 적격 자녀 수 (9세 이상)
  parentsSelf: number; // 본인 적격 부모님 등 기타 부양가족 수
  parentsSpouse: number; // 배우자 적격 부모님 등 기타 부양가족 수
  npSelf: number; // 본인 국민연금 등 근로자 부담액 (만원)
  npSpouse: number; // 배우자 국민연금 등 근로자 부담액 (만원)
  otherDedSelf: number; // 본인 기타 적격 소득공제 (만원)
  otherDedSpouse: number; // 배우자 기타 적격 소득공제 (만원)

  // STEP 3: Card Spend
  creditSpend: number; // 일반 신용카드 지출 총액 (만원)
  debitSpend: number; // 체크카드·현금영수증 지출 총액 (만원)
  cardShare: number; // 본인 명의 지출 비율 (0 ~ 100 %)

  // STEP 5: Tax Credits
  psSelf: number; // 본인 연금저축 납입액 (만원)
  irpSelf: number; // 본인 IRP·DC 개인 추가납입액 (만원)
  psSpouse: number; // 배우자 연금저축 납입액 (만원)
  irpSpouse: number; // 배우자 IRP·DC 개인 추가납입액 (만원)
  medical: number; // 일반 의료비 적격 지출 (만원)
  medicalOwner: 'self' | 'spouse'; // 실제 의료비 부담자
  education: number; // 적격 취학 전 아동 교육비 (만원)
  eduOwner: 'self' | 'spouse'; // 교육비 공제 귀속
  creditOtherSelf: number; // 본인 확인된 기타 세액공제 (만원)
  creditOtherSpouse: number; // 배우자 확인된 기타 세액공제 (만원)

  // STEP 6: ISA Transfer
  isaTransfer: number; // 2026년 적격 이전액 (만원)
  isaOwner: 'self' | 'spouse'; // 이전한 사람
  isaEligible: boolean; // 법정 요건 확인 완료 여부
}

export interface PersonTaxResult {
  who: '본인' | '배우자';
  enabled: boolean;
  g: number; // 총급여 (비과세 차감 후)
  withheld: number;
  dependents: number;
  personDed: number;
  np: number;
  other: number;
  card: number;
  ded: number; // 근로소득공제
  base: number; // 과세표준
  assessed: number; // 산출세액 (소득세)
  employment: number; // 근로소득세액공제
  pension: number; // 연금계좌 세액공제
  pensionEligible: number; // 연금계좌 공제대상액
  medCredit: number; // 의료비 세액공제
  eduCredit: number; // 교육비 세액공제
  childCredit: number; // 자녀세액공제
  otherCredit: number; // 기타 세액공제
  allCredits: number; // 세액공제 합계
  final: number; // 지방소득세 포함 최종 결정세액 (assessed - allCredits) * 1.1
}

export interface OptimizationSample {
  share: number;
  tax: number;
}

export interface OptimizationResult {
  share: number;
  tax: number;
  ranges: [number, number][];
  all: number[];
  samples: OptimizationSample[];
  step: number;
}

export interface StockGiftInputs {
  stockCost: number; // 증여자 최초 취득가액 (만원)
  stockGift: number; // 증여 당시 세법상 평가가액 (만원)
  stockSale: number; // 배우자의 예상 매도가액 (만원)
  stockHold: 'short' | 'long'; // 1년 이내 (이월과세) / 1년 초과 (증여가 기준)
  stockPrior: number; // 최근 10년 배우자 증여 누계 (만원)
  stockSelfGains: number; // 증여자 당해 연도 다른 주식 순양도차익 (만원)
  stockSpouseGains: number; // 배우자 당해 연도 다른 주식 순양도차익 (만원)
  stockFees: number; // 증여·매도 관련 비용 (만원)
}

export interface StockGiftResult {
  direct: number; // 직접 매도 시 양도세
  gifted: number; // 증여 후 매도 시 양도세
  delta: number; // 절세액 (direct - gifted)
  allowance: number; // 배우자 증여공제 잔여액 (6억 - prior)
  over: number; // 증여세 공제초과분
  messages: string[];
}

export interface OfficialCompareInputs {
  officialSelfTax: string;
  officialSpouseTax: string;
  officialSelfBase: string;
  officialSpouseBase: string;
}

export interface OfficialCompareRecord {
  who: '본인' | '배우자';
  enabled: boolean;
  estimatedTax: number;
  officialTax: number | null;
  taxGap: number | null;
  estimatedBase: number;
  officialBase: number | null;
  baseGap: number | null;
}

export interface AuditTestItem {
  name: string;
  pass: boolean;
  status: 'PASS' | 'FAIL' | 'NOT VERIFIED';
  description?: string;
}
