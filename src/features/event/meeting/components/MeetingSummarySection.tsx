import React, { type ReactNode } from "react";

export type MeetingSummaryTone =
  | "purple"
  | "blue"
  | "orange"
  | "cyan"
  | "gray";

interface MeetingSummarySectionProps {
  title: ReactNode;
  tone: MeetingSummaryTone;
  children: ReactNode;
  className?: string;
}

interface MeetingSummaryFieldProps {
  label: string;
  value?: string;
}

const TONE_CLASSES: Record<MeetingSummaryTone, string> = {
  purple: "bg-[#F3EFFF] text-[#6337EA]",
  blue: "bg-[#F1F5FC] text-[#254C91]",
  orange: "bg-[#FFF4E8] text-[#E3611B]",
  cyan: "bg-[#E7FAFD] text-[#00A7CE]",
  gray: "bg-[#E5E5E7] text-[#4A4A4A]",
};

export const MeetingSummarySection: React.FC<MeetingSummarySectionProps> = ({
  title,
  tone,
  children,
  className = "",
}) => (
  <section
    className={`overflow-hidden rounded-lg border border-[#E7E9EE] bg-white ${className}`}
  >
    <div
      className={`border-b border-[#DFE3EA] px-4 py-2.5 text-sm font-semibold ${TONE_CLASSES[tone]}`}
    >
      {title}
    </div>
    {children}
  </section>
);

export const MeetingSummaryField: React.FC<MeetingSummaryFieldProps> = ({
  label,
  value,
}) => (
  <div className="min-w-0">
    <p className="text-sm text-[#9AA0AA]">{label}</p>
    <p className="mt-1 break-words text-sm font-medium text-[#202229]">
      {value || "--"}
    </p>
  </div>
);

export default MeetingSummarySection;
