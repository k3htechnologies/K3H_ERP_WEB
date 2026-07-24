import type { ReactNode } from "react";

interface AddUpdateFormLayoutProps {
  children: ReactNode;
  actions: ReactNode;
  overlay?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function AddUpdateFormLayout({
  children,
  actions,
  overlay,
  className = "",
  contentClassName = "",
}: AddUpdateFormLayoutProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      {overlay}
      <div
        className={`thin-scroll flex-1 space-y-2 overflow-y-auto px-6 py-3 ${contentClassName}`}
      >
        {children}
      </div>
      {actions}
    </div>
  );
}
