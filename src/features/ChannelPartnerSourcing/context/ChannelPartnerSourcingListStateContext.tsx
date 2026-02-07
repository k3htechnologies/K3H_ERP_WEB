import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type ChannelPartnerSourcingListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  channelPartnerId: number;
  channelPartnerName: string;
  channelPartnerMobileNumber: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.CHANNEL_PARTNER_SOURCING;

const getInitialState = (): ChannelPartnerSourcingListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as ChannelPartnerSourcingListState;
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
    console.error("Error loading channel partner sourcing list state:", error);
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

type ChannelPartnerSourcingListStateContextType = {
  listState: ChannelPartnerSourcingListState;
  updateListState: (updates: Partial<ChannelPartnerSourcingListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
};

const ChannelPartnerSourcingListStateContext =
  createContext<ChannelPartnerSourcingListStateContextType | null>(null);

export const ChannelPartnerSourcingListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<ChannelPartnerSourcingListState>(() => getInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
    } catch (error) {
      console.error("Error saving channel partner sourcing list state:", error);
    }
  }, [listState]);

  const updateListState = useCallback((updates: Partial<ChannelPartnerSourcingListState>) => {
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
    const defaultState: ChannelPartnerSourcingListState = {
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

  const contextValue = useMemo<ChannelPartnerSourcingListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault
    }),
    [listState, updateListState, resetFilters, resetToDefault]
  );

  return (
    <ChannelPartnerSourcingListStateContext.Provider value={contextValue}>
      {children}
    </ChannelPartnerSourcingListStateContext.Provider>
  );
};

export const useChannelPartnerSourcingListState = () => {
  const ctx = useContext(ChannelPartnerSourcingListStateContext);
  if (!ctx) {
    throw new Error(
      "useChannelPartnerSourcingListState must be used inside ChannelPartnerSourcingListStateProvider"
    );
  }
  return ctx;
};


