import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";

export type BuildingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  buildingId: number;
  buildingName: string;
};

const STORAGE_KEY = 'building.listState';

const getInitialState = (projectId: number | null): BuildingListState => {
  if (!projectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      buildingId: 0,
      buildingName: "",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: BuildingListState };
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          buildingId: parsed.state.buildingId || 0,
          buildingName: parsed.state.buildingName || "",
        };
      }
    }
  } catch (error) {
    console.error('Error loading building list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    buildingId: 0,
    buildingName: "",
  };
};

type BuildingListStateContextType = {
  listState: BuildingListState;
  updateListState: (updates: Partial<BuildingListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setBuildingContext: (buildingId: number, buildingName: string) => void;
  clearBuildingContext: () => void;
};

const BuildingListStateContext = createContext<BuildingListStateContextType | null>(null);

export const BuildingListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<BuildingListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: BuildingListState = {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        buildingId: 0,
        buildingName: "",
      };
      setListState(defaultState);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing building list state:', error);
      }
    }
    setLastProjectId(projectId);
  }, [projectId, lastProjectId]);

  useEffect(() => {
    if (projectId) {
      try {
        const stateToStore = {
          projectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving building list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateListState = useCallback((updates: Partial<BuildingListState>) => {
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
    const defaultState: BuildingListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      buildingId: 0,
      buildingName: "",
    };
    setListState(defaultState);
  }, []);

  const setBuildingContext = useCallback((buildingId: number, buildingName: string) => {
    setListState((prev) => ({
      ...prev,
      buildingId,
      buildingName,
    }));
  }, []);

  const clearBuildingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      buildingId: 0,
      buildingName: "",
    }));
  }, []);

  const contextValue = useMemo<BuildingListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setBuildingContext,
      clearBuildingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setBuildingContext, clearBuildingContext]
  );

  return (
    <BuildingListStateContext.Provider value={contextValue}>
      {children}
    </BuildingListStateContext.Provider>
  );
};

export const useBuildingListState = () => {
  const ctx = useContext(BuildingListStateContext);
  if (!ctx) {
    throw new Error("useBuildingListState must be used inside BuildingListStateProvider");
  }
  return ctx;
};
