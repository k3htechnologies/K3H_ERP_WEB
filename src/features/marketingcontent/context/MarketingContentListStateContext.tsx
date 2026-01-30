import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { SortInfo } from "@/ui/components/DataTable/DataTable";

export type MarketingContentListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortInfo: SortInfo | undefined;
  projectId: number | null;
  MarketingContentFolderId: number;
  MarketingContentFolderName: string;
};

const STORAGE_KEY = 'MarketingContent.listState';

const getInitialState = (currentProjectId: number | null): MarketingContentListState => {
  if (!currentProjectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      sortInfo: undefined,
      projectId: currentProjectId,
      MarketingContentFolderId: 0,
      MarketingContentFolderName: '',
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: MarketingContentListState };
      if (parsed.projectId === currentProjectId) {
        return {
          ...parsed.state,
          MarketingContentFolderId: parsed.state.MarketingContentFolderId || 0,
          MarketingContentFolderName: parsed.state.MarketingContentFolderName || "",
          projectId: currentProjectId,
        };
      }
    }
  } catch (error) {
    console.error('Error loading Marketing Content list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    sortInfo: undefined,
    projectId: currentProjectId,
    MarketingContentFolderId: 0,
    MarketingContentFolderName: '',
  };
};

type Ctx = {
  listState: MarketingContentListState;
  updateListState: (newState: Partial<MarketingContentListState>) => void;
  resetFilters: () => void;
  clearMarketingContentContext: () => void;
};

const MarketingContentListStateContext = createContext<Ctx | null>(null);

export const MarketingContentListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId: currentProjectId } = useProject();
  const [listState, setListState] = useState<MarketingContentListState>(() => getInitialState(currentProjectId));

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
        console.error('Error saving Marketing Content list state:', error);
      }
    }
  }, [listState, currentProjectId]);

  const updateListState = useCallback((newState: Partial<MarketingContentListState>) => {
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
      sortInfo: undefined,
      MarketingContentFolderId: 0,
      MarketingContentFolderName: ''
    });
  }, [updateListState]);

  const clearMarketingContentContext = useCallback(() => {
    setListState(getInitialState(currentProjectId));
  }, [currentProjectId]);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    clearMarketingContentContext
  }), [listState, updateListState, resetFilters, clearMarketingContentContext]);

  return (
    <MarketingContentListStateContext.Provider value={contextValue}>
      {children}
    </MarketingContentListStateContext.Provider>
  );
};

export const useMarketingContentListState = () => {
  const ctx = useContext(MarketingContentListStateContext);
  if (!ctx) throw new Error("use Marketing Content ListState must be used inside Marketing Content ListState Provider");
  return ctx;
};



