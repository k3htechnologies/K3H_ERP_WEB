const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
const isLogistics = (r: any): boolean => !!r.Logistics

export const computeAmount = (r: any): number =>
  isLogistics(r)
    ? Number(r.Amount || 0)
    : Number(r.MaterialQuantity || 0) * Number(r.MaterialPerUnit || 0)

export const computeTaxPercent = (r: any): number =>
  Number(r.CGST || 0) +
  Number(r.SGST || 0) +
  Number(r.UGST || 0) +
  Number(r.TGST || 0)

export const computeTaxAmount = (r: any): number => computeAmount(r) * computeTaxPercent(r) / 100

export const computeGrandTotal = (r: any): number => round2(computeAmount(r) + computeTaxAmount(r));

export const computeBaseTotal = (lines: any[]): number =>  round2(lines.reduce((s, r) => s + computeAmount(r), 0))

export const computeTaxTotal = (lines: any[]): number =>  round2(lines.reduce((s, r) => s + computeTaxAmount(r), 0))

export const computeLinesTotal = (rows?: any[]): number => round2((rows ?? []).reduce((sum, r) => sum + computeGrandTotal(r), 0))
