const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

// A service/logistics row is identified by its detail ID, not by the Logistics text.
const isLogistics = (r: any): boolean => Number(r?.MaterialRequisitionDetailId) === 0;

export const computeAmount = (r: any): number => {
    const quantity = Number(r.MaterialQuantity || 0);
    const unitPrice = Number(r.MaterialPerUnit || 0);

    if (isLogistics(r)) {
        return round2(Number(r.Amount || 0));
    }

    return round2(quantity * unitPrice);
};

export const computeAmountInstallation = (r: any): number => {
    
    const quantity = Number(r.MaterialQuantity || 0);
    const unitPrice = Number(r.MaterialPerUnit || 0);
    const installation = Number(r.Installation || 0);

    if (isLogistics(r)) {
        return round2(Number(r.Amount || 0));
    }

    return round2(quantity * (unitPrice + installation));
};

export const computeTaxPercent = (r: any): number =>
    Number(r.CGST || 0) + Number(r.SGST || 0) + Number(r.UGST || 0) + Number(r.TGST || r.IGST || 0);

export const computeTaxAmount = (r: any): number =>
    round2(computeAmountInstallation(r) * computeTaxPercent(r) / 100);

export const computeGrandTotal = (r: any): number =>
    round2(computeAmountInstallation(r) + computeTaxAmount(r));

export const computeBaseTotal = (lines: any[]): number =>
    round2(lines.reduce((sum, row) => sum + computeAmountInstallation(row), 0));

export const computeTaxTotal = (lines: any[]): number =>
    round2(lines.reduce((sum, row) => sum + computeTaxAmount(row), 0));

export const computeLinesTotal = (rows?: any[]): number =>
    round2((rows ?? []).reduce((sum, row) => sum + computeGrandTotal(row), 0));
