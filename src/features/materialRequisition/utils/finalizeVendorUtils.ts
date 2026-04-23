export const computeAmount = (r: any): number => {
  const amount = Number(r.Amount || 0)

  // if manual amount present use it
  if (amount > 0) return amount

  return (
    Number(r.MaterialQuantity || 0) *
    Number(r.MaterialPerUnit || 0)
  )
}

export const computeTaxPercent = (r: any): number =>
  Number(r.CGST || 0) +
  Number(r.SGST || 0) +
  Number(r.UGST || 0) +
  Number(r.TGST || 0)

export const computeTaxAmount = (r: any): number =>
  computeAmount(r) * computeTaxPercent(r) / 100

export const computeGrandTotal = (r: any): number =>
  computeAmount(r) + computeTaxAmount(r)

export const computeBaseTotal = (lines: any[]) =>
  lines.reduce((s, r) => s + computeAmount(r), 0)

export const computeTaxTotal = (lines: any[]) =>
  lines.reduce((s, r) => s + computeTaxAmount(r), 0)

export const computeLinesTotal = (lines: any[]) =>
  lines.reduce((s, r) => s + computeGrandTotal(r), 0)