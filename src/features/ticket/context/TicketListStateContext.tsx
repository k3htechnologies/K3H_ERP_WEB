import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type TicketListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  TicketId: number;
  SystemGeneratedCode: string;
  Platform: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.TICKET;

const getInitialState = (): TicketListState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { state: TicketListState };
      if (parsed && parsed.state) {
        return {
          ...parsed.state,
          TicketId: parsed.state.TicketId || 0,
          SystemGeneratedCode: parsed.state.SystemGeneratedCode || "",
          Platform: parsed.state.Platform || "",
        };
      }
    }
  } catch (error) {
    console.error('Error loading Ticket list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    TicketId: 0,
    SystemGeneratedCode: '',
    Platform: ''
  };
};

type Ctx = {
  listState: TicketListState;
  updateListState: (newState: Partial<TicketListState>) => void;
  resetFilters: () => void;
  clearTicketContext: () => void;
};

const TicketListStateContext = createContext<Ctx | null>(null);

export const TicketListStateProvider = ({ children }: { children: ReactNode }) => {
  const [listState, setListState] = useState<TicketListState>(getInitialState);

  useEffect(() => {
    try {
      const stateToStore = {
        state: listState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
    } catch (error) {
      console.error('Error saving Ticket list state:', error);
    }
  }, [listState]);

  const updateListState = useCallback((newState: Partial<TicketListState>) => {
    setListState(prev => ({ ...prev, ...newState }));
  }, []);

  const resetFilters = useCallback(() => {
    updateListState({
      page: 1,
      searchTerm: '',
      filters: {},
      sortInfo: undefined,
      TicketId: 0,
      SystemGeneratedCode: '',
      Platform: ''
    });
  }, [updateListState]);

  const clearTicketContext = useCallback(() => {
    setListState(getInitialState());
  }, []);

  const contextValue = useMemo(() => ({
    listState,
    updateListState,
    resetFilters,
    clearTicketContext
  }), [listState, updateListState, resetFilters, clearTicketContext]);

  return (
    <TicketListStateContext.Provider value={contextValue}>
      {children}
    </TicketListStateContext.Provider>
  );
};

export const useTicketListState = () => {
  const ctx = useContext(TicketListStateContext);
  if (!ctx) throw new Error("useTicketListState must be used inside TicketListStateProvider");
  return ctx;
};
