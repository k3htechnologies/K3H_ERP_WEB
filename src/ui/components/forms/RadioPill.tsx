import React from "react";

export interface RadioPillProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  checked: boolean;
  variant?: "default" | "segmented";
}

export default function RadioPill({
  label,
  checked,
  disabled,
  variant = "default",
  className = "",
  ...props
}: RadioPillProps) {
  const stateClasses =
    variant === "segmented"
      ? checked
        ? "border-transparent bg-[#DCE7FF] text-[#235EEE]"
        : "border-transparent bg-transparent text-[#7B838D]"
      : checked
        ? "border-blue-600 bg-blue-600 text-white"
        : "border-blue-600 bg-white text-blue-600";

  return (
    <label
      className={`inline-flex cursor-pointer select-none items-center justify-center rounded-md border px-4 py-1 transition-colors ${stateClasses} ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
    >
      <input
        type="radio"
        className="hidden"
        disabled={disabled}
        {...props}
      />
      {label}
    </label>
  );
}
