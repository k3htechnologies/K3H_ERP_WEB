import React from "react";

export interface RadioPillProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  checked: boolean;
}

export default function RadioPill({
  label,
  checked,
  disabled,
  ...props
}: RadioPillProps) {
  return (
    
    <label
      className={`
        inline-flex items-center justify-center px-4 py-1 
        border rounded-md cursor-pointer select-none transition-colors
        ${checked
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-blue-600 border-blue-600"}
        ${disabled ? "opacity-60 cursor-not-allowed" : ""}
      `}
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
