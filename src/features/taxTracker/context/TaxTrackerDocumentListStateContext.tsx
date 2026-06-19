import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type TaxTrackerDocumentListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    TaxTrackerId: number;
    TaxTrackerDocumentId: number;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.TAX_TRACKER_DOCUMENT;

const getInitialState = (): TaxTrackerDocumentListState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as TaxTrackerDocumentListState;

            return {
                ...parsed,
                TaxTrackerId: parsed.TaxTrackerId || 0,
                TaxTrackerDocumentId: parsed.TaxTrackerDocumentId || 0,
            };
        }
    } catch (error) {
        console.error('Error loading Tax Tracker Document list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        TaxTrackerId: 0,
        TaxTrackerDocumentId: 0,
    };
};

type Ctx = {
    listState: TaxTrackerDocumentListState;
    updateListState: (newState: Partial<TaxTrackerDocumentListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    clearTaxTrackerDocumentContext: () => void;
};

const TaxTrackerDocumentListStateContext = createContext<Ctx | null>(null);

export const TaxTrackerDocumentListStateProvider = ({ children }: { children: ReactNode }) => {
    const [listState, setListState] = useState<TaxTrackerDocumentListState>(() => getInitialState());

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Tax Tracker Document list state:', error);
        }
    }, [listState]);

    const updateListState = useCallback((updates: Partial<TaxTrackerDocumentListState>) => {
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
        const defaultState: TaxTrackerDocumentListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            TaxTrackerId: 0,
            TaxTrackerDocumentId: 0,
        };
        setListState(defaultState);
    }, []);

    const clearTaxTrackerDocumentContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            TaxTrackerId: 0,
            TaxTrackerDocumentId: 0,
        }));
    }, []);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearTaxTrackerDocumentContext
    }), [listState, updateListState, resetFilters, resetToDefault, clearTaxTrackerDocumentContext]);

    return (
        <TaxTrackerDocumentListStateContext.Provider value={contextValue}>
            {children}
        </TaxTrackerDocumentListStateContext.Provider>
    );
};

export const useTaxTrackerDocumentListState = () => {
    const ctx = useContext(TaxTrackerDocumentListStateContext);
    if (!ctx) throw new Error("useTaxTrackerDocumentListState must be used inside TaxTrackerDocumentListStateProvider");
    return ctx;
};