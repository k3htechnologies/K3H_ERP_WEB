import React, { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  ChevronRight,
  ChevronDown,
  X,
  LogOut
} from 'lucide-react'
import type {  ModuleData, SubModuleData, SubSubModuleData } from '../../features/menu/models/MenuModel'

interface SidebarProps {
  isOpen: boolean
  modules: ModuleData[]
  onModuleSelect: (module: ModuleData) => void
  onSubModuleSelect: (subModule: SubModuleData) => void
  onSubSubModuleSelect: (subSubModule: SubSubModuleData) => void
  onClose: () => void
  onLogout: () => void
  selectedModule?: ModuleData
  selectedSubModule?: SubModuleData
  selectedSubSubModule?: SubSubModuleData
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  children?: MenuItem[]
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  modules,
  onModuleSelect,
  onSubModuleSelect,
  onSubSubModuleSelect,
  onClose,
  onLogout,
  selectedModule,
  selectedSubModule,
  selectedSubSubModule
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Function to find the active menu item based on current path
  const findActiveMenuItem = (currentPath: string) => {
    if (!modules || modules.length === 0) return null
    
    for (const module of modules) {
      if (!module.SubModuleData || module.SubModuleData.length === 0) continue
      
      for (const subModule of module.SubModuleData) {
        if (subModule.SubSubModuleData && subModule.SubSubModuleData.length > 0) {
          for (const subSubModule of subModule.SubSubModuleData) {
            if (mapApiPathToRoute(subSubModule.Path) === currentPath) {
              return {
                module,
                subModule,
                subSubModule
              }
            }
          }
        }
        if (mapApiPathToRoute(subModule.Path) === currentPath) {
          return {
            module,
            subModule,
            subSubModule: null
          }
        }
      }
    }
    return null
  }

  // Auto-expand active path on component mount
  React.useEffect(() => {
    const activeMenuItem = findActiveMenuItem(location.pathname)
    if (activeMenuItem) {
      const newExpanded = new Set<string>()
      
      // Always expand the module
      if (activeMenuItem.module) {
        newExpanded.add(`module-${activeMenuItem.module.ModulesMasterId}`)
      }
      
      // Expand submodule if it exists
      if (activeMenuItem.subModule) {
        newExpanded.add(`submodule-${activeMenuItem.subModule.SubModulesMasterId}`)
      }
      
      setExpandedItems(newExpanded)
    }
  }, [location.pathname, modules])

  // Function to handle image load errors
  const handleImageError = useCallback((iconPath: string) => {
    setImageErrors(prev => new Set(prev).add(iconPath))
  }, [])

  // Function to map API paths to actual routes (case-insensitive)
  const mapApiPathToRoute = (apiPath: string): string => {
    const normalized = (apiPath || '')
    const pathMappings: Record<string, string> = {
      '/departmentmaster': '/departmentMaster',
      '/designationmaster': '/designationMaster',
      '/employeemaster': '/employeeMaster'
    }
    return pathMappings[normalized] || normalized
  }

  // Function to render icon from API response
  const renderIcon = (iconPath: string, fallbackIcon: React.ReactNode, size: string = "h-5 w-5") => {
    if (iconPath && iconPath.startsWith('assets/') && !imageErrors.has(iconPath)) {
      return (
        <img 
          src={`/${iconPath}`} 
          alt="icon" 
          className={`${size} object-contain`}
          onError={() => handleImageError(iconPath)}
        />
      )
    }
    return fallbackIcon
  }

