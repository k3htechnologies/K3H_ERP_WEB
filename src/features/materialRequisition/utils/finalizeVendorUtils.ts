const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
const isLogistics = (r: any): boolean => !!r.Logistics

export const computeAmount = (r: any): number => {
    const quantity = Number(r.MaterialQuantity || 0);
    const unitPrice = Number(r.MaterialPerUnit || 0);

    if (isLogistics(r)) {
        return round2(
            Number(r.Amount || 0)
        );
    }

    return round2(
        quantity * (unitPrice )
    );
};

export const computeAmountInstallation = (r: any): number => {
    const quantity = Number(r.MaterialQuantity || 0);
    const unitPrice = Number(r.MaterialPerUnit || 0);
    const installation = Number(r.Installation || 0);

    if (isLogistics(r)) {
        return round2(
            Number(r.Amount || 0)
        );
    }

    return round2(
        quantity * (unitPrice + installation)
    );
};


export const computeTaxPercent = (r: any): number =>Number(r.CGST || 0) + Number(r.SGST || 0) + Number(r.UGST || 0) +  Number(r.TGST || 0)

export const computeTaxAmount = (r: any): number => computeAmountInstallation(r) * computeTaxPercent(r) / 100

export const computeGrandTotal = (r: any): number => round2(computeAmountInstallation(r) + computeTaxAmount(r));

export const computeBaseTotal = (lines: any[]): number =>  round2(lines.reduce((s, r) => s + computeAmountInstallation(r), 0))

export const computeTaxTotal = (lines: any[]): number =>  round2(lines.reduce((s, r) => s + computeTaxAmount(r), 0))

export const computeLinesTotal = (rows?: any[]): number => round2((rows ?? []).reduce((sum, r) => sum + computeGrandTotal(r), 0))
