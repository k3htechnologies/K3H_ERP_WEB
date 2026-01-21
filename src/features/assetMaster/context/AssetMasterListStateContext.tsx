import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type AssetMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  assetMasterId: number;
  assetName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.ASSET_MASTER;

const getInitialState = (): AssetMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as AssetMasterListState;
      return {
        ...parsed,
        assetMasterId: parsed.assetMasterId || 0,
        assetName: parsed.assetName || "",
      };
    }
  } catch (error) {
    console.error('Error loading asset master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    assetMasterId: 0,
    assetName: "",
    pageName: "",
  };
};

type AssetMasterListStateContextType = {
  listState: AssetMasterListState;
  updateListState: (updates: Partial<AssetMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setAssetContext: (assetMasterId: number, assetName: string) => void;
  clearAssetContext: () => void;
};

const AssetMasterListStateContext = createContext<AssetMasterListStateContextType | null>(null);

export const AssetMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<AssetMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving asset master list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<AssetMasterListState>) => {
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
    const defaultState: AssetMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      assetMasterId: 0,
      assetName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setAssetContext = useCallback((assetMasterId: number, assetName: string) => {
    setListState((prev) => ({
      ...prev,
      assetMasterId,
      assetName,
    }));
  }, []);

  
  const clearAssetContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      assetMasterId: 0,
      assetName: "",
    }));
  }, []);

  const contextValue = useMemo<AssetMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setAssetContext,
      clearAssetContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setAssetContext, clearAssetContext]
  );

  return (
    <AssetMasterListStateContext.Provider value={contextValue}>
      {children}
    </AssetMasterListStateContext.Provider>
  );
};

export const useAssetMasterListState = () => {
  const ctx = useContext(AssetMasterListStateContext);
  if (!ctx) {
    throw new Error("useAssetMasterListState must be used inside AssetMasterListStateProvider");
  }
  return ctx;
};

