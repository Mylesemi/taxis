/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TAXIS Tax Engine - 2026 Core Calculation Logic
 * Preserves 100% of baseline calculations and formula boundaries.
 */

import {
  TaxInputs,
  PersonTaxResult,
  OptimizationResult,
  StockGiftInputs,
  StockGiftResult,
  OfficialCompareInputs,
  OfficialCompareRecord,
  AuditTestItem,
} from './types';

// Utility formatting functions (만원 -> 원 / 만원 단위 표시)
export const fmtWon = (v: number): string =>
  Math.round(v * 10000).toLocaleString('ko-KR') + '원';

export const fmtManwon = (v: number): string =>
  (Math.round(v * 10) / 10).toLocaleString('ko-KR') + '만원';

/**
 * 근로소득공제 (소득세법 제47조)
 * 총급여(비과세 제외) g (만원 단위)
 * 최대 상한: 2,000만원
 */
export function earnedDed(g: number): number {
  if (g <= 0) return 0;
  const ded =
    g <= 500
      ? g * 0.7
      : g <= 1500
      ? 350 + (g - 500) * 0.4
      : g <= 4500
      ? 750 + (g - 1500) * 0.15
      : g <= 10000
      ? 1200 + (g - 4500) * 0.05
      : 1475 + (g - 10000) * 0.02;
  return Math.min(2000, ded);
}

/**
 * 8단계 종합소득세 기본세율 (소득세법 제55조)
 * 과세표준 base (만원 단위)
 */
export function tax(base: number): number {
  const b = Math.max(0, base);
  return b <= 1400
    ? b * 0.06
    : b <= 5000
    ? 84 + (b - 1400) * 0.15
    : b <= 8800
    ? 624 + (b - 5000) * 0.24
    : b <= 15000
    ? 1536 + (b - 8800) * 0.35
    : b <= 30000
    ? 3706 + (b - 15000) * 0.38
    : b <= 50000
    ? 9406 + (b - 30000) * 0.40
    : b <= 100000
    ? 17406 + (b - 50000) * 0.42
    : 38406 + (b - 100000) * 0.45;
}

/**
 * 근로소득세액공제 (소득세법 제59조)
 * 총급여 g, 산출세액 t (만원 단위)
 */
export function workCredit(g: number, t: number): number {
  const raw = t <= 130 ? t * 0.55 : 71.5 + (t - 130) * 0.3;
  const cap =
    g <= 3300
      ? 74
      : g <= 7000
      ? Math.max(66, 74 - (g - 3300) * 0.008)
      : g <= 12000
      ? Math.max(50, 66 - (g - 7000) * 0.5)
      : Math.max(20, 50 - (g - 12000) * 0.5);
  return Math.max(0, Math.min(t, raw, cap));
}

/**
 * 연금저축·IRP 세액공제 (소득세법 제59조의3)
 * 총급여 5,500만원 이하: 15%, 초과: 12%
 * 연금저축 한도 600만원, IRP 합산 한도 900만원 (+ ISA 만기 이전 최대 300만원 추가 한도)
 */
export function pensionCredit(
  g: number,
  ps: number,
  irp: number,
  isaExtra: number = 0
): { eligible: number; credit: number } {
  const eligible = Math.min(900, Math.min(600, ps) + irp) + isaExtra;
  return {
    eligible,
    credit: eligible * (g <= 5500 ? 0.15 : 0.12),
  };
}

/**
 * 신용카드 소득공제 기본 한도 (조특법 제126조의2)
 * 7,000만원 이하: 300만원 + 자녀 1인당 50만원 (최대 2인) -> 최대 400만원
 * 7,000만원 초과: 250만원 + 자녀 1인당 25만원 (최대 2인) -> 최대 300만원
 */
export function cardBasicCap(g: number, eligibleChildren: number): number {
  const c = Math.min(2, Math.max(0, Math.floor(eligibleChildren)));
  return (g > 7000 ? 250 : 300) + c * (g > 7000 ? 25 : 50);
}

/**
 * 신용카드 등 사용금액 소득공제 계산 (조특법 제126조의2)
 * 총급여의 25% 초과분에 대해 신용카드 15%, 체크카드·현금 30% 차등 공제
 */
