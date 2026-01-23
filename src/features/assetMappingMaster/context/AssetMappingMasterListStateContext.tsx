import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type AssetMappingMasterListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  assetMappingMasterId: number;
  assetMappingName: string;
  pageName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.ASSET_MAPPING_MASTER;

const getInitialState = (): AssetMappingMasterListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as AssetMappingMasterListState;
      return {
        ...parsed,
        assetMappingMasterId: parsed.assetMappingMasterId || 0,
        assetMappingName: parsed.assetMappingName || "",
      };
    }
  } catch (error) {
    console.error('Error loading asset mapping master list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    assetMappingMasterId: 0,
    assetMappingName: "",
    pageName: "",
  };
};

type AssetMappingMasterListStateContextType = {
  listState: AssetMappingMasterListState;
  updateListState: (updates: Partial<AssetMappingMasterListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setAssetMappingContext: (assetMappingMasterId: number, assetMappingName: string) => void;
  clearAssetMappingContext: () => void;
};

const AssetMappingMasterListStateContext = createContext<AssetMappingMasterListStateContextType | null>(null);

export const AssetMappingMasterListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<AssetMappingMasterListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving asset mapping master list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<AssetMappingMasterListState>) => {
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
    const defaultState: AssetMappingMasterListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      assetMappingMasterId: 0,
      assetMappingName: "",
      pageName: "",
    };
    setListState(defaultState);
  }, []);


  const setAssetMappingContext = useCallback((assetMappingMasterId: number, assetMappingName: string) => {
    setListState((prev) => ({
      ...prev,
      assetMappingMasterId,
      assetMappingName,
    }));
  }, []);

  
  const clearAssetMappingContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      assetMappingMasterId: 0,
      assetMappingName: "",
    }));
  }, []);

  const contextValue = useMemo<AssetMappingMasterListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setAssetMappingContext,
      clearAssetMappingContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setAssetMappingContext, clearAssetMappingContext]
  );

  return (
    <AssetMappingMasterListStateContext.Provider value={contextValue}>
      {children}
    </AssetMappingMasterListStateContext.Provider>
  );
};

export const useAssetMappingMasterListState = () => {
  const ctx = useContext(AssetMappingMasterListStateContext);
  if (!ctx) {
    throw new Error("useAssetMappingMasterListState must be used inside AssetMappingMasterListStateProvider");
  }
  return ctx;
};

