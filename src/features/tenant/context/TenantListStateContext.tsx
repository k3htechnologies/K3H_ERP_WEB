import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";

export type TenantListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  buildingId: number;
  buildingName: string;
  tenantId: number;
  tenantName: string;
  applicantName: string;
};

const STORAGE_KEY = 'tenant.listState';

const getInitialState = (projectId: number | null): TenantListState => {
  if (!projectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      buildingId: 0,
      buildingName: "",
      tenantId: 0,
      tenantName: "",
      applicantName: "",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: TenantListState };
      // Only use stored state if it's for the same project
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          // Ensure tenantId and tenantName are reset when on list page
          tenantId: parsed.state.tenantId || 0,
          tenantName: parsed.state.tenantName || "",
          applicantName: parsed.state.applicantName || "",
        };
      }
    }
  } catch (error) {
    console.error('Error loading tenant list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    buildingId: 0,
    buildingName: "",
    tenantId: 0,
    tenantName: "",
    applicantName: "",
  };
};

type TenantListStateContextType = {
  listState: TenantListState;
  updateListState: (updates: Partial<TenantListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setTenantContext: (tenantId: number, tenantName: string) => void;
  clearTenantContext: () => void;
  setBuildingContext: (buildingId: number, buildingName: string) => void;
  clearBuildingContext: () => void;
};

const TenantListStateContext = createContext<TenantListStateContextType | null>(null);

export const TenantListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<TenantListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  // Reset state when project changes
  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      // Project changed - reset to default state (including building)
      const defaultState: TenantListState = {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        buildingId: 0,
        buildingName: "",
        tenantId: 0,
        tenantName: "",
        applicantName: "",
      };
      setListState(defaultState);
      // Clear stored state for old project
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing tenant list state:', error);
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
        console.error('Error saving tenant list state:', error);
      }
    }
  }, [listState, projectId]);

  // Update list state (partial updates)
  const updateListState = useCallback((updates: Partial<TenantListState>) => {
    setListState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset filters only (keeps page, pageSize, buildingId, etc.)
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
    const defaultState: TenantListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      buildingId: 0,
      buildingName: "",
      tenantId: 0,
      tenantName: "",
      applicantName: "",
    };
    setListState(defaultState);
  }, []);

  // Set tenant context (for view/document pages)
  const setTenantContext = useCallback((tenantId: number, tenantName: string) => {
    setListState((prev) => ({
      ...prev,
      tenantId,
      tenantName,
    }));
  }, []);

  // Clear tenant context (when leaving view pages)
  const clearTenantContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      tenantId: 0,
      tenantName: "",
    }));
  }, []);

  // Set building context (when building dropdown changes)
  const setBuildingContext = useCallback((buildingId: number, buildingName: string) => {
    setListState((prev) => ({
      ...prev,
      buildingId,
      buildingName,
      // Reset filters, search, and page when building changes
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  // Clear building context (when project changes - handled by reset)
  const clearBuildingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      buildingId: 0,
      buildingName: "",
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1,
    }));
  }, []);

  const contextValue = useMemo<TenantListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setTenantContext,
      clearTenantContext,
      setBuildingContext,
      clearBuildingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setTenantContext, clearTenantContext, setBuildingContext, clearBuildingContext]
  );

  return (
    <TenantListStateContext.Provider value={contextValue}>
      {children}
    </TenantListStateContext.Provider>
  );
};

export const useTenantListState = () => {
  const ctx = useContext(TenantListStateContext);
  if (!ctx) {
    throw new Error("useTenantListState must be used inside TenantListStateProvider");
  }
  return ctx;
};

