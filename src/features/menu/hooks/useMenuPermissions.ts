import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'
import type { ModuleData, SubModuleData, SubSubModuleData } from '@/features/menu/models/MenuModel'
import { useMenuContext } from '@/features/menu/context/MenuContext'

export interface MenuPermissions {
  canView: boolean
  canAction: boolean
  canExport: boolean
  module?: ModuleData
  subModule?: SubModuleData
  subSubModule?: SubSubModuleData
  permissionSource: 'module' | 'subModule' | 'subSubModule' | null
  path: string
}
export class ModuleAction {
  static getQuotation = 'Get Quotation'
  static getCompare = 'Get Compare'
  static finalizeVendor = 'Finalized Vendor'
  static generatePurchaseOrder = 'Generate Purchase Order'
  static addInvoice = 'Add Invoice'
  static makePayments = 'Make Payments'
}


const normalizePath = (path: string): string => {
  if (!path) return '/'
  const trimmed = path.trim()
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const withoutTrailing = withLeadingSlash.replace(/\/+$/, '')
  return (withoutTrailing || '/').toLowerCase()
}

const findPermissionsForPath = (modules: ModuleData[], targetPath: string) => {
  for (const module of modules) {
    for (const subModule of module.SubModuleData ?? []) {
      for (const subSubModule of subModule.SubSubModuleData ?? []) {
        const subSubPath = normalizePath(subSubModule.Path)
        if (subSubPath && (targetPath === subSubPath || targetPath.startsWith(`${subSubPath}/`))) {
          return {
            module,
            subModule,
            subSubModule,
            permissionSource: 'subSubModule' as const
          }
        }
      }

      const subModulePath = normalizePath(subModule.Path)

      if (subModulePath && (targetPath === subModulePath || targetPath.startsWith(`${subModulePath}/`))) {
        return {
          module,
          subModule,
          permissionSource: 'subModule' as const
        }
      }
    }
  }

  return null
}

const derivePermissions = (
  match: ReturnType<typeof findPermissionsForPath>,
  targetPath: string
): MenuPermissions => {
  if (!match) {
    return {
      canView: false,
      canAction: false,
      canExport: false,
      permissionSource: null,
      path: targetPath
    }
  }

  const permissionHolder = match.subSubModule ?? match.subModule

  return {
    canView: Boolean(permissionHolder?.IsView),
    canAction: Boolean(permissionHolder?.IsAction),
    canExport: Boolean(permissionHolder?.IsExport),
    module: match.module,
    subModule: match.subModule,
    subSubModule: match.subSubModule,
    permissionSource: match.permissionSource,
    path: normalizePath(permissionHolder?.Path || match.subModule?.Path || targetPath)
  }
}

export const useMenuPermissions = (explicitPath?: string): MenuPermissions => {

  
  const location = useLocation()
  const targetPath = normalizePath(explicitPath ?? location.pathname)
  const { menu } = useMenuContext()

  const menuSource = useMemo<ModuleData[]>(() => {
    if (menu?.length) return menu
    const stored = LocalStorageHelper.getMenuData()
    return stored ?? []
  }, [menu])

  return useMemo<MenuPermissions>(() => {
    const match = findPermissionsForPath(menuSource, targetPath)
    return derivePermissions(match, targetPath)
  }, [menuSource, targetPath])
}