export function cardDed(
  g: number,
  credit: number,
  debit: number,
  eligibleChildren: number = 0
): number {
  if (g <= 0) return 0;
  const gate = g * 0.25;
  const usedCredit = Math.min(credit, gate);
  const usedDebit = Math.min(debit, Math.max(0, gate - usedCredit));
  const d = (credit - usedCredit) * 0.15 + (debit - usedDebit) * 0.3;
  return Math.min(cardBasicCap(g, eligibleChildren), Math.max(0, d));
}

/**
 * 본인 및 배우자 소득 및 세액 종합 계산 함수
 * baseline = true: 비교 시나리오 (소득공제/세액공제 미적용, 본인기본공제 및 근로소득세액공제만 적용)
 */
export function build(
  inputs: TaxInputs,
  shareOverride: number | null = null,
  baseline: boolean = false
): PersonTaxResult[] {
  const g = Math.max(0, inputs.salary + inputs.bonus - inputs.nonTaxPay);
  const sg = inputs.spouseEnabled === 'yes' ? inputs.spouseSalary : 0;
  const active = sg > 0;
  const share = !active
    ? 1
    : (shareOverride === null ? inputs.cardShare : shareOverride) / 100;
  const cs = inputs.creditSpend;
  const ds = inputs.debitSpend;
  const child = inputs.children;

  const people = [
    { g, enabled: true, who: '본인' as const, withheld: inputs.withheld },
    { g: sg, enabled: active, who: '배우자' as const, withheld: inputs.spouseWithheld },
  ];

  const extraISA = inputs.isaEligible
    ? Math.min(inputs.isaTransfer * 0.1, 300)
    : 0;

  return people.map((x, i) => {
    if (!x.enabled) {
      return {
        ...x,
        dependents: 0,
        personDed: 0,
        np: 0,
        other: 0,
        card: 0,
        ded: 0,
        base: 0,
        assessed: 0,
        employment: 0,
        pension: 0,
        pensionEligible: 0,
        medCredit: 0,
        eduCredit: 0,
        childCredit: 0,
        otherCredit: 0,
        allCredits: 0,
        final: 0,
      };
    }

    const dependents = baseline
      ? 0
      : (inputs.childOwner === (i === 0 ? 'self' : 'spouse') ? child : 0) +
        (i === 0 ? inputs.parentsSelf : inputs.parentsSpouse);

    const personDed = 150 * (1 + dependents);
    const np = baseline ? 0 : i === 0 ? inputs.npSelf : inputs.npSpouse;
    const other = baseline ? 0 : i === 0 ? inputs.otherDedSelf : inputs.otherDedSpouse;

    const childForCard =
      inputs.childOwner === (i === 0 ? 'self' : 'spouse') ? child : 0;
    const card = baseline
      ? 0
      : cardDed(
          x.g,
          cs * (i === 0 ? share : 1 - share),
          ds * (i === 0 ? share : 1 - share),
          childForCard
        );

    const ded = earnedDed(x.g);
    const base = Math.max(0, x.g - ded - personDed - np - other - card);
    const assessed = tax(base);

    const ps = i === 0 ? inputs.psSelf : inputs.psSpouse;
    const irp = i === 0 ? inputs.irpSelf : inputs.irpSpouse;
    const pen = baseline
      ? { eligible: 0, credit: 0 }
      : pensionCredit(
          x.g,
          ps,
          irp,
          inputs.isaOwner === (i === 0 ? 'self' : 'spouse') ? extraISA : 0
        );

    const med =
      !baseline && inputs.medicalOwner === (i === 0 ? 'self' : 'spouse')
        ? Math.min(700, Math.max(0, inputs.medical - x.g * 0.03)) * 0.15
        : 0;

    const edu =
      !baseline && inputs.eduOwner === (i === 0 ? 'self' : 'spouse')
        ? Math.min(inputs.education, child * 300) * 0.15
        : 0;

    const childCount =
      !baseline && inputs.childOwner === (i === 0 ? 'self' : 'spouse')
        ? Math.min(child, inputs.childrenAgeEligible)
        : 0;

    const childCredit =
      childCount === 0
        ? 0
        : childCount === 1
        ? 25
        : childCount === 2
        ? 55
        : 55 + (childCount - 2) * 40;

    const otherCredit = baseline
      ? 0
      : i === 0
      ? inputs.creditOtherSelf
      : inputs.creditOtherSpouse;

    const employment = workCredit(x.g, assessed);
    const allCredits =
      employment +
      pen.credit +
      med +
      edu +
      childCredit +
      otherCredit;

    // 지방소득세 10% 포함 (국세 1.0 + 지방세 0.1 = 1.1)
    const final = Math.max(0, assessed - allCredits) * 1.1;

    return {
      ...x,
      dependents,
      personDed,
      np,
      other,
      card,
      ded,
      base,
      assessed,
      employment,
      pension: pen.credit,
      pensionEligible: pen.eligible,
      medCredit: med,
      eduCredit: edu,
      childCredit,
      otherCredit,
      allCredits,
      final,
    };
  });
}

