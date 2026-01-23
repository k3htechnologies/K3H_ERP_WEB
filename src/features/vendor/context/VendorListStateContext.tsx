import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type VendorListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  vendorId: number;
  vendorName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.VENDOR;

const getInitialState = (): VendorListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as VendorListState;
      return {
        ...parsed,
        vendorId: parsed.vendorId || 0,
        vendorName: parsed.vendorName || "",
      };
    }
  } catch (error) {
    console.error('Error loading vendor list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    vendorId: 0,
    vendorName: "",
    pageName: "",
  };
};

type VendorListStateContextType = {
  listState: VendorListState;
  updateListState: (updates: Partial<VendorListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setVendorContext: (vendorId: number, vendorName: string) => void;
  clearVendorContext: () => void;
};

const VendorListStateContext = createContext<VendorListStateContextType | null>(null);

export const VendorListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<VendorListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving vendor list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<VendorListState>) => {
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
    const defaultState: VendorListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      vendorId: 0,
      vendorName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setVendorContext = useCallback((vendorId: number, vendorName: string) => {
    setListState((prev) => ({
      ...prev,
      vendorId,
      vendorName,
    }));
  }, []);

  
  const clearVendorContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      vendorId: 0,
      vendorName: "",
    }));
  }, []);

  const contextValue = useMemo<VendorListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setVendorContext,
      clearVendorContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setVendorContext, clearVendorContext]
  );

  return (
    <VendorListStateContext.Provider value={contextValue}>
      {children}
    </VendorListStateContext.Provider>
  );
};

export const useVendorListState = () => {
  const ctx = useContext(VendorListStateContext);
  if (!ctx) {
    throw new Error("useVendorListState must be used inside VendorListStateProvider");
  }
  return ctx;
};

