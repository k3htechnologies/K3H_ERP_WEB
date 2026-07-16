import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type LitigationListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  projectId: number;
  LitigationId: number;
  Title: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.LITIGATION;

const getInitialState = (): LitigationListState => {

  try {

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {

      const parsed = JSON.parse(stored) as LitigationListState;

      return {
        ...parsed,
        LitigationId: parsed.LitigationId || 0,
        Title: parsed.Title || "",
        projectId: parsed.projectId || 0

      };
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
    projectId: 0,
    LitigationId: 0,
    Title: '',
  };
};


type Ctx = {
  listState: LitigationListState;
  updateListState: (newState: Partial<LitigationListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  clearLitigationContext: () => void;
};

const LitigationListStateContext = createContext<Ctx | null>(null);

export const LitigationListStateProvider = ({ children }: { children: ReactNode }) => {

  const [listState, setListState] = useState<LitigationListState>(() => getInitialState());

  useEffect(() => {

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving Litigation  list state:', error);
    }

  }, [listState]);

  const updateListState = useCallback((updates: Partial<LitigationListState>) => {
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
    const defaultState: LitigationListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      LitigationId: 0,
      Title: "",
      projectId: 0,
    };
    setListState(defaultState);
  }, []);

  const clearLitigationContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      LitigationId: 0,
      projectId: 0,
      Title: "",
    }));
  }, []);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    resetToDefault,
    clearLitigationContext
  }), [listState, updateListState, resetFilters, resetToDefault, clearLitigationContext]);

  return (
    <LitigationListStateContext.Provider value={contextValue}> {children} </LitigationListStateContext.Provider>
  );
};

export const useLitigationListState = () => {
  const ctx = useContext(LitigationListStateContext);
  if (!ctx) throw new Error("use Litigation ListState must be used inside Litigation ListState Provider");
  return ctx;
};