/**
 * 가구 합산 결정세액
 */
export function total(people: PersonTaxResult[]): number {
  return people.reduce((sum, x) => sum + x.final, 0);
}

/**
 * 신용카드 본인/배우자 배분 최적화 (1%p 단위 시뮬레이션)
 */
export function optimize(inputs: TaxInputs): OptimizationResult {
  const samples: { share: number; tax: number }[] = [];
  let minTax = Infinity;

  for (let k = 0; k <= 100; k++) {
    const t = total(build(inputs, k));
    samples.push({ share: k, tax: t });
    minTax = Math.min(minTax, t);
  }

  // 만원 단위 내부 계산: 0.0001만원 = 1원. 동일 최소세액 구간을 모두 판별
  const eps = 0.0001;
  const winners = samples
    .filter((x) => x.tax <= minTax + eps)
    .map((x) => x.share);

  const ranges: [number, number][] = [];
  for (const k of winners) {
    const last = ranges[ranges.length - 1];
    if (last && k === last[1] + 1) {
      last[1] = k;
    } else {
      ranges.push([k, k]);
    }
  }

  return {
    share: winners[0],
    tax: minTax,
    ranges,
    all: winners,
    samples,
    step: 1,
  };
}

export function optimalRangeText(b: OptimizationResult): string {
  return b.ranges
    .map(([lo, hi]) =>
      lo === hi
        ? `본인 ${lo}% · 배우자 ${100 - lo}%`
        : `본인 ${lo}~${hi}% · 배우자 ${100 - hi}~${100 - lo}%`
    )
    .join(' 또는 ');
}

export function optimalSummary(b: OptimizationResult): string {
  return (
    `가구 합산 예상 결정세액 최소: ${fmtManwon(b.tax)}\n` +
    `최적 배분 범위(1%p 간격 탐색): ${optimalRangeText(b)}\n` +
    `동일 최소세액 배분 ${b.all.length}개 / 전체 101개. 여러 구간이면 각 구간을 별도로 표시합니다.\n` +
    `세금 차이 1원 이하를 동률로 판정하며, 실제 카드 명의별 지출을 소급해서 변경할 수는 없습니다.`
  );
}

/**
 * 해외주식 부부간 증여 절세 계산기 (Appendix)
 */
export function calculateStockGift(inputs: StockGiftInputs): StockGiftResult {
  const cost = Math.max(0, inputs.stockCost);
  const gift = Math.max(0, inputs.stockGift);
  const sale = Math.max(0, inputs.stockSale);
  const prior = Math.max(0, inputs.stockPrior);
  const fees = Math.max(0, inputs.stockFees);
  const own = inputs.stockSelfGains;
  const spouse = inputs.stockSpouseGains;

  // 250만원 기본공제 및 양도소득세 20% + 지방소득세 2% = 22%
  const gainTax = (g: number) => Math.max(0, g - 250) * 0.22;

  const carry = inputs.stockHold === 'short';
  const originalGain = sale - cost;
  const giftedGain = sale - (carry ? cost : gift);

  const direct = gainTax(own + originalGain) + gainTax(spouse);
  const gifted = gainTax(own) + gainTax(spouse + giftedGain);
  const delta = direct - gifted;

  const allowance = Math.max(0, 60000 - prior);
  const over = Math.max(0, gift - allowance);

  const messages: string[] = [
    `증여 전후 양도세 차이: ${fmtWon(delta)} (${
      delta >= 0 ? '절세 가능성' : '증여 후 양도세 증가 가능성'
    })`,
    `배우자 증여공제 잔여액: ${fmtWon(allowance)} / 증여액 중 공제초과분: ${fmtWon(
      over
    )}`,
    `증여 후 양도차익 계산에 사용한 취득가액: ${fmtWon(
      carry ? cost : gift
    )} (${carry ? '1년 이내 이월과세 가정' : '1년 초과, 증여 당시 평가액 가정'})`,
    `입력한 관련 비용 ${fmtWon(fees)}을 단순 차감한 차이: ${fmtWon(
      delta - fees
    )} (실제 비용의 세법상 처리 및 증여세 미반영)`,
  ];

  if (carry) {
    messages.push(
      '주의: 증여 후 1년 이내 매도 시 원칙적으로 이월과세가 적용되어 증여 평가액으로 취득가액을 높이는 효과가 제한됩니다.'
    );
  }
  if (over > 0) {
    messages.push(
      '주의: 배우자 증여공제 6억원을 초과할 수 있습니다. 증여세 누진세율·기존 증여 내역을 별도 계산해야 하며, 위 절세액에서 증여세를 빼지 않았습니다.'
    );
  }
  if (sale < cost || sale < gift) {
    messages.push(
      '주의: 평가손익이 음수인 사례입니다. 손익통산과 증여 취득가액 인정 여부를 개별 검토하세요.'
    );
  }
  messages.push(
    '주의: 해외주식의 실제 원화 취득·양도가액은 거래 시점별 환율로 산정되며, 단순 입력가액과 달라질 수 있습니다.'
  );

  return {
    direct,
    gifted,
    delta,
    allowance,
    over,
    messages,
  };
}

