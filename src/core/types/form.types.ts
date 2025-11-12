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
  variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'dark'
  colorMode?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
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
