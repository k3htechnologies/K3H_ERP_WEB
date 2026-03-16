export const getStatusColor = (status: string): string => {
    const normalized = status?.toLowerCase().trim();

    switch (normalized) {
        case "approved":
            return "bg-[#DCFCE7] text-[#00A800]";

        case "rejected":
            return "bg-[#FFDEDE] text-[#FF0000]";

        case "pending":
            return "bg-[#FFF0C2] text-[#7E4604]";

        case "partial pending":
            return "bg-[#F9DFFF] text-[#561F64]";

        default:
            return "bg-gray-100 text-gray-700";
    }
};