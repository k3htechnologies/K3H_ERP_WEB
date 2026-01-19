import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ProjectMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  projectId: number;
  projectName: string;
  pageName: string;
  uniquekey: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PROJECT_MASTER;

const getInitialState = (): ProjectMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as ProjectMasterListState;
      return {
        ...parsed,
        projectId: parsed.projectId || 0,
        projectName: parsed.projectName || "",
        uniquekey: parsed.uniquekey || "",
      };
    }
  } catch (error) {
    console.error('Error loading project master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    projectId: 0,
    projectName: "",
    pageName: "",
    uniquekey: "",

  };
};

type ProjectMasterListStateContextType = {
  listState: ProjectMasterListState;
  updateListState: (updates: Partial<ProjectMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setProjectContext: (projectId: number, projectName: string, uniquekey: string) => void;
  clearProjectContext: () => void;
};

const ProjectMasterListStateContext = createContext<ProjectMasterListStateContextType | null>(null);

export const ProjectMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<ProjectMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving project master list state:', error);
    }
  }, [listState]);


  const updateListState = useCallback((updates: Partial<ProjectMasterListState>) => {
    setListState((prev) => ({ ...prev, ...updates }));
  }, []);


  const resetFilters = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultState: ProjectMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      projectId: 0,
      projectName: "",
      pageName: "",
      uniquekey: "",
    };
    setListState(defaultState);
  }, []);


  const setProjectContext = useCallback((projectId: number, projectName: string, uniquekey: string) => {
    setListState((prev) => ({
      ...prev,
      projectId,
      projectName,
      uniquekey,
    }));
  }, []);


  const clearProjectContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      projectId: 0,
      projectName: "",
      uniquekey: "",
    }));
  }, []);

  const contextValue = useMemo<ProjectMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setProjectContext,
      clearProjectContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setProjectContext, clearProjectContext]
  );

  return (
    <ProjectMasterListStateContext.Provider value={contextValue}>
      {children}
    </ProjectMasterListStateContext.Provider>
  );
};

export const useProjectMasterListState = () => {
  const ctx = useContext(ProjectMasterListStateContext);
  if (!ctx) {
    throw new Error("useProjectMasterListState must be used inside ProjectMasterListStateProvider");
  }
  return ctx;
};

