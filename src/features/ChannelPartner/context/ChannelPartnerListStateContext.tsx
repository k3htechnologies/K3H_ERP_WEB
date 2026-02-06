import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ChannelPartnerListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  channelPartnerId: number;
  channelPartnerName: string;
  pageName: string;
  uniquekey: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.CHANNEL_PARTNER;

const getInitialState = (): ChannelPartnerListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const parsed = JSON.parse(stored) as ChannelPartnerListState;
      return {
        ...parsed,
        channelPartnerId: parsed.channelPartnerId || 0,
        channelPartnerName: parsed.channelPartnerName || "",
        uniquekey: parsed.uniquekey || "",
      };
    }
  } catch (error) {
    console.error('Error loading channel partner list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    channelPartnerId: 0,
    channelPartnerName: "",
    pageName: "",
    uniquekey: "",
  };
};

type ChannelPartnerListStateContextType = {
  listState: ChannelPartnerListState;
  updateListState: (updates: Partial<ChannelPartnerListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setChannelPartnerContext: (channelPartnerId: number, channelPartnerName: string, uniquekey: string) => void;
  clearChannelPartnerContext: () => void;
};

const ChannelPartnerListStateContext = createContext<ChannelPartnerListStateContextType | null>(null);

export const ChannelPartnerListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<ChannelPartnerListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error('Error saving channel partner list state:', error);
    }
  }, [listState]);

  
  const updateListState = useCallback((updates: Partial<ChannelPartnerListState>) => {
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
    const defaultState: ChannelPartnerListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      channelPartnerId: 0,
      channelPartnerName: "",
      pageName: "",
      uniquekey: "",
    };
    setListState(defaultState);
  }, []);


  const setChannelPartnerContext = useCallback((channelPartnerId: number, channelPartnerName: string, uniquekey: string) => {
    setListState((prev) => ({
      ...prev,
      channelPartnerId,
      channelPartnerName,
      uniquekey,
    }));
  }, []);

  
  const clearChannelPartnerContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      channelPartnerId: 0,
      channelPartnerName: "",
      uniquekey: "",
    }));
  }, []);

  const contextValue = useMemo<ChannelPartnerListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setChannelPartnerContext,
      clearChannelPartnerContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setChannelPartnerContext, clearChannelPartnerContext]
  );

  return (
    <ChannelPartnerListStateContext.Provider value={contextValue}>
      {children}
    </ChannelPartnerListStateContext.Provider>
  );
};

export const useChannelPartnerListState = () => {
  const ctx = useContext(ChannelPartnerListStateContext);
  if (!ctx) {
    throw new Error("useChannelPartnerListState must be used inside ChannelPartnerListStateProvider");
  }
  return ctx;
};

