import React, { createContext, useContext, useState, useEffect } from 'react'
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'

interface ProjectContextType {
    projectId: number | null
    setProjectId: (id: number) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectId, setProjectIdState] = useState<number | null>(null)

    useEffect(() => {
        const emp = LocalStorageHelper.getStoredEmployeeData?.()
        const storedProject =
            LocalStorageHelper.getSelectedProject?.() ??
            emp?.ProjectData?.[0]?.ProjectId

        if (storedProject) setProjectIdState(Number(storedProject))
    }, [])

    const setProjectId = (id: number) => {
        setProjectIdState(id)
        LocalStorageHelper.storeSelectedProject?.(id)
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
