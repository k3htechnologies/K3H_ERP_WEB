export interface CardConfig {
    title: string;
    bgColor: string;
    textColor: string;
    labelColor: string;
    fieldTextColor: string;
    footerColor: string;
    borderColor: string;
    badgeColor: string;
}

const DEFAULT_CARD_CONFIG: CardConfig = {
    title: "Initial Notice Received",
    bgColor: "bg-[#e8eef9]",
    textColor: "text-slate-900",
    labelColor: "text-slate-500",
    fieldTextColor: "text-slate-700",
    footerColor: "text-slate-700",
    borderColor: "border-[#d0ddf2]",
    badgeColor: "border-[#a5c2f5] text-blue-600 bg-[#e8eef9] hover:bg-[#dbe6f8]"
};

const ORDER_STATUS_CONFIGS: Record<string, CardConfig> = {
    "Non-Favourable": {
        title: "Order",
        bgColor: "bg-blue-500",
        textColor: "text-white",
        labelColor: "text-blue-200",
        fieldTextColor: "text-blue-100",
        footerColor: "text-gray-600",
        borderColor: "border-blue-600",
        badgeColor: "border-white/40 text-white hover:bg-white/10"
    },
    "Favourable": {
        title: "Order",
        bgColor: "bg-blue-500",
        textColor: "text-white",
        labelColor: "text-blue-200",
        fieldTextColor: "text-blue-100",
        footerColor: "text-gray-600",
        borderColor: "border-blue-600",
        badgeColor: "border-white/40 text-white hover:bg-white/10"
    }
};

const REQUEST_TYPE_CONFIGS: Record<string, CardConfig> = {
    "Reopen": {
        title: "Reopen",
        bgColor: "bg-[#C8D7FF]",
        textColor: "text-[#116EB2]",
        labelColor: "text-[#116EB2]",
        fieldTextColor: "text-[#116EB2]",
        footerColor: "text-[#116EB2]",
        borderColor: "border-[#0C8CE9]",
        badgeColor: "border-[#0C8CE9] text-[#116EB2] hover:bg-[#C8D7FF]"
    },
    "Close-Notice": {
        title: "Closed",
        bgColor: "bg-[#EBF4FA]",
        textColor: "text-[#0E568B]",
        labelColor: "text-[#116EB2]",
        fieldTextColor: "text-[#0A3D62]",
        footerColor: "text-[#4A7B9D]",
        borderColor: "border-[#BCD7EA]",
        badgeColor: "border-[#96C2DF] text-[#0E568B] bg-white hover:bg-[#DCEEFB]"
    },
    "Notice": {
        ...DEFAULT_CARD_CONFIG,
        title: "Notice Received"
    },
    "Reply": {
        title: "Reply Submitted",
        bgColor: "bg-[#002060]",
        textColor: "text-white",
        labelColor: "text-gray-300",
        fieldTextColor: "text-white",
        footerColor: "text-black",
        borderColor: "border-transparent",
        badgeColor: "border-white text-white hover:bg-white/10"
    },
    "Order": {
        title: "Order",
        bgColor: "bg-[#1d4ed8]",
        textColor: "text-white",
        labelColor: "text-gray-300",
        fieldTextColor: "text-white",
        footerColor: "text-gray-300",
        borderColor: "border-transparent",
        badgeColor: "border-white text-white hover:bg-white/10"
    },
    "Appeal": {
        title: "Appeal Filed",
        bgColor: "bg-slate-100",
        textColor: "text-slate-900",
        labelColor: "text-slate-600",
        fieldTextColor: "text-slate-900",
        footerColor: "text-slate-500",
        borderColor: "border-slate-300",
        badgeColor: "border-slate-400 text-slate-700 bg-slate-50 hover:bg-slate-200"
    },
    "Others": {
        title: "Others",
        bgColor: "bg-[#e2e8f0]",
        textColor: "text-gray-900",
        labelColor: "text-gray-600",
        fieldTextColor: "text-gray-900",
        footerColor: "text-gray-600",
        borderColor: "border-gray-300",
        badgeColor: "border-gray-500 text-gray-700 hover:bg-gray-200"
    }
};

export const getCardConfig = (orderStatus?: string, requestType?: string): CardConfig => {
    if (orderStatus && ORDER_STATUS_CONFIGS[orderStatus]) {
        return ORDER_STATUS_CONFIGS[orderStatus];
    }

    if ((!orderStatus || orderStatus === '') && requestType && REQUEST_TYPE_CONFIGS[requestType]) {
        return REQUEST_TYPE_CONFIGS[requestType];
    }

    return DEFAULT_CARD_CONFIG;
};

export const getNoticeStatusColor = (status: string = "") => {
    const map: Record<string, { bg: string; text: string }> = {
        "Reply Pending": { bg: "#ffedd5", text: "#C2410C" },
        "Pending": { bg: "#d9f8e4ff", text: "#0cd092ff" },
        "Reply Submitted": { bg: "#DBEAFE", text: "#1D4ED8" },
        "Favourable": { bg: "#F3E8FF", text: "#7E22CE" },
        "Non-Favourable": { bg: "#FEE2E2", text: "#B91C1C" },
        "Appeal Pending": { bg: "#FEF9C3", text: "#A16207" },
        "Appeal Filed": { bg: "#e8f9f8ff", text: "#0aa3c5ff" },
        "Closed": { bg: "#EBFFD5", text: "#2E844A" },
        "Reopened": { bg: "#002060", text: "#ffffff" },
    };

    return map[status] ?? { bg: "#ffedd5", text: "#C2410C" };
};

