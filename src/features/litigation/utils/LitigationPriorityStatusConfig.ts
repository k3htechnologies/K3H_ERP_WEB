export const LitigationPriorityStatusConfig = {
    'Non - Critical': {
        backgroundColor: "#F3F4F6",
        textColor: "#374151",
    },
    'Critical': {
        backgroundColor: "#FFE5E5",
        textColor: "#D32F2F",
    },
};

export const getLitigationPriorityBadgeClass = (
    status: string
) => {
    switch (status) {
        case "Critical":
            return "bg-red-50 text-red-700 border border-red-200";

        case "Non - Critical":
            return "bg-emerald-50 text-emerald-700 border border-emerald-200";

        default:
            return "bg-gray-50 text-gray-700 border border-gray-200";
    }
};
