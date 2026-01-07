import { useMemo, useState } from "react";
import NoDataView from "../NoDataView/NoDataView";
import {Search } from "lucide-react";
import { Input } from "./Input";
import Checkbox from "./Checkbox";

export interface MultiSelectOption {
    label: string;
    value: string | number;
}

interface MultiSelectCheckBoxProps {
    label?: string;
    options: MultiSelectOption[];
    value: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function MultiSelectCheckBox({
    label = "Select",
    options,
    value,
    onChange,
    placeholder = "Search",
    disabled = false
}: MultiSelectCheckBoxProps) {

    const [search, setSearch] = useState("");

    const filtered = useMemo(
        () =>
            options.filter(o =>
                o.label.toLowerCase().includes(search.toLowerCase())
            ),
        [options, search]
    );

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


            <label className="font-semibold block">
                {label}
            </label>

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

            {/* CHECKBOX GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                {filtered.map(item => (
                    <label
                        key={item.value}
                        className={`
                                    flex items-center gap-2 border border-blue-200 rounded-md px-3 py-2 cursor-pointer
                                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
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

                {!filtered.length && (
                    <p className="text-gray-500 col-span-full">
                        <NoDataView message="No options found   " />
                    </p>
                )}
            </div>
        </div>
    );
}
