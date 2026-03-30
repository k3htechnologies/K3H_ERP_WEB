export const getInwardStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
        Assigned: { bg: "#51E5514A", text: "#48C848" },
        Acknowledged: { bg: "#FF003726", text: "#FF0037" },
        Delivered: { bg: "#FFA5004A", text: "#FF6600" },
    };

    return map[status.toLowerCase()] ?? { bg: "#F3F4F6", text: "#111827" };
};