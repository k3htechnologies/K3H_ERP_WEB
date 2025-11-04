export const COLORS = {
    primary: '#1e40af',
    primaryLight: '#bfdbfe',
    primaryHover:'#bfdbfe',
    secondary: '#9333ea',
    success: '#16a34a',
    error: '#dc2626',
    errorLight: '#fecaca',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    backgroundSecondary: '#f9fafb',
    textLight: '#9ca3af',         // Light text
    placeholder: '#9ca3af',       // Placeholder text
} as const

export type ColorType = keyof typeof COLORS


// ============================================================================
// BUTTON / COMPONENT COLOR MAP
// ============================================================================
export const COLOR_MAP = {
  primary: {
    solid: {
      backgroundColor: COLORS.primary,
      color: 'white',
      border: `1px solid ${COLORS.border}`,
      hover: { backgroundColor: COLORS.primaryHover },
    },
    outline: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
      border: `1px solid ${COLORS.primary}`,
      hover: { backgroundColor: COLORS.primaryLight },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
      border: 'none',
      hover: { backgroundColor: COLORS.primaryLight },
    },
    link: {
      backgroundColor: 'transparent',
      color: COLORS.primary,
      border: 'none',
      textDecoration: 'underline',
      hover: { color: COLORS.primaryHover },
    },
  },
  error: {
    solid: {
      backgroundColor: COLORS.error,
      color: 'white',
      border: `1px solid ${COLORS.border}`,
      hover: { backgroundColor: '#b91c1c' },
    },
  },
  secondary: {
    solid: {
      backgroundColor: '#64748b',
      color: 'white',
      border: 'none',
      hover: { backgroundColor: '#475569' },
    },
  },
  success: {
    solid: {
      backgroundColor: '#16a34a',
      color: 'white',
      border: 'none',
      hover: { backgroundColor: '#15803d' },
    },
  },
  warning: {
    solid: {
      backgroundColor: '#facc15',
      color: '#000',
      border: 'none',
      hover: { backgroundColor: '#eab308' },
    },
  },
  info: {
    solid: {
      backgroundColor: '#0ea5e9',
      color: 'white',
      border: 'none',
      hover: { backgroundColor: '#0284c7' },
    },
  },
} as const

export type ColorMapType = typeof COLOR_MAP



// ============================================================================
// TOAST COLOR STYLES
// ============================================================================

export const getToastColors = (type: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default') => {
  switch (type) {
    case 'success':
      return {
        background: '#ECFDF5',
        border: '#10B981',
        title: '#065F46',
        message: '#047857'
      }
    case 'error':
      return {
        background: '#FEF2F2',
        border: '#EF4444',
        title: '#991B1B',
        message: '#DC2626'
      }
    case 'warning':
      return {
        background: '#FFFBEB',
        border: '#F59E0B',
        title: '#92400E',
        message: '#D97706'
      }
    case 'info':
      return {
        background: '#EFF6FF',
        border: '#3B82F6',
        title: '#1E40AF',
        message: '#2563EB'
      }
    default:
      return {
        background: '#F9FAFB',
        border: '#6B7280',
        title: '#374151',
        message: '#6B7280'
      }
  }
}