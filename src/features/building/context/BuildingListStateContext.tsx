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
      // Only use stored state if it's for the same project
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          // Ensure buildingId and buildingName are reset when on list page
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

  // Reset state when project changes
  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      // Project changed - reset to default state
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
      // Clear stored state for old project
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing building list state:', error);
      }
    }
    setLastProjectId(projectId);
  }, [projectId, lastProjectId]);

  // Persist state to localStorage when it changes (only if projectId exists)
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

  // Update list state (partial updates)
  const updateListState = useCallback((updates: Partial<BuildingListState>) => {
    setListState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset filters only (keeps page, pageSize, etc.)
  const resetFilters = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  // Reset to default state
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

  // Set building context (for view/document/description pages)
  const setBuildingContext = useCallback((buildingId: number, buildingName: string) => {
    setListState((prev) => ({
      ...prev,
      buildingId,
      buildingName,
    }));
  }, []);

  // Clear building context (when leaving view pages)
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
