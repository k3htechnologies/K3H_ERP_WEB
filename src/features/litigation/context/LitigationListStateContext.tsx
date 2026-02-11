import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type LitigationListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  projectId: number | null;
  LitigationId: number;
  Title: string;
  
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.LITIGATION;

const getInitialState = (currentProjectId: number | null): LitigationListState => {
  if (!currentProjectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      projectId: currentProjectId,
      LitigationId: 0,
      Title: '',
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: LitigationListState };
      if (parsed.projectId === currentProjectId) {
        return {
          ...parsed.state,
          LitigationId: parsed.state.LitigationId || 0,
          Title: parsed.state.Title || "",
          projectId: currentProjectId,
        };
      }
    }
  } catch (error) {
    console.error('Error loading Litigation list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    projectId: currentProjectId,
    LitigationId: 0,
    Title: '',
  };
};

type Ctx = {
  listState: LitigationListState;
  updateListState: (newState: Partial<LitigationListState>) => void;
  resetFilters: () => void;
  clearLitigationContext: () => void;
};

const LitigationListStateContext = createContext<Ctx | null>(null);

export const LitigationListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId: currentProjectId } = useProject();
  const [listState, setListState] = useState<LitigationListState>(() => getInitialState(currentProjectId));

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
        console.error('Error saving Litigation list state:', error);
      }
    }
  }, [listState, currentProjectId]);

  const updateListState = useCallback((newState: Partial<LitigationListState>) => {
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
      LitigationId: 0,
      Title: ''
    });
  }, [updateListState]);

  const clearLitigationContext = useCallback(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    clearLitigationContext
  }), [listState, updateListState, resetFilters, clearLitigationContext]);

  return (
    <LitigationListStateContext.Provider value={contextValue}>
      {children}
    </LitigationListStateContext.Provider>
  );
};

export const useLitigationListState = () => {
  const ctx = useContext(LitigationListStateContext);
  if (!ctx) throw new Error("use Litigation ListState must be used inside Litigation ListState Provider");
  return ctx;
};