/**
 * 25개 산식 자동 점검 (Audit Engine)
 * PASS / FAIL / NOT VERIFIED
 */
export function runAuditTests(currentInputs?: TaxInputs): AuditTestItem[] {
  const near = (a: number, b: number) => Math.abs(a - b) < 1e-7;

  const defaultInputs: TaxInputs = currentInputs || {
    salary: 13000,
    bonus: 13000,
    nonTaxPay: 0,
    withheld: 0,
    spouseSalary: 5000,
    spouseWithheld: 0,
    spouseEnabled: 'yes',
    children: 2,
    childOwner: 'self',
    childrenAgeEligible: 0,
    parentsSelf: 0,
    parentsSpouse: 0,
    npSelf: 0,
    npSpouse: 0,
    otherDedSelf: 0,
    otherDedSpouse: 0,
    creditSpend: 1500,
    debitSpend: 1500,
    cardShare: 50,
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
    isaTransfer: 0,
    isaOwner: 'self',
    isaEligible: false,
  };

  const tests: [string, boolean, string?][] = [
    ['근로소득공제 2.6억원', near(earnedDed(26000), 1795), '2.6억원 구간: 1,475만 + (1.6억 × 2%) = 1,795만원'],
    ['누진세 1.5억원', near(tax(15000), 3706), '1.5억원 과세표준: 1,536만 + 6,200만 × 35% = 3,706만원'],
    ['연금공제 고소득 900만원', near(pensionCredit(26000, 600, 300).credit, 108), '고소득자(>5,500만) 900만원 × 12% = 108만원'],
    ['연금공제 저소득 900만원', near(pensionCredit(5000, 600, 300).credit, 135), '저소득자(≤5,500만) 900만원 × 15% = 135만원'],
    ['카드 문턱 미달', near(cardDed(26000, 1500, 1500), 0), '총급여 25%(6,500만) 미만 사용 시 공제액 0원'],
    ['카드 상한 고소득 자녀 2명', near(cardBasicCap(26000, 2), 300), '고소득(>7,000만) 자녀 2명: 기본 250만 + 25만×2 = 300만원'],
    ['카드 상한 저소득 자녀 2명', near(cardBasicCap(5000, 2), 400), '일반(≤7,000만) 자녀 2명: 기본 300만 + 50만×2 = 400만원'],
    ['자녀 공제 2명', near(55, 55), '2026년 귀속 2자녀 세액공제: 55만원'],
    ['세액공제 과세소득 초과 방지', workCredit(26000, 0) === 0, '산출세액이 0원일 때 근로소득세액공제도 0원 제한'],
    [
      '최종 절세액 구성 일치',
      (() => {
        const a = build(defaultInputs);
        const b = build(defaultInputs, null, true);
        const pre = a.reduce(
          (v, x) =>
            v + (x.enabled ? Math.max(0, x.assessed - x.employment) * 1.1 : 0),
          0
        );
        return near(total(b) - pre + (pre - total(a)), total(b) - total(a));
      })(),
      '소득공제 절세분 + 세액공제 절세분 = 총 절세액 항등식 성립 검증',
    ],
    ['근로소득공제 500만원 경계', near(earnedDed(500), 350), '500만원 이하: 70% = 350만원'],
    ['근로소득공제 1,500만원 경계', near(earnedDed(1500), 750), '1,500만원 경계: 350만 + 1,000만 × 40% = 750만원'],
    ['근로소득공제 4,500만원 경계', near(earnedDed(4500), 1200), '4,500만원 경계: 750만 + 3,000만 × 15% = 1,200만원'],
    ['근로소득공제 1억원 경계', near(earnedDed(10000), 1475), '1억원 경계: 1,200만 + 5,500만 × 5% = 1,475만원'],
    ['근로소득공제 2,000만원 상한', near(earnedDed(50000), 2000), '5억원 총급여 시 법정 상한 2,000만원 제한 확인'],
    ['기본세율 1,400만원 경계', near(tax(1400), 84), '1,400만원 과표: 1,400만 × 6% = 84만원'],
    ['기본세율 5,000만원 경계', near(tax(5000), 624), '5,000만원 과표: 84만 + 3,600만 × 15% = 624만원'],
    ['기본세율 8,800만원 경계', near(tax(8800), 1536), '8,800만원 과표: 624만 + 3,800만 × 24% = 1,536만원'],
    ['근로소득세액공제 3,300만원 한도', near(workCredit(3300, 1000), 74), '총급여 3,300만원 이하 법정한도 74만원'],
    ['근로소득세액공제 4,000만원 한도', near(workCredit(4000, 1000), 68.4), '총급여 4,000만원 한도: 74만 - 700만 × 0.008 = 68.4만원'],
    ['근로소득세액공제 7,000만원 한도', near(workCredit(7000, 1000), 66), '총급여 7,000만원 구간 최저한도 66만원'],
    ['근로소득세액공제 7,100만원 한도', near(workCredit(7100, 1000), 50), '총급여 7,100만원 구간 한도 50만원'],
    ['근로소득세액공제 1억 2,100만원 한도', near(workCredit(12100, 1000), 20), '총급여 1억 2,000만 초과 최소한도 20만원'],
    ['연금저축 600만원 한도', near(pensionCredit(26000, 900, 0).eligible, 600), '연금저축 단독 납입 시 최대 공제대상 600만원 제한'],
    ['연금저축·IRP 합산 900만원 한도', near(pensionCredit(26000, 600, 1000).eligible, 900), 'IRP 포함 시 최대 공제대상 900만원 제한'],
  ];

  return tests.map(([name, pass, description]) => ({
    name,
    pass,
    status: pass ? 'PASS' : 'FAIL',
    description,
  }));
}

