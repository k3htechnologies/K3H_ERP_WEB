import { useMemo, useState } from "react";
import NoDataView from "../NoDataView/NoDataView";
import { Search } from "lucide-react";
import { Input } from "./Input";
import Checkbox from "./Checkbox";

// =====================
// Types
// =====================
export interface MultiSelectOption {
    label: string;
    value: string | number;
}

export interface MultiSelectCategory {
  category: string;
  options: MultiSelectOption[];
}

interface MultiSelectCheckBoxWithCategoryProps {
  label?: string;
  options: MultiSelectCategory[];
  value: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

// =====================
// Component
// =====================
export default function MultiSelectCheckBoxWithCategory({
  label = "Select",
  options,
  value,
  onChange,
  placeholder = "Search",
  disabled = false
}: MultiSelectCheckBoxWithCategoryProps) {

  const [search, setSearch] = useState("");

  // 🔍 Search across categories
  const filtered = useMemo(() => {
    if (!search.trim()) return options;

    return options
      .map(group => ({
        ...group,
        options: group.options.filter(o =>
          o.label.toLowerCase().includes(search.toLowerCase())
        )
      }))
      .filter(group => group.options.length > 0);
  }, [options, search]);

  const toggle = (val: string | number) => {
    if (disabled) return;

    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="w-full space-y-3">

      {/* LABEL */}
     <label className="text-[14px] font-[500] text-[#00000080] mb-[4px] block">{label}</label>

      {/* SEARCH */}
      <div className="relative min-w-0 w-[526px]">
        <Input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={placeholder}
          leftIcon={<Search className="h-4 w-4 text-gray-400" />}
        />
      </div>

      {/* CATEGORY + CHECKBOXES */}
      <div className="space-y-6">

        {filtered.map(group => (
          <div key={group.category}>

            {/* CATEGORY TITLE */}
            <div className="font-semibold text-blue-600 pl-2 mb-3">
              {group.category}
            </div>

            {/* OPTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.options.map(item => (
                <label
                  key={item.value}
                  className={`flex items-center gap-2 border border-blue-200 rounded-md px-3 py-2 cursor-pointer
                  ${disabled ? "opacity-150 cursor-not-allowed" : ""}`}
                >
                  <Checkbox
                    type="checkbox"
                    checked={value.includes(item.value)}
                    onChange={() => toggle(item.value)}
                    disabled={disabled}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

          </div>
        ))}

        {!filtered.length && (
          <NoDataView message="No options found" />
        )}

      </div>
    </div>
  );
}
