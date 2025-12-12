import type { COLOR_MAP } from "../constants/colors";

export interface SingleSelectWithPaginationProps {
  options?: { label: string; value: string | number }[]
  value?: string | number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  onChange?: (value: string | number) => void
  dataFetchCallBack?: (
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
  hasSubmitted?: boolean,
  required?: boolean
  error?: string
  className?: string
  style?: React.CSSProperties
}
export interface MultiSelectDropdownProps {
  label?: string;
  options: { [key: string]: any }[];               
  selectedValues: (string | number)[];            
  onChange: (values: (string | number)[]) => void; 
  disabled?: boolean;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  error?: string;
  labelKey?: string;  
  valueKey?: string;  
  searchable?: boolean;
}


export interface SinglePageSelectionProps {
  label?: string;
  options: Record<string, any>[];
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
  options?: { label: string; value: string | number }[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  dataFetchCallBack?: (
    pageNumber: number,
    params?: { value?: string; [key: string]: string | undefined }
  ) => Promise<{ totalNumberOfRecord: number; itemList: { label: string; value: string | number }[] }>;
  onSelected: (items: { label: string; value: string | number }[]) => void;
  title?: string;
  label?: string;
  options: DropdownOptions[];
  selectedValues: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  disabled?: boolean;
  required?: boolean;

}
