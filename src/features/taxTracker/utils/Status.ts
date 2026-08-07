export const getNoticeStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
        "Reply Pending": { bg: "#ffedd5", text: "#C2410C" },
        "Reply Submitted": { bg: "#DBEAFE", text: "#1D4ED8" },
        "Favourable": { bg: "#F3E8FF", text: "#7E22CE" },
        "Non-Favourable": { bg: "#FEE2E2", text: "#B91C1C" },
        "Appeal Pending": { bg: "#FEF9C3", text: "#A16207" },
        "Appeal Filed": { bg: "#DBEAFE", text: "#1D4ED8" },
        "Closed": { bg: "#EBFFD5", text: "#2E844A" },
    };

    return map[status] ?? { bg: "#ffedd5", text: "#C2410C" };
};
