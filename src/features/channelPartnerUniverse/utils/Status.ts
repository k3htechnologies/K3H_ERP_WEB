export const getActiveInactiveStatuscolor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {

        "Active": { bg: "#51E5514A", text: "#48C848" },
        "Inactive": { bg: "#FF003726", text: "#FF0037" },

    };

    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
