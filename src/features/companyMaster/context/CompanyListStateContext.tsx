import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type CompanyListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  companyId: number;
  companyName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.COMPANY;

const getInitialState = (): CompanyListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as CompanyListState;
      return {
        ...parsed,
        companyId: parsed.companyId || 0,
        companyName: parsed.companyName || "",
      };
    }
  } catch (error) {
    console.error('Error loading company list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    companyId: 0,
    companyName: "",
    pageName: "",
  };
};

type CompanyListStateContextType = {
  listState: CompanyListState;
  updateListState: (updates: Partial<CompanyListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setCompanyContext: (companyId: number, companyName: string) => void;
  clearCompanyContext: () => void;
};

const CompanyListStateContext = createContext<CompanyListStateContextType | null>(null);

export const CompanyListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<CompanyListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving company list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<CompanyListState>) => {
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
    const defaultState: CompanyListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      companyId: 0,
      companyName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setCompanyContext = useCallback((companyId: number, companyName: string) => {
    setListState((prev) => ({
      ...prev,
      companyId,
      companyName,
    }));
  }, []);

  
  const clearCompanyContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      companyId: 0,
      companyName: "",
    }));
  }, []);

  const contextValue = useMemo<CompanyListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setCompanyContext,
      clearCompanyContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setCompanyContext, clearCompanyContext]
  );

  return (
    <CompanyListStateContext.Provider value={contextValue}>
      {children}
    </CompanyListStateContext.Provider>
  );
};

export const useCompanyListState = () => {
  const ctx = useContext(CompanyListStateContext);
  if (!ctx) {
    throw new Error("useCompanyListState must be used inside CompanyListStateProvider");
  }
  return ctx;
};

