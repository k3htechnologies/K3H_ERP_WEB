import React from "react";

interface AttendanceStatusStyleProps {
    status?: string;
    children: React.ReactNode;
}

const attendanceStatusStyles: Record<string, { card: string; badge: string }> = {
    present: {
        card: "bg-[linear-gradient(110deg,#F4FEFA_0%,#D6F9DD_55%,#C9F6D2_100%)]",
        badge: "text-[#16A24A] border border-[#16A24A] bg-[#C8F2D1]",
    },
    absent: {
        card: "bg-[linear-gradient(110deg,#FFFAFA_0%,#FADADA_55%,#F5CACA_100%)]",
        badge: "text-[#FF2828] border border-[#FF2828] bg-[#F5CACA]",
    },
    leave: {
        card: "bg-[linear-gradient(110deg,#FCF9FF_0%,#F0E4FF_55%,#E8D8FF_100%)]",
        badge: "text-[#9200EA] border border-[#9200EA] bg-[#E0CCFF]",
    },
    holiday: {
        card: "bg-[linear-gradient(110deg,#F8FBFF_0%,#E0EEFF_55%,#D1E5FF_100%)]",
        badge: "text-[#008EB1] border border-[#008EB1] bg-[#C6E0FF]",
    },
    "late in": {
        card: "bg-[linear-gradient(110deg,#FFFEF7_0%,#FFF6D9_55%,#FFF0C7_100%)]",
        badge: "text-[#EA5800] border border-[#EA5800] bg-[#FFE9A8]",
    },
    "half day": {
        card: "bg-[linear-gradient(110deg,#FFFBF7_0%,#FFEBDD_55%,#FFDFC7_100%)]",
        badge: "text-[#F97316] border border-[#F97316] bg-[#FFD6B5]",
    },
    "week off": {
        card: "bg-[linear-gradient(110deg,#FCFDFE_0%,#EDF1F5_55%,#E2E8F0_100%)]",
        badge: "text-[#64748B] border border-[#64748B] bg-[#D8E0EA]",
    },
    "early leave": {
        card: "bg-[linear-gradient(110deg,#FFFAFC_0%,#FBEAF3_55%,#F5DCE9_100%)]",
        badge: "text-[#DB0073] border border-[#DB0073] bg-[#F3D0E3]",
    },
    "comp-off": {
        card: "bg-[linear-gradient(110deg,#F8FFFD_0%,#DDF8F1_55%,#C8F1E7_100%)]",
        badge: "text-[#0D9488] border border-[#0D9488] bg-[#BDECE0]",
    },
    "checkout missing": {
        card: "bg-[linear-gradient(110deg,#FCFAFF_0%,#F0EBFC_55%,#E5DDF7_100%)]",
        badge: "text-[#7C3AED] border border-[#7C3AED] bg-[#DED3F5]",
    },
};

const defaultStyle = {
    card: "bg-[linear-gradient(110deg,#F9FAFB_0%,#E5E7EB_55%,#D1D5DB_100%)]",
    badge: "text-[#6B7280] border border-[#6B7280] bg-[#D1D5DB]",
};

export const getAttendanceStatusStyle = (status?: string) => {
    const normalizedStatus = status?.trim().toLowerCase() || "";
    return attendanceStatusStyles[normalizedStatus] ?? defaultStyle;
};

const AttendanceStatusStyle: React.FC<AttendanceStatusStyleProps> = ({ status, children, }) => {

    const style = getAttendanceStatusStyle(status);

    return (
        <div className={`rounded-xl ${style.card}`}>
            <span className={`inline-flex rounded-full px-2 py-1 font-semibold ${style.badge}`}>
                {status || "-"}
            </span>

            {children}
        </div>
    );
};

export default AttendanceStatusStyle;
