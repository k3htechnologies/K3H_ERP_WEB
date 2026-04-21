export const computeAmount = (r: any): number =>
  Math.round(
    Number(r.MaterialQuantity || 0) *
    Number(r.MaterialPerUnit || 0) * 100
  ) / 100

export const computeTaxPercent = (r: any): number =>
  Number(r.CGST || 0) +
  Number(r.SGST || 0) +
  Number(r.UGST || 0) +
  Number(r.TGST || 0)

export const computeTaxAmount = (r: any): number => {
  const amount = computeAmount(r)
  const tax = computeTaxPercent(r)

  return Math.round((amount * tax / 100) * 100) / 100
}

export const computeGrandTotal = (r: any): number =>
  Math.round(
    (computeAmount(r) + computeTaxAmount(r)) * 100
  ) / 100

export const computeLinesTotal = (lines: any[]) =>
  lines.reduce((s, r) => s + computeGrandTotal(r), 0)

export const computeBaseTotal = (lines: any[]) =>
  lines.reduce((s, r) => s + computeAmount(r), 0)

export const computeTaxTotal = (lines: any[]) =>
  lines.reduce((s, r) => s + computeTaxAmount(r), 0)