import React, { createContext, useContext, useState } from 'react'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'

interface ProjectContextType {
  projectId: number | null
  setProjectId: (id: number) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const emp = LocalStorageHelper.getStoredEmployeeData?.()

  const [projectId, setProjectIdState] = useState<number | null>(() => {

    const stored = LocalStorageHelper.getSelectedProject?.() ?? emp?.ProjectData?.[0]?.ProjectId ?? null

    return stored !== null && stored !== undefined ? Number(stored) : null

  })

  const setProjectId = (id: number) => {

    setProjectIdState(id)

    LocalStorageHelper.storeSelectedProject?.(id)

    console.log(id)

  }

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId }}>

      {children}

    </ProjectContext.Provider>
  )
}

export const useProject = () => {

  const ctx = useContext(ProjectContext)

  if (!ctx) throw new Error('useProject must be used inside ProjectProvider')
  return ctx
}
