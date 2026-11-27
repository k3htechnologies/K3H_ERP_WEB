import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";

export type PreSaleEnquiryListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    projectId: number | null;
    PreSaleEnquiryId: number;
    Name: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PRE_SALE_ENQUIRY;

const getInitialState = (currentProjectId: number | null): PreSaleEnquiryListState => {
    if (!currentProjectId) {
        return {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            projectId: currentProjectId,
            PreSaleEnquiryId: 0,
            Name: '',
        };
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {

            const parsed = JSON.parse(stored) as { projectId: number; state: PreSaleEnquiryListState };

            if (parsed.projectId === currentProjectId) {
                return {
                    ...parsed.state,
                    PreSaleEnquiryId: parsed.state.PreSaleEnquiryId || 0,
                    Name: parsed.state.Name || "",
                    projectId: currentProjectId,
                };
            }
        }
    } catch (error) {
        console.error('Error loading Pre Sale Enquiry list state:', error);
    }

    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        projectId: currentProjectId,
        PreSaleEnquiryId: 0,
        Name: '',
    };
};

type Ctx = {
    listState: PreSaleEnquiryListState;
    updateListState: (newState: Partial<PreSaleEnquiryListState>) => void;
    resetFilters: () => void;
    clearPreSaleEnquiryContext: () => void;
};

const PreSaleEnquiryListStateContext = createContext<Ctx | null>(null);

export const PreSaleEnquiryListStateProvider = ({ children }: { children: ReactNode }) => {
    const { projectId: currentProjectId } = useProject();
    const [listState, setListState] = useState<PreSaleEnquiryListState>(() => getInitialState(currentProjectId));

    useEffect(() => {
        setListState(getInitialState(currentProjectId));
    }, [currentProjectId]);

    useEffect(() => {
        if (listState.projectId === currentProjectId && currentProjectId) {
            try {
                const stateToStore = {
                    projectId: currentProjectId,
                    state: listState,
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
            } catch (error) {
                console.error('Error saving Pre Sale Enquiry list state:', error);
            }
        }
    }, [listState, currentProjectId]);

    const updateListState = useCallback((newState: Partial<PreSaleEnquiryListState>) => {
        setListState(prev => {
            const updated = { ...prev, ...newState };
            if (updated.projectId !== currentProjectId) {
                updated.projectId = currentProjectId;
            }
            return updated;
        });
    }, [currentProjectId]);

    const resetFilters = useCallback(() => {
        updateListState({
            page: 1,
            searchTerm: '',
            filters: {},
            sortInfo: undefined,
            PreSaleEnquiryId: 0,
            Name: ''
        });
    }, [updateListState]);

    const clearPreSaleEnquiryContext = useCallback(() => {
        setListState(getInitialState(currentProjectId));
    }, [currentProjectId]);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        clearPreSaleEnquiryContext
    }), [listState, updateListState, resetFilters, clearPreSaleEnquiryContext]);

    return (
        <PreSaleEnquiryListStateContext.Provider value={contextValue}>
            {children}
        </PreSaleEnquiryListStateContext.Provider>
    );
};

export const usePreSaleEnquiryListState = () => {
    const ctx = useContext(PreSaleEnquiryListStateContext);
    if (!ctx) throw new Error("usePreSaleEnquiryListState must be used inside PreSaleEnquiryListStateProvider");
    return ctx;
};



