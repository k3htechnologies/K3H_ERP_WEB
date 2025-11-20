
import { COLORS } from './colors'

export const THEME = {

    colors: COLORS,

    spacing: {
        xs: '4px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
    },

    borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        doublexl: '1rem',
        xs: '1px',
    },

    fontSize: {
        xs: '10px',
        sm: '14px',
        md: '16px',
        lg: '18px',
    },

    fontWeight: {
        normal: '400',
        medium: '500',
        bold: '700',
        semibold: '800'
    },

    transitions: {
        fast: '0.15s ease',
        normal: '0.3s ease',
    },

    shadows: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    }
} as const
