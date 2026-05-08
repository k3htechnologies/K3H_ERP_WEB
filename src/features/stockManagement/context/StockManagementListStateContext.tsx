import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type StockManagementListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  projectId: number | null;
  SubMaterialMasterId: number;
  MaterialName: string;
  SubMaterialName: string,
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.STOCK_MANAGEMENT;

const getInitialState = (currentProjectId: number | null): StockManagementListState => {
  if (!currentProjectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      projectId: currentProjectId,
      SubMaterialMasterId: 0,
      MaterialName: '',
      SubMaterialName: '',
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: StockManagementListState };
      if (parsed.projectId === currentProjectId) {
        return {
          ...parsed.state,
          SubMaterialMasterId: parsed.state.SubMaterialMasterId || 0,
          MaterialName: parsed.state.MaterialName || "",
          SubMaterialName: parsed.state.SubMaterialName || "",
          projectId: currentProjectId,
        };
      }
    }
  } catch (error) {
    console.error('Error loading Stock Management list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    projectId: currentProjectId,
    SubMaterialMasterId: 0,
    MaterialName: '',
    SubMaterialName: '',
  };
};

type Ctx = {
  listState: StockManagementListState;
  updateListState: (newState: Partial<StockManagementListState>) => void;
  resetFilters: () => void;
  clearStockManagementContext: () => void;
};

const StockManagementListStateContext = createContext<Ctx | null>(null);

export const StockManagementListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId: currentProjectId } = useProject();
  const [listState, setListState] = useState<StockManagementListState>(() => getInitialState(currentProjectId));

  useEffect(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  useEffect(() => {
    if (listState.projectId === currentProjectId && currentProjectId) {
      try {
        const stateToStore = {
          projectId: currentProjectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving Stock Management list state:', error);
      }
    }
  }, [listState, currentProjectId]);

  const updateListState = useCallback((newState: Partial<StockManagementListState>) => {
    setListState(prev => {
      const updated = { ...prev, ...newState };
      if (updated.projectId !== currentProjectId) {
        updated.projectId = currentProjectId;
      }
      return updated;
    });
  }, [currentProjectId]);

  const resetFilters = useCallback(() => {
    updateListState({
      page: 1,
      searchTerm: '',
      filters: {},
      sortInfo: undefined,
      SubMaterialMasterId: 0,
      MaterialName: '',
      SubMaterialName: '',
    });
  }, [updateListState]);

  const clearStockManagementContext = useCallback(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    clearStockManagementContext
  }), [listState, updateListState, resetFilters, clearStockManagementContext]);

  return (
    <StockManagementListStateContext.Provider value={contextValue}>
      {children}
    </StockManagementListStateContext.Provider>
  );
};

export const useStockManagementListState = () => {
  const ctx = useContext(StockManagementListStateContext);
  if (!ctx) throw new Error("use StockManagement ListState must be used inside StockManagement ListState Provider");
  return ctx;
};



