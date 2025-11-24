// src/core/types/form.types.ts
import type { ReactNode, CSSProperties, InputHTMLAttributes, ButtonHTMLAttributes } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  fullWidth?: boolean
  loading?: boolean
  className?: string
  style?: CSSProperties
  autoResize?: boolean
}
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  fullWidth?: boolean
  loading?: boolean
  className?: string
  style?: CSSProperties
  autoResize?: boolean
}
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'color'> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'dark' | 'transparent_border' | 'light'
  colorMode?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'mxs'
  color?: | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'gray'
  | 'green'
  | 'purple'
  | 'blue'
  | 'indigo'
  | 'orange'
  | 'red'
  | 'pink'
  | 'teal'
  | 'lime'
  | 'black'
  | 'transparent'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  defineWidth?: boolean
  className?: string
  style?: CSSProperties
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loadingText?: string
  isborderRadius?: boolean
}
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: string | boolean
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  id?: string
  indeterminate?: boolean
}


export interface RichTextEditorProps {
  name?: string;
  value: string;                          // HTML
  onChange: (value: string) => void;      // returns HTML string
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'value' | 'onChange'
  > {
  label?: string;
  value?: string | null;              // DD-MM-YYYY or null
  onChange: (value: string | null) => void;

  required?: boolean;
  error?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  helperText?: string;
}
