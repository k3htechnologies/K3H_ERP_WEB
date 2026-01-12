export interface MultiSelectOption {
  label: string;
  value: number | string;
}

interface RadioPillMultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: Array<number | string>;
  onChange: (values: Array<number | string>) => void;
  disabled?: boolean;
  error?: string;
}

export default function RadioPillMultiSelect({
  label,
  options,
  value,
  onChange,
  disabled,
  error
}: RadioPillMultiSelectProps) {

  const toggle = (val: number | string) => {
    if (value.includes(val)) {
      onChange(value.filter(x => x !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block font-semibold mb-2">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <label
            key={opt.value}
            className={`
              inline-flex items-center justify-center px-4 py-1 border rounded-md 
              cursor-pointer select-none transition
              ${
                value.includes(opt.value)
                  ? "bg-blue-600 text-white border-blue-600 shadow"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            <input
              type="checkbox"
              className="hidden"
              disabled={disabled}
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
