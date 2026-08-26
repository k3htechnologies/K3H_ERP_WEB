import { LOCAL_STORAGE_FOR_STATE_KEYS } from "@/core/constants";
import type { FilterInfo, SortInfo } from "@/ui/components/DataTable/DataTable";
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";

export type ProjectProfessionalDetailsListState = {
    page: number;
    pageSize: number;
    searchTerm: string;
    filters: FilterInfo;
    sortInfo: SortInfo | undefined;
    projectId: number;
    ProjectProfessionalDetailsId?: number;
    CompanyName: string;
};

const STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.PROJECT_PROFESSIONAL_DETAILS;

const getInitialState = (): ProjectProfessionalDetailsListState => {

    try {

        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as ProjectProfessionalDetailsListState;

            return {
                ...parsed,
                ProjectProfessionalDetailsId: parsed.ProjectProfessionalDetailsId || 0,
                CompanyName: parsed.CompanyName || "",
                projectId: parsed.projectId || 0
            };

        }
    } catch (error) {

        console.error('Error loading Project Professional Details List State:', error);
    }
    return {
        page: 1,
        pageSize: 20,
        searchTerm: "",
        filters: {},
        sortInfo: undefined,
        projectId: 0,
        ProjectProfessionalDetailsId: 0,
        CompanyName: ""
    };
};

type Ctx = {
    listState: ProjectProfessionalDetailsListState;
    updateListState: (newState: Partial<ProjectProfessionalDetailsListState>) => void;
    resetFilters: () => void;
    resetToDefault: () => void;
    clearProjectProfessionalDetailsContext: () => void;
};

const ProjectProfessionalDetailsListStateContext = createContext<Ctx | null>(null);

export const ProjectProfessionalDetailsListStateProvider = ({ children }: { children: ReactNode }) => {

    const [listState, setListState] = useState<ProjectProfessionalDetailsListState>(() => getInitialState());

    useEffect(() => {

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listState));
        } catch (error) {
            console.error('Error saving Project Professional Details list state:', error);
        }
    }, [listState]);

    const updateListState = useCallback((updates: Partial<ProjectProfessionalDetailsListState>) => {
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
        const defaultState: ProjectProfessionalDetailsListState = {
            page: 1,
            pageSize: 20,
            searchTerm: "",
            filters: {},
            sortInfo: undefined,
            ProjectProfessionalDetailsId: 0,
            CompanyName: "",
            projectId: 0,
        };
        setListState(defaultState);
    }, []);

    const clearProjectProfessionalDetailsContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            ProjectProfessionalDetailsId: 0,
            projectId: 0,
            CompanyName: "",
        }));
    }, []);

    const contextValue = useMemo(() => ({
        listState,
        updateListState,
        resetFilters,
        resetToDefault,
        clearProjectProfessionalDetailsContext
    }), [listState, updateListState, resetFilters, resetToDefault, clearProjectProfessionalDetailsContext]);

    return (
        <ProjectProfessionalDetailsListStateContext.Provider value={contextValue}> {children} </ProjectProfessionalDetailsListStateContext.Provider>
    );
};

export const useProjectProfessionalDetailsListState = () => {
    const ctx = useContext(ProjectProfessionalDetailsListStateContext);
    if (!ctx) throw new Error("use ProjectProfessionalDetails ListState must be used inside ProjectProfessionalDetails ListState Provider");
    return ctx;
};



