export const COLORS = {
  primary: '#DBEAFE',
  primaryLight: '#3B82F6',
  primaryHover: '#bfdbfe',
  secondary: '#D0D7DE',
  success: '#16a34a',
  error: '#dc2626',
  errorLight: '#fecaca',
  warning: '#f59e0b',
  info: '#3b82f6',
  background: '#f9fafb',
  text: '#00000080',
  textSecondary: '#6b7280',
  border: '#3b82f62e',
  backgroundSecondary: '#f9fafb',
  textLight: '#9ca3af',         // Light text
  placeholder: '#9ca3af',       // Placeholder text
  black: '#333',
  white: '#FFFFFF',
  hover: '#e6f0ff',
  menu_toggleColor: '#DBEAFE',
  primary1: '#135BEC',
  green: '#8d99ba1f'
} as const

export type ColorType = keyof typeof COLORS

export const COLOR_MAP = {
  primary: {
    solid: {
      backgroundColor: COLORS.primary1,
      color: 'white',
      border: `1px solid ${COLORS.border}`,
      hover: { backgroundColor: COLORS.primaryHover },
    },
    outline: {
      backgroundColor: 'transparent',
      color: COLORS.primary1,
      border: `1px solid ${COLORS.primary1}`,
      hover: { backgroundColor: COLORS.primaryLight },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: COLORS.primary1,
      border: 'none',
      hover: { backgroundColor: COLORS.primaryLight },
    },
    link: {
      backgroundColor: 'transparent',
      color: COLORS.primary1,
      border: 'none',
      textDecoration: 'underline',
      hover: { color: COLORS.primaryHover },
    },
    gray: {
      backgroundColor: '#8d99baff',
      color: '#5c5b8d',
      border: '#5c5b8d',
      textDecoration: 'underline',
      hover: { color: '5c5b8d' },
    },
    green: {
      solid: {
        backgroundColor: '#8d99ba1f',
        color: '#5c5b8d',
        border: '#5c5b8d',
        textDecoration: 'underline',
        hover: { color: '#5c5b8d' },
      }
    },

    purple: {
      solid: {
        backgroundColor: '#b036da',
        color: '#b036da ',
        border: '#b036da',
        textDecoration: 'underline',
        hover: { color: '#b036da' },
      }
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
  gray: {
    solid: {
      light: {
        backgroundColor: '#e2e8f0',
        color: '#1e293b',
        border: '1px solid #cbd5e1',
        hover: { backgroundColor: '#cbd5e1' },
      },
      dark: {
        backgroundColor: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid #334155',
        hover: { backgroundColor: '#334155' },
      },
    },
  },

  green: {
    solid: {
      light: {
        backgroundColor: '#dcfce7',
        color: '#008236',
        border: '1px solid #008236',
        hover: { backgroundColor: '#b9f8cf  ' },
      },
      dark: {
        backgroundColor: '#16a34a',
        color: '#dcfce7',
        border: '1px solid #15803d',
        hover: { backgroundColor: '#15803d' },
      },
      gradient: {
        background: 'linear-gradient(270deg, #00A800 -17.11%, #36E777 101.9%)',
        color: '#fff',  // text must be white (or readable)
        border: 'none',
        textDecoration: 'underline',
        hover: {
          color: '#fff',
          background: 'linear-gradient(270deg, #00A800 -17.11%, #36E777 101.9%)' // slightly darker hover shade
        },
      },
    },
  },

  purple: {
    solid: {
      light: {
        backgroundColor: '#f3e8ff',
        color: '#8200db',
        border: '1px solid #8200db',
        hover: { backgroundColor: '#f3e8ff' },
      },
      dark: {
        backgroundColor: '#9333ea',
        color: '#f3e8ff',
        border: '1px solid #7e22ce',
        hover: { backgroundColor: '#7e22ce' },
      },
    },
  },

  blue: {
    solid: {
      light: {
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: '1px solid #3b82f6',
        hover: { backgroundColor: '#2563eb' },
      },
      extraLight: {
        backgroundColor: '#DBEAFE',
        color: '#135BEC',
        hover: { backgroundColor: '#DBEAFE' },
      },
      dark: {
        backgroundColor: '#1d4ed8',
        color: '#dbeafe',
        border: '1px solid #1e40af',
        hover: { backgroundColor: '#1e40af' },
      },

      gradient_dark: {
        background: 'linear-gradient(90deg, #135BEC -56.5%, #121258 140%)',
        color: '#fff',
        border: 'none',
        textDecoration: 'underline',
        hover: {
          color: '#fff',
          background: 'linear-gradient(90deg, #135BEC -56.5%, #121258 140%)' // slightly darker hover shade
        },
      },

      gradient_light: {
        background: 'linear-gradient(90deg, #0BB4FD -19.07%, #135BEC 88.98%)',
        color: '#fff',  // text must be white (or readable)
        border: 'none',
        textDecoration: 'underline',
        hover: {
          color: '#fff',
          background: 'linear-gradient(90deg, #09A8E8 -19.07%, #0F4ECF 88.98%)' // slightly darker hover shade
        },
      },

    },
  },

  indigo: {
    solid: {
      light: {
        backgroundColor: '#6366f1',
        color: '#ffffff',
        border: '1px solid #6366f1',
        hover: { backgroundColor: '#4f46e5' },
      },
      dark: {
        backgroundColor: '#4f46e5',
        color: '#e0e7ff',
        border: '1px solid #3730a3',
        hover: { backgroundColor: '#3730a3' },
      },
    },
  },

  orange: {
    solid: {
      light: {
        backgroundColor: '#fb923c',
        color: '#000000',
        border: '1px solid #f97316',
        hover: { backgroundColor: '#f97316' },
      },
      dark: {
        backgroundColor: '#f97316',
        color: '#fff7ed',
        border: '1px solid #ea580c',
        hover: { backgroundColor: '#ea580c' },
      },
    },
  },

  red: {
    solid: {
      light: {
        backgroundColor: '#ef4444',
        color: '#ffffff',
        border: '1px solid #ef4444',
        hover: { backgroundColor: '#dc2626' },
      },
      extraLight: {
        backgroundColor: '#ef444430',
        color: '#ef4444',
        hover: { backgroundColor: '#ef444430' },
      },
      dark: {
        backgroundColor: '#dc2626',
        color: '#fee2e2',
        border: '1px solid #991b1b',
        hover: { backgroundColor: '#991b1b' },
      },

    },
  },

  pink: {
    solid: {
      light: {
        backgroundColor: '#ec4899',
        color: '#ffffff',
        border: '1px solid #ec4899',
        hover: { backgroundColor: '#db2777' },
      },
      dark: {
        backgroundColor: '#db2777',
        color: '#fce7f3',
        border: '1px solid #be185d',
        hover: { backgroundColor: '#be185d' },
      },
    },
  },

  teal: {
    solid: {
      light: {
        backgroundColor: '#14b8a6',
        color: '#ffffff',
        border: '1px solid #14b8a6',
        hover: { backgroundColor: '#0d9488' },
      },
      dark: {
        backgroundColor: '#0d9488',
        color: '#ccfbf1',
        border: '1px solid #115e59',
        hover: { backgroundColor: '#115e59' },
      },
    },
  },

  lime: {
    solid: {
      light: {
        backgroundColor: '#84cc16',
        color: '#ffffff',
        border: '1px solid #84cc16',
        hover: { backgroundColor: '#65a30d' },
      },
      dark: {
        backgroundColor: '#65a30d',
        color: '#ecfccb',
        border: '1px solid #4d7c0f',
        hover: { backgroundColor: '#4d7c0f' },
      },
    },
  },

  black: {
    solid: {
      light: {
        backgroundColor: '#111827',
        color: '#ffffff',
        border: '1px solid #1f2937',
        hover: { backgroundColor: '#000000' },
      },
      dark: {
        backgroundColor: '#000000',
        color: '#f9fafb',
        border: '1px solid #1f2937',
        hover: { backgroundColor: '#111827' },
      },
    },
  },

  transparent: {
    solid: {
      // "solid" here is actually transparent — useful as a palette key
      backgroundColor: 'transparent',
      color: '#364153',      // inherit text color (or set a semantic color like COLORS.primary)
      border: 'none',
      hover: { backgroundColor: '#f6f3f4' },
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'inherit',
      border: 'none',
      hover: { backgroundColor: 'transparent' },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'inherit',
      border: 'none',
      hover: { backgroundColor: 'rgba(0,0,0,0.04)' }, // subtle hover if wanted
    },
    link: {
      backgroundColor: 'transparent',
      color: 'inherit',
      border: 'none',
      textDecoration: 'underline',
      hover: { color: 'inherit' },
    },
    transparent_border: {
      backgroundColor: 'transparent',
      color: 'inherit',
      border: '1px solid #f6f3f4',
      hover: { backgroundColor: '#f6f3f4' },
    },
  },

  cancel: {
    solid: {
      light: {
        backgroundColor: '#D0D7DE',
        color: '#1D1D1D50',
        border: '1px solid #D0D7DE',
        hover: { backgroundColor: '#D0D7DE' },
      },

      dark: {
        backgroundColor: '#D0D7DE',
        color: '#1D1D1D50',
        border: '1px solid #D0D7DE',
        hover: { backgroundColor: '#D0D7DE' },
      },
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
        background: '#16A34A',
        border: '#10B981',
        title: COLORS.white,
        message: COLORS.white
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