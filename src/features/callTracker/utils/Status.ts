export const getCallTrackerStatuscolor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {

        "Success": { bg: "#51E5514A", text: "#48C848" },
        "Pending": { bg: "#FF003726", text: "#FF0037" },
        "Failed": { bg: "#FFA5004A", text: "#FF6600" },

    };

    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
