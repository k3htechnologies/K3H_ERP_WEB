export const getBadgeStyles = (status: string) => {
    switch (status) {
        case "Reply Due":
            return "bg-[#FEEFEF] text-[#EA384D]";

        case "Appeal Due":
            return "bg-[#E9F0FE] text-[#1A73E8]";
        case "Order Due":
            return "bg-[#FEF9D9] text-[#713F12]";
        default:
            return "bg-gray-100 text-gray-700";
    }
};