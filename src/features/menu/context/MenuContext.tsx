import React, { createContext, useContext, useMemo } from 'react'
import type { ModuleData } from '@/features/menu/models/MenuModel'

interface MenuContextValue {
  menu: ModuleData[]
}

const MenuContext = createContext<MenuContextValue>({ menu: [] })

interface MenuProviderProps {
  menu: ModuleData[]
  children: React.ReactNode
}

export const MenuProvider: React.FC<MenuProviderProps> = ({ menu, children }) => {
  const value = useMemo<MenuContextValue>(() => ({ menu }), [menu])

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  )
}

export const useMenuContext = (): MenuContextValue => useContext(MenuContext)


