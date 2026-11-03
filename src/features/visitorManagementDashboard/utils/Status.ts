export interface StatusColor {
    bg: string;
    text: string;
}

export interface AlertColor {
    bg: string;
    border: string;
    accent: string;
}

export const getGatePassStatusColor = (status: string = ""): StatusColor => {
    const map: Record<string, StatusColor> = {
        "Rejected": { bg: "#FEE2E2", text: "#DC2626" },
        "Overstaying": { bg: "#F3E8FF", text: "#7E22CE" },
        "Not Checked Out": { bg: "#F1F5F9", text: "#334155" },
        "Not Arrived": { bg: "#DDF1FA", text: "#0284C7" },
        "Expected": { bg: "#FFEDD5", text: "#EA580C" },
        "Pending Approval": { bg: "#E0E7FF", text: "#4338CA" },
        "Approved": { bg: "#DCFCE7", text: "#16A34A" },
        "Currently Inside": { bg: "#D7F8E9", text: "#10B981" },
        "Currently In": { bg: "#D7F8E9", text: "#10B981" },
        "Checked Out": { bg: "#D8E2FF", text: "#2563EB" },
    };

    return map[status] ?? { bg: "#F3F4F6", text: "#6B7280" };
};

export const getAlertColor = (alertType: string = ""): AlertColor => {
    const map: Record<string, AlertColor> = {
        "GATE PASS REJECTED": { bg: "#FEF2F2", border: "#FEE2E2", accent: "#DC2626" },
        "Overstaying": { bg: "#FAF5FF", border: "#E9D5FF", accent: "#7E22CE" },
        "Not Checked Out": { bg: "#F8FAFC", border: "#E2E8F0", accent: "#334155" },
        "Not Arrived": { bg: "#F0F9FF", border: "#BAE6FD", accent: "#0284C7" },
        "APPOINTMENT STARTING SOON": { bg: "#FFF7ED", border: "#FFEDD5", accent: "#EA580C" },
        "Pending Approval": { bg: "#EEF2FF", border: "#C7D2FE", accent: "#4338CA" },
        "Approved": { bg: "#F0FDF4", border: "#DCFCE7", accent: "#16A34A" },
        "Currently Inside": { bg: "#F0FDF4", border: "#DCFCE7", accent: "#10B981" },
        "Checked Out": { bg: "#EFF6FF", border: "#BFDBFE", accent: "#2563EB" },
    };

    return map[alertType] ?? { bg: "#F8FAFC", border: "#E2E8F0", accent: "#64748B" };
};