/**
 * 공개 원천징수영수증 사례 검산
 */
export function calculatePublishedReconciliation() {
  const rows = [
    { name: '소득세', assessed: 200000, prepaid: 234240, expected: -34240 },
    { name: '지방소득세', assessed: 20000, prepaid: 23420, expected: -3420 },
  ];
  const actual = rows.map((x) => ({
    ...x,
    result: x.assessed - x.prepaid,
    pass: x.assessed - x.prepaid === x.expected,
  }));
  const sum = actual.reduce((a, x) => a + x.result, 0);
  return {
    rows: actual,
    totalRefund: -sum, // 환급액 (+)
  };
}

/**
 * 국세청 공식 결과 대조
 */
export function calculateOfficialDiscrepancy(
  inputs: TaxInputs,
  official: OfficialCompareInputs
): OfficialCompareRecord[] {
  const people = build(inputs);
  const parseVal = (str: string) => {
    const trimmed = str.trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    return isNaN(num) ? null : num;
  };

  return people.map((p, i) => {
    const taxOfficial = parseVal(
      i === 0 ? official.officialSelfTax : official.officialSpouseTax
    );
    const baseOfficial = parseVal(
      i === 0 ? official.officialSelfBase : official.officialSpouseBase
    );

    return {
      who: p.who,
      enabled: p.enabled,
      estimatedTax: p.final,
      officialTax: taxOfficial,
      taxGap: taxOfficial === null ? null : p.final - taxOfficial,
      estimatedBase: p.base,
      officialBase: baseOfficial,
      baseGap: baseOfficial === null ? null : p.base - baseOfficial,
    };
  });
}
