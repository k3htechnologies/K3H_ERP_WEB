export const getBudgetStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
        L1: { bg: "#00236F", text: "#FFFFFF" },
        L2: { bg: "#3730A3", text: "#FFFFFF" },
        L3: { bg: "#334155", text: "#FFFFFF" },
        L4: { bg: "#C5C5D3", text: "#444651" },
        L5: { bg: "#4c75b2", text: "#FFFFFF" },
    };

    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};