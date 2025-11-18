import type { COLOR_MAP } from "../constants/colors";
import type { DropdownOptions } from "@/ui/components/DropDown/Multiselectpagination";

export interface SingleSelectWithPaginationProps {
  options?: { label: string; value: string | number }[]
  value?: string | number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  onChange?: (value: string | number) => void
  dataFetchCallBack: (
    pageNumber: number,
    params?: { value?: string }
  ) => Promise<{ totalNumberOfRecord: number; itemList: { label: string; value: string | number }[] }>
  onSelected: (item: { label: string; value: string | number | null}) => void
  title?: string
  label?:string
  validator?: (value?: string | number | null) => string | undefined
  initialValue?: { label: string; value: string | number } | null
  dataList?: { label: string; value: string | number }[]
  pageSize?: number
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
  style?: React.CSSProperties
}
export interface MultiSelectDropdownProps {
  dataList: { label: string; value: string | number }[]
  onSelected: (selectedItems: { label: string; value: string | number }[]) => void
  title: string
  validator?: (values: (string | number)[]) => string | undefined
  initialValues?: { label: string; value: string | number }[]
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  color?: keyof typeof COLOR_MAP
  variant?: 'solid' | 'outline'
  onSearch?: (searchValue: string) => void
  loading?: boolean
  noDataText?: string
  size?: 'sm' | 'md' | 'lg'
}
// export interface SinglePageSelectionProps {
//   label?: string;
//   options: { label: string; value: string | number }[];
//   value?: string | number;
//   onChange: (value: string | number) => void;
//   disabled?: boolean;
//   placeholder?: string;
//   size?: "sm" | "md" | "lg";
//   theme?: {
//     spacing: Record<string, string>;
//     fontSize: Record<string, string>;
//   };
// }
export interface SinglePageSelectionProps {
  label?: string;
  options: { label: string; value: string | number }[];
  value?: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  required?: boolean;
  error?: string;
  theme?: {
    spacing: Record<string, string>;
    fontSize: Record<string, string>;
  };
}

export interface MultiSelectPaginationProps {
  label?: string;
  options: DropdownOptions[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
}
