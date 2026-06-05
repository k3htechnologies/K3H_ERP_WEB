import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ChannelPartnerUniverseListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  channelPartnerId: number;
  channelPartnerName: string;
  channelPartnerMobileNumber: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.CHANNEL_PARTNER_UNIVERSE;

const getInitialState = (): ChannelPartnerUniverseListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as ChannelPartnerUniverseListState;
      return {
        ...parsed,
        page: parsed.page || 1,
        pageSize: parsed.pageSize || 20,
        searchTerm: parsed.searchTerm || "",
        filters: parsed.filters || {},
        sortInfo: parsed.sortInfo,
        channelPartnerId: parsed.channelPartnerId || 0,
        channelPartnerName: parsed.channelPartnerName || "",
        channelPartnerMobileNumber: parsed.channelPartnerMobileNumber || ""
      };
    }
  } catch (error) {
    console.error("Error loading channel partner universe list state:", error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    channelPartnerId: 0,
    channelPartnerName: "",
    channelPartnerMobileNumber: ""
  };
};

type ChannelPartnerUniverseListStateContextType = {
  listState: ChannelPartnerUniverseListState;
  updateListState: (updates: Partial<ChannelPartnerUniverseListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
};

const ChannelPartnerUniverseListStateContext =
  createContext<ChannelPartnerUniverseListStateContextType | null>(null);

export const ChannelPartnerUniverseListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<ChannelPartnerUniverseListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error("Error saving channel partner universe list state:", error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<ChannelPartnerUniverseListState>) => {
    setListState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setListState(prev => ({
      ...prev,
      filters: {},
      searchTerm: "",
      sortInfo: undefined,
      page: 1
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultState: ChannelPartnerUniverseListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      channelPartnerId: 0,
      channelPartnerName: "",
      channelPartnerMobileNumber: ""
    };
    setListState(defaultState);
  }, []);

  const contextValue = useMemo<ChannelPartnerUniverseListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault
    }),
    [listState, updateListState, resetFilters, resetToDefault]
  );

  return (
    <ChannelPartnerUniverseListStateContext.Provider value={contextValue}>
      {children}
    </ChannelPartnerUniverseListStateContext.Provider>
  );
};

export const useChannelPartnerUniverseListState = () => {
  const ctx = useContext(ChannelPartnerUniverseListStateContext);
  if (!ctx) {
    throw new Error(
      "useChannelPartnerUniverseListState must be used inside ChannelPartnerUniverseListStateProvider"
    );
  }
  return ctx;
};


