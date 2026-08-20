import React, { type ReactNode } from "react";

interface MeetingSectionProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const MeetingSection: React.FC<MeetingSectionProps> = ({
  title,
  children,
  actions,
  className = "",
  contentClassName = "",
}) => (
  <section className={className}>
    <div className="flex min-h-7 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-lg font-semibold leading-7 text-[#202229]">{title}</h2>
      {actions}
    </div>
    <div className="mt-3 border-t border-[#D8DCE4] pt-4">
      <div className={contentClassName}>{children}</div>
    </div>
  </section>
);

export default MeetingSection;
