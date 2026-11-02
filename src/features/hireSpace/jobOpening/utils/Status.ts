export const getInterviewStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
        New: { bg: "#E6EFFF", text: "#3B6FD8" },
        Screening: { bg: "#F5E6FF", text: "#8B3DD6" },
        Shortlisted: { bg: "#D7F7EE", text: "#0F766E" },
        Interview: { bg: "#FFF1C7", text: "#B45309" },
        Selected: { bg: "#DCFCE7", text: "#15803D" },
        Rejected: { bg: "#FFE1E1", text: "#DC2626" },
        "Round 1": { bg: "#DCE7FF", text: "#3E5FA8" },
        "Round 2": { bg: "#B7C4FF", text: "#3B4A8F" },
    };

    return map[status] ?? { bg: "#F3F4F6", text: "#111827" };
};
