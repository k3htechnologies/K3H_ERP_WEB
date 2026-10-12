export const getGatePassStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {

        "Checked Out": { bg: "#51E5514A", text: "#48C848" },
        "Currently Inside": { bg: "#1AA0DB26", text: "#1AA0DB" },
        "Not Checked Out": { bg: "#FFA5004A", text: "#FF6600" },

    };

    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};

export const getAlertColor = (alertType: string = "") => {
    const map: Record<string, { bg: string; border: string; accent: string }> = {

        "Not Checked Out": { bg: "#FFF7ED", border: "#FFEDD5", accent: "#FB923C" },

    };

    return map[alertType] ?? { bg: "#F3F4F6", border: "#E5E7EB", accent: "#9CA3AF" };
};
