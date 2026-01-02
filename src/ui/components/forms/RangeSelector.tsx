import React from "react";
import type { Option } from "@/path/to/master-data-file";

type RangeSelectorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  error?: string;
};

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error
}) => {

  const index = Math.max(
    options.findIndex(o => o.id === value || o.name === value),
    0
  );

  return (
    <div className="mb-4 w-full">

      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(options[Number(e.target.value)].id)}
        className="w-full mt-2 accent-blue-600"
      />

      <div className="flex justify-between text-xs md:text-sm mt-2 text-gray-800">
        {options.map((o) => (
          <span key={o.id}>{o.name}</span>
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};
