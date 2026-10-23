/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Input Validation & Domain Safeguards
 */

import { TaxInputs, StockGiftInputs } from './types';

export function sanitizeNumber(val: unknown, fallback: number = 0, min: number = 0): number {
  const n = Number(val);
  if (isNaN(n) || !isFinite(n)) return fallback;
  return Math.max(min, n);
}

export interface ValidationWarning {
  field: string;
  level: 'info' | 'warning' | 'caution';
  message: string;
}

export function validateTaxInputs(inputs: TaxInputs): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const totalSalarySelf = Math.max(0, inputs.salary + inputs.bonus - inputs.nonTaxPay);

  if (totalSalarySelf <= 0) {
    warnings.push({
      field: 'salary',
      level: 'caution',
      message: '본인 총급여가 0원입니다. 근로소득이 없으면 연말정산 공제 혜택을 계산할 수 없습니다.',
    });
  }

  if (inputs.spouseEnabled === 'yes' && inputs.spouseSalary > 0) {
    if (inputs.spouseSalary <= 100) {
      warnings.push({
        field: 'spouseSalary',
        level: 'info',
        message: '배우자 총급여가 500만원(근로소득금액 150만원) 이하인 경우 배우자 기본공제(150만원) 대상이 될 수 있습니다.',
      });
    }
  }

  if (inputs.children > 0 && inputs.childrenAgeEligible > inputs.children) {
    warnings.push({
      field: 'childrenAgeEligible',
      level: 'warning',
      message: '2026년 귀속 9세 이상 적격 자녀 수가 전체 기본공제 자녀 수보다 클 수 없습니다.',
    });
  }

  const medicalThreshold = totalSalarySelf * 0.03;
  if (inputs.medical > 0 && inputs.medical < medicalThreshold && inputs.medicalOwner === 'self') {
    warnings.push({
      field: 'medical',
      level: 'info',
      message: `입력한 본인 의료비(${inputs.medical}만원)가 총급여 3% 문턱(${medicalThreshold.toFixed(1)}만원)에 미달하여 세액공제 대상액이 0원입니다.`,
    });
  }

  if (inputs.isaTransfer > 0 && !inputs.isaEligible) {
    warnings.push({
      field: 'isaTransfer',
      level: 'caution',
      message: 'ISA 만기 이전액이 입력되었으나 법정 요건 확인 체크가 되지 않아 연금계좌 세액공제에 반영되지 않습니다.',
    });
  }

  return warnings;
}

export function validateStockInputs(inputs: StockGiftInputs): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (inputs.stockSale < inputs.stockCost) {
    warnings.push({
      field: 'stockSale',
      level: 'caution',
      message: '예상 매도가액이 취득가액보다 낮아 양도차손(손실)이 발생합니다. 양도소득세는 0원이며 타 종목과의 손익통산을 검토해야 합니다.',
    });
  }

  const allowance = Math.max(0, 60000 - inputs.stockPrior);
  if (inputs.stockGift > allowance) {
    warnings.push({
      field: 'stockGift',
      level: 'warning',
      message: `증여 평가가액(${inputs.stockGift}만원)이 배우자 10년 잔여 증여공제(${allowance}만원)를 초과합니다. 초과분에 대해 증여세가 별도 과세됩니다.`,
    });
  }

  if (inputs.stockHold === 'short') {
    warnings.push({
      field: 'stockHold',
      level: 'caution',
      message: '증여 후 1년 이내 매도 시 2025년 개정 소득세법 제97조의2에 따라 증여자의 최초 취득가액이 적용되는 이월과세 대상입니다.',
    });
  }

  return warnings;
}