  // Build menu items from API data only
  const menuItems: MenuItem[] = [
    // Dashboard (always first)
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard'
    },
    // Modules from API - with null/undefined safety checks
    ...(modules || []).map(module => ({
      id: `module-${module.ModulesMasterId}`,
      label: module.ModuleName,
      icon: renderIcon(module.Icon, <Home className="h-5 w-5" />),
      children: (module.SubModuleData || []).map(subModule => ({
        id: `submodule-${subModule.SubModulesMasterId}`,
        label: subModule.SubModuleName,
        icon: renderIcon(subModule.Icon, <Home className="h-4 w-4" />, "h-4 w-4"),
        path: mapApiPathToRoute(subModule.Path),
        children: (subModule.SubSubModuleData || [])
          .filter(subSubModule => subSubModule?.IsDisplay)
          .map(subSubModule => ({
            id: `subsubmodule-${subSubModule.SubSubModulesMasterId}`,
            label: subSubModule.SubSubModuleName,
            icon: renderIcon(subSubModule.Icon, <Home className="h-4 w-4" />, "h-4 w-4"),
            path: mapApiPathToRoute(subSubModule.Path)
          }))
      }))
    })),
    
  ]

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleItemClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.id)
    } else {
      // Handle navigation for items with paths
      if (item.path) {
        // Map API paths to actual routes
        const route = mapApiPathToRoute(item.path)
        navigate(route)
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
          onClose()
        }
      } else if (item.id.startsWith('module-')) {
        const moduleId = parseInt(item.id.replace('module-', ''))
        const module = modules.find(m => m.ModulesMasterId === moduleId)
        if (module) {
          onModuleSelect(module)
        }
      } else if (item.id.startsWith('submodule-')) {
        const subModuleId = parseInt(item.id.replace('submodule-', ''))
        const module = modules.find(m => 
          m.SubModuleData.some(sm => sm.SubModulesMasterId === subModuleId)
        )
        if (module) {
          const subModule = module.SubModuleData.find(sm => sm.SubModulesMasterId === subModuleId)
          if (subModule) {
            onSubModuleSelect(subModule)
          }
        }
      } else if (item.id.startsWith('subsubmodule-')) {
        const subSubModuleId = parseInt(item.id.replace('subsubmodule-', ''))
        const module = modules.find(m => 
          m.SubModuleData.some(sm => 
            sm.SubSubModuleData.some(ssm => ssm.SubSubModulesMasterId === subSubModuleId)
          )
        )
        if (module) {
          const subModule = module.SubModuleData.find(sm => 
            sm.SubSubModuleData.some(ssm => ssm.SubSubModulesMasterId === subSubModuleId)
          )
          if (subModule) {
            const subSubModule = subModule.SubSubModuleData.find(ssm => ssm.SubSubModulesMasterId === subSubModuleId)
            if (subSubModule) {
              onSubSubModuleSelect(subSubModule)
            }
          }
        }
      }
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isModule = item.id.startsWith('module-')
    const isSubModule = item.id.startsWith('submodule-')
    const isSubSubModule = item.id.startsWith('subsubmodule-')
    
    // Check if current page is active based on location
    const isCurrentPage = item.path && location.pathname === item.path
    
    // Find the active menu item based on current path
    const activeMenuItem = findActiveMenuItem(location.pathname)
    
    // Check if this item is part of the active path dynamically
    const isInActivePath = activeMenuItem && (
      (isModule && activeMenuItem.module && item.id === `module-${activeMenuItem.module.ModulesMasterId}`) ||
      (isSubModule && activeMenuItem.subModule && item.id === `submodule-${activeMenuItem.subModule.SubModulesMasterId}`) ||
      (isSubSubModule && activeMenuItem.subSubModule && item.id === `subsubmodule-${activeMenuItem.subSubModule.SubSubModulesMasterId}`)
    )
    
    // Check if any parent is selected to color all levels
    const isParentSelected = selectedModule && (
      (isModule && item.id === `module-${selectedModule.ModulesMasterId}`) ||
      (isSubModule && selectedModule.ModulesMasterId) ||
      (isSubSubModule && selectedModule.ModulesMasterId)
    )
    
    const isSelected = isCurrentPage || isInActivePath || (
      (isModule && selectedModule && 
        item.id === `module-${selectedModule.ModulesMasterId}`) ||
      (isSubModule && selectedSubModule && 
        item.id === `submodule-${selectedSubModule.SubModulesMasterId}`) ||
      (isSubSubModule && selectedSubSubModule && 
        item.id === `subsubmodule-${selectedSubSubModule.SubSubModulesMasterId}`)
    )

    // Different styling for each level based on Figma design
    const getLevelStyles = () => {
      if (isModule) {
        return {
          container: 'relative',
          button: `
            w-full flex items-center space-x-3 px-4 py-2 rounded-md transition-all duration-200
            ${isSelected 
              ? 'text-blue-800 font-semibold' 
              : 'text-gray-800 hover:bg-gray-100 active:bg-gray-200 font-medium'
            }
            ${!isOpen ? 'justify-center' : ''}
            touch-manipulation
          `,
          icon: 'h-5 w-5',
          text: 'text-sm font-medium',
          chevron: 'h-4 w-4'
        }
      } else if (isSubModule) {
        return {
          container: 'relative ml-6 border-l-2 border-gray-300 pl-4',
          button: `
            w-full flex items-center space-x-3 px-3 py-2.5 rounded-md transition-all duration-200
            ${isCurrentPage 
              ? 'text-blue-800 font-semibold' 
              : isInActivePath 
                ? 'text-blue-700 font-medium' 
                : isParentSelected 
                  ? 'text-blue-700' 
                  : isSelected 
                    ? 'text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
            }
            touch-manipulation
          `,
          icon: 'h-4 w-4',
          text: 'text-sm font-medium',
          chevron: 'h-4 w-4'
        }
      } else {
        return {
          container: 'relative ml-8 border-l-2 border-gray-200 pl-4',
          button: `
            w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200
            ${isCurrentPage 
              ? 'text-blue-800 font-semibold' 
              : isInActivePath 
                ? 'text-blue-600 font-medium' 
                : isParentSelected 
                  ? 'text-blue-600' 
                  : isSelected 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200'
            }
            touch-manipulation
          `,
          icon: 'h-4 w-4',
          text: 'text-sm',
          chevron: 'h-4 w-4'
        }
      }
    }

    const styles = getLevelStyles()

    return (
      <div key={item.id} className={styles.container}>
        <button
          onClick={() => handleItemClick(item)}
          className={styles.button}
          title={!isOpen ? item.label : undefined}
        >
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className={styles.icon}>
              {item.icon}
            </div>
          </div>
          
          {isOpen && (
            <>
              <span className={`flex-1 text-left ${styles.text}`}>
                {item.label}
              </span>
              {hasChildren && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className={styles.chevron} />
                  ) : (
                    <ChevronRight className={styles.chevron} />
                  )}
                </div>
              )}
            </>
          )}
        </button>

        {/* Render children with proper indentation and vertical lines */}
        {isOpen && hasChildren && isExpanded && (
          <div className="mt-0 space-y-0 relative">
            {/* Main vertical line for children */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            {item.children!.map((child) => (
              <div key={child.id} className="relative">
                {/* Horizontal connector line */}
                <div className="absolute left-6 top-3 w-4 h-0.5 bg-gray-300"></div>
                {renderMenuItem(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out
        fixed lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isOpen ? 'w-[18rem]' : 'w-16'}
        h-screen lg:h-full overflow-hidden flex flex-col z-50
      `}>
      {/* Fixed Header with Logo and User Details */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between h-16 px-4">
          {isOpen ? (
            <div className="flex items-center space-x-3 flex-1">
              <img 
                src="/src/assets/images/appLogo.png" 
                alt="K3H ERP" 
                className="h-8 w-8 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/src/assets/images/appLogo.png'
                }}
              />
              <div className="flex-1 min-w-0">
                {(() => {
                  // Get user details from localStorage
                  const userData = localStorage.getItem('employee_data')
                  let userDetails = {
                    name: '',
                    designation: '',
                    department: '',
                    mobileNumber: ''
                  }
                  
                  if (userData) {
                    try {
                      const parsedData = JSON.parse(userData)
                      userDetails = {
                        name: parsedData.FullName || 'User',
                        designation: parsedData.Designation || 'Employee',
                        department: parsedData.Department || 'General',
                        mobileNumber: parsedData.PersonalMobileNumber || '0000000000'
                      }
                    } catch (error) {
                      console.error('Error parsing user details:', error)
                    }
                  }
                  
                  return (
                    <>
                      <div className="text-sm font-medium text-gray-800 truncate">{userDetails.name}</div>
                      <div className="text-xs text-gray-600 truncate">{userDetails.designation} • {userDetails.department}</div>
                      <div className="text-xs text-gray-500 truncate">{userDetails.mobileNumber}</div>
                    </>
                  )
                })()}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img 
                src="/src/assets/images/appLogo.png" 
                alt="K3H" 
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = '/src/assets/images/appLogo.png'
                }}
              />
            </div>
          )}
          
          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>


      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <nav className="space-y-1 px-4 py-4 flex-1 flex flex-col">
          <div className="space-y-0">
            {menuItems.map(item => renderMenuItem(item))}
          </div>
          
          {/* Flexible spacer to push footer down when content is minimal */}
          <div className="flex-1"></div>
        </nav>
      </div>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="p-4">
          {isOpen ? (
            <div className="space-y-3">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-md transition-colors duration-200 touch-manipulation"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Version 1.0.0
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={onLogout}
                className="h-8 w-8 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded flex items-center justify-center transition-colors duration-200 touch-manipulation"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 text-white" />
              </button>
              <p className="text-xs text-gray-400">
                v1.0.0
              </p>
            </div>
          )}
        </div>
      </div>
      </aside>
    </>
  )
}
