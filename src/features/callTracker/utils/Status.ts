export const getCallTrackerStatuscolor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {

        "Connected": { bg: "#51E5514A", text: "#48C848" },
        "Disconnected": { bg: "#FF003726", text: "#FF0037" },
        "Wrong Number": { bg: "#1D1D1D26", text: "#333333" },
        "Switched Off": { bg: "#FBFF0026", text: "#7B6B28" },
        "Not Connected": { bg: "#CC00FF4A", text: "#561F64" },
        "No Answer": { bg: "#1AA0DB26", text: "#1AA0DB" },
        "Busy": { bg: "#7E460440", text: "#7E4604" },
        "Rescheduled": { bg: "#12125833", text: "#243965" },


    };

    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
