import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type TaxTrackerListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    TaxTrackerId: number;
    CompanyId: number | 0;
    CompanyName: string;
    FinancialYear: string;
    NoticeSection: string;
    NoticeType: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.TAX_TRACKER;

const getInitialState = (): TaxTrackerListState => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as TaxTrackerListState;

            return {
                ...parsed,
                TaxTrackerId: parsed.TaxTrackerId || 0,
                CompanyId: parsed.CompanyId || 0,
                CompanyName: parsed.CompanyName || "",
                FinancialYear: parsed.FinancialYear || "",
                NoticeSection: parsed.NoticeSection || "",
                NoticeType: parsed.NoticeType || "",
            };
        }
    } catch (error) {
        console.error('Error loading Tax Tracker list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        TaxTrackerId: 0,
        CompanyId: 0,
        CompanyName: '',
        FinancialYear: '',
        NoticeSection: '',
        NoticeType: '',
    };
};

type Ctx = {
    listState: TaxTrackerListState;
    updateListState: (newState: Partial<TaxTrackerListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    clearTaxTrackerContext: () => void;
};

const TaxTrackerListStateContext = createContext<Ctx | null>(null);

export const TaxTrackerListStateProvider = ({ children }: { children: ReactNode }) => {
    const [listState, setListState] = useState<TaxTrackerListState>(() => getInitialState());

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Tax Tracker list state:', error);
        }
    }, [listState]);

    const updateListState = useCallback((updates: Partial<TaxTrackerListState>) => {
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
        const defaultState: TaxTrackerListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            TaxTrackerId: 0,
            CompanyId: 0,
            CompanyName: '',
            FinancialYear: '',
            NoticeSection: '',
            NoticeType: '',
        };
        setListState(defaultState);
    }, []);

    const clearTaxTrackerContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            TaxTrackerId: 0,
            CompanyId: 0,
            CompanyName: '',
            FinancialYear: '',
            NoticeSection: '',
        }));
    }, []);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearTaxTrackerContext
    }), [listState, updateListState, resetFilters, resetToDefault, clearTaxTrackerContext]);

    return (
        <TaxTrackerListStateContext.Provider value={contextValue}>
            {children}
        </TaxTrackerListStateContext.Provider>
    );
};

export const useTaxTrackerListState = () => {
    const ctx = useContext(TaxTrackerListStateContext);
    if (!ctx) throw new Error("useTaxTrackerListState must be used inside TaxTrackerListStateProvider");
    return ctx;
};