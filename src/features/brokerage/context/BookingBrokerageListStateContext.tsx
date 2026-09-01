import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type BookingBrokerageListState = {
  page: number;
  pageSize: number;
  searchTerm: string;
  filters: FilterInfo;
  sortInfo: SortInfo | undefined;
  bookingId: number;
  bookingName: string;
  cpName: string;
  cpMobileNumber: string;
  cpCompany: string;
  agreementValue: number;
  brokerageAmount: number;
  invoiceAmount: number;
  paymentPaidAmount: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.BOOKING_Brokerage;

const getInitialState = (projectId: number | null): BookingBrokerageListState => {
  if (!projectId) {
    return {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      bookingId: 0,
      bookingName: "",
      cpName: "",
      cpMobileNumber: "",
      cpCompany: "",
      agreementValue: 0,
      brokerageAmount: 0,
      invoiceAmount: 0,
      paymentPaidAmount: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as { projectId: number; state: BookingBrokerageListState };
      if (parsed.projectId === projectId) {
        return {
          ...parsed.state,
          bookingId: parsed.state.bookingId || 0,
          bookingName: parsed.state.bookingName || "",
          cpName: parsed.state.cpName || "",
          cpMobileNumber: parsed.state.cpMobileNumber || "",
          cpCompany: parsed.state.cpCompany || "",
          agreementValue: parsed.state.agreementValue,
          brokerageAmount: parsed.state.brokerageAmount,
          invoiceAmount: parsed.state.invoiceAmount,
          paymentPaidAmount: parsed.state.paymentPaidAmount,

        };
      }
    }
  } catch (error) {
    console.error('Error loading booking brokerage list state:', error);
  }

  return {
    page: 1,
    pageSize: 20,
    searchTerm: "",
    filters: {},
    sortInfo: undefined,
    bookingId: 0,
    bookingName: "",
    cpName: "",
    cpMobileNumber: "",
    cpCompany: "",
    agreementValue: 0,
    brokerageAmount: 0,
    invoiceAmount: 0,
    paymentPaidAmount: 0,
  };
};

type BookingBrokerageListStateContextType = {
  listState: BookingBrokerageListState;
  updateListState: (updates: Partial<BookingBrokerageListState>) => void;
  resetFilters: () => void;
  resetToDefault: () => void;
  setBookingBrokerageContext: (bookingId: number, bookingName: string, cpName: string, cpMobileNumber: string, cpCompany: string, agreementValue: number, brokerageAmount: number, invoiceAmount: number, paymentPaidAmount: number) => void;
  clearBookingBrokerageContext: () => void;
};

const BookingBrokerageListStateContext = createContext<BookingBrokerageListStateContextType | null>(null);

export const BookingBrokerageListStateProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useProject();
  const [listState, setListState] = useState<BookingBrokerageListState>(() => getInitialState(projectId));
  const [lastProjectId, setLastProjectId] = useState<number | null>(projectId);

  useEffect(() => {
    if (projectId !== lastProjectId && lastProjectId !== null) {
      const defaultState: BookingBrokerageListState = {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        bookingId: 0,
        bookingName: "",
        cpName: "",
        cpMobileNumber: "",
        cpCompany: "",
        agreementValue: 0,
        brokerageAmount: 0,
        invoiceAmount: 0,
        paymentPaidAmount: 0
      };
      setListState(defaultState);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error clearing booking brokerage list state:', error);
      }
    }
    setLastProjectId(projectId);
  }, [projectId, lastProjectId]);

  useEffect(() => {
    if (projectId) {
      try {
        const stateToStore = {
          projectId,
          state: listState,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
      } catch (error) {
        console.error('Error saving booking list state:', error);
      }
    }
  }, [listState, projectId]);

  const updateListState = useCallback((updates: Partial<BookingBrokerageListState>) => {
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
    const defaultState: BookingBrokerageListState = {
      page: 1,
      pageSize: 20,
      searchTerm: "",
      filters: {},
      sortInfo: undefined,
      bookingId: 0,
      bookingName: "",
      cpName: "",
      cpMobileNumber: "",
      cpCompany: "",
      agreementValue: 0,
      brokerageAmount: 0,
      invoiceAmount: 0,
      paymentPaidAmount: 0,
    };
    setListState(defaultState);
  }, []);

  const setBookingBrokerageContext = useCallback((bookingId: number, bookingName: string, cpName: string, cpMobileNumber: string, cpCompany: string, agreementValue: number, brokerageAmount: number, invoiceAmount: number, paymentPaidAmount: number) => {
    setListState((prev) => ({
      ...prev,
      bookingId,
      bookingName,
      cpName,
      cpMobileNumber,
      cpCompany,
      agreementValue,
      brokerageAmount,
      invoiceAmount,
      paymentPaidAmount
    }));
  }, []);

  const clearBookingBrokerageContext = useCallback(() => {
    setListState((prev) => ({
      ...prev,
      bookingId: 0,
      bookingName: "",
      cpName: "",
      cpMobileNumber: "",
      cpCompany: "",
      agreementValue: 0,
      brokerageAmount: 0,
      invoiceAmount: 0,
      paymentPaidAmount: 0,
    }));
  }, []);

  const contextValue = useMemo<BookingBrokerageListStateContextType>(
    () => ({
      listState,
      updateListState,
      resetFilters,
      resetToDefault,
      setBookingBrokerageContext,
      clearBookingBrokerageContext,
    }),
    [listState, updateListState, resetFilters, resetToDefault, setBookingBrokerageContext, clearBookingBrokerageContext]
  );

  return (
    <BookingBrokerageListStateContext.Provider value={contextValue}>
      {children}
    </BookingBrokerageListStateContext.Provider>
  );
};

export const useBookingBrokerageListState = () => {
  const ctx = useContext(BookingBrokerageListStateContext);
  if (!ctx) {
    throw new Error("useBookingBrokerageListState must be used inside BookingBrokerageListStateProvider");
  }
  return ctx;
};

