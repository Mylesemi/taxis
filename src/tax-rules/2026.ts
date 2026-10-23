/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TAXIS 2026 Tax Rules Constants & Legal Citations
 * 귀속연도: 2026년 귀속 (2027년 1~2월 연말정산)
 */

export const TAX_RULES_2026 = {
  year: 2026,
  status: 'VERIFIED' as const,
  title: '2026년 귀속 연말정산 기준 (2027년 초 정산)',
  effectiveDate: '2026-01-01',
  citations: [
    {
      title: '소득세법 제47조 (근로소득공제)',
      url: 'https://www.law.go.kr/법령/소득세법',
      summary: '총급여 구간별 공제율 및 최대 2,000만원 상한 규정',
    },
    {
      title: '소득세법 제55조 (세율)',
      url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7873&mi=6437',
      summary: '과세표준 1,400만원 이하 6%부터 10억원 초과 45%까지 8단계 초과누진세율',
    },
    {
      title: '소득세법 제59조 (근로소득세액공제)',
      url: 'https://g.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596',
      summary: '산출세액 130만원 이하 55%, 초과분 30% 차등 공제 및 총급여별 한도 차감',
    },
    {
      title: '조세특례제한법 제126조의2 (신용카드 등 사용금액에 대한 소득공제)',
      url: 'https://www.law.go.kr/법령/조세특례제한법',
      summary: '총급여 25% 초과분에 대해 신용카드 15%, 체크카드·현금 30% 공제. 7천만원 기준 차등 기본한도 및 자녀 가산',
    },
    {
      title: '소득세법 제59조의3 (연금계좌세액공제) & 조특법 제91조의18 (ISA)',
      url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596',
      summary: '연금저축 600만원 + IRP 합산 900만원 한도. 총급여 5,500만원 기준 15%/12%. ISA 만기금 연금계좌 이전액의 10%(최대 300만원) 한도 추가',
    },
    {
      title: '소득세법 제59조의2 (자녀세액공제)',
      url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&mi=6596',
      summary: '2026년 귀속 9세 이상 적격 자녀 대상: 1인 25만원, 2인 55만원, 3인 이상 55만+(인원-2)×40만원',
    },
    {
      title: '소득세법 제97조의2 (배우자 등 증여재산에 대한 이월과세) & 상속세 및 증여세법 제53조',
      url: 'https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7728&mi=2356',
      summary: '2025.1.1. 이후 증여 주식 1년 이내 양도 시 증여자 최초 취득가액 적용. 10년간 배우자 증여재산공제 6억원',
    },
  ],

  // 인적공제
  personalExemption: 150, // 1인당 150만원

  // 근로소득공제 상한
  earnedIncomeDeductionMax: 2000,

  // 근로소득공제 구간 (만원)
  earnedIncomeBrackets: [
    { limit: 500, rate: 0.7, base: 0 },
    { limit: 1500, rate: 0.4, base: 350 },
    { limit: 4500, rate: 0.15, base: 750 },
    { limit: 10000, rate: 0.05, base: 1200 },
    { limit: Infinity, rate: 0.02, base: 1475 },
  ],

  // 8단계 기본 누진세율 구간 (과세표준 만원)
  taxBrackets: [
    { limit: 1400, rate: 0.06, baseTax: 0, sub: 0 },
    { limit: 5000, rate: 0.15, baseTax: 84, sub: 1400 },
    { limit: 8800, rate: 0.24, baseTax: 624, sub: 5000 },
    { limit: 15000, rate: 0.35, baseTax: 1536, sub: 8800 },
    { limit: 30000, rate: 0.38, baseTax: 3706, sub: 15000 },
    { limit: 50000, rate: 0.40, baseTax: 9406, sub: 30000 },
    { limit: 100000, rate: 0.42, baseTax: 17406, sub: 50000 },
    { limit: Infinity, rate: 0.45, baseTax: 38406, sub: 100000 },
  ],

  // 근로소득세액공제 한도
  workCredit: {
    splitTax: 130, // 130만원 이하 55%
    lowRate: 0.55,
    highRate: 0.30,
    salaryThreshold1: 3300,
    capLow: 74,
    salaryThreshold2: 7000,
    capMidMin: 66,
    capMidSlope: 0.008,
    salaryThreshold3: 12000,
    capHighMin: 50,
    capHighSlope: 0.5,
    capVeryHighMin: 20,
    capVeryHighSlope: 0.5,
  },

  // 연금계좌세액공제
  pension: {
    salaryThreshold: 5500,
    lowSalaryRate: 0.15,
    highSalaryRate: 0.12,
    pensionSavingsCap: 600,
    totalAccountCap: 900,
    isaTransferBonusRate: 0.1, // 10%
    isaTransferBonusCap: 300, // 최대 300만원 한도 추가
  },

  // 카드 소득공제
  card: {
    gateRate: 0.25, // 총급여의 25% 초과 지출
    creditRate: 0.15, // 신용카드 15%
    debitRate: 0.30, // 체크카드·현금영수증 30%
    salaryThreshold: 7000,
    lowSalaryBaseCap: 300,
    highSalaryBaseCap: 250,
    childBonusLowSalary: 50, // 자녀 1인당 50만원 (최대 2명)
    childBonusHighSalary: 25, // 자녀 1인당 25만원 (최대 2명)
  },

  // 자녀세액공제 (2026년 귀속 9세 이상)
  childCredit: {
    minAge: 9,
    oneChild: 25,
    twoChildren: 55,
    extraChildPerUnit: 40,
  },

  // 의료비세액공제 (일반)
  medical: {
    gateRate: 0.03, // 총급여의 3% 초과액
    rate: 0.15,
    generalCap: 700, // 일반 의료비 700만원 한도
  },

  // 교육비세액공제 (취학 전)
  education: {
    preschoolChildCap: 300,
    rate: 0.15,
  },

  // 지방소득세 배수 (국세 1.0 + 지방세 0.1 = 1.1)
  localTaxFactor: 1.1,

  // 해외주식 증여 및 양도세
  foreignStock: {
    taxRate: 0.22, // 양도소득세 20% + 지방소득세 2%
    basicDeduction: 250, // 연간 250만원 기본공제
    spouseGiftDeduction10Years: 60000, // 10년간 배우자 증여공제 6억원
    carryoverMonths: 12, // 1년 이내 양도 시 이월과세 적용 (2025.1.1. 이후 증여분)
  },
};
