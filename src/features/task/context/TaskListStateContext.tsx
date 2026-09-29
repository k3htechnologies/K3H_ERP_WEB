import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { LOCAL_STORAGE_FOR_STATE_KEYS } from '@/core/constants'
import type { FilterInfo, SortInfo } from '@/ui/components/DataTable/DataTable'

export type TaskListState = {
    page: number
    pageSize: number
    searchTerm: string
    filters: FilterInfo
    sortInfo: SortInfo | undefined
    taskId: number
    taskTitle: string
}

const TASK_STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.TASK
const AGENDA_TASK_STORAGE_KEY = LOCAL_STORAGE_FOR_STATE_KEYS.AGENDA_TASK

const getDefaultState = (): TaskListState => ({
    page: 1,
    pageSize: 20,
    searchTerm: '',
    filters: {},
    sortInfo: undefined,
    taskId: 0,
    taskTitle: '',
})

const getInitialState = (storageKey: string): TaskListState => {
    try {
        const stored = localStorage.getItem(storageKey)

        if (stored) {
            const parsed = JSON.parse(stored) as TaskListState

            return {
                ...getDefaultState(),
                ...parsed,
                filters: parsed.filters ?? {},
                sortInfo: parsed.sortInfo ?? undefined,
                taskId: parsed.taskId || 0,
                taskTitle: parsed.taskTitle || '',
            }
        }
    } catch (error) {
        console.error('Error loading task list state:', error)
    }

    return getDefaultState()
}

type TaskListStateContextType = {
    listState: TaskListState
    updateListState: (updates: Partial<TaskListState>) => void
    resetFilters: () => void
    resetToDefault: () => void
    setTaskContext: (taskId: number, taskTitle: string) => void
    clearTaskContext: () => void

    agendaTaskListState: TaskListState
    updateAgendaTaskListState: (updates: Partial<TaskListState>) => void
    resetAgendaTaskFilters: () => void
    setAgendaTaskContext: (taskId: number, taskTitle: string) => void
    clearAgendaTaskContext: () => void
}

const TaskListStateContext = createContext<TaskListStateContextType | null>(null)

export const TaskListStateProvider = ({ children }: { children: ReactNode }) => {
    const [listState, setListState] = useState<TaskListState>(() =>
        getInitialState(TASK_STORAGE_KEY),
    )
    const [agendaTaskListState, setAgendaTaskListState] = useState<TaskListState>(() =>
        getInitialState(AGENDA_TASK_STORAGE_KEY),
    )

    useEffect(() => {
        try {
            localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(listState))
        } catch (error) {
            console.error('Error saving task list state:', error)
        }
    }, [listState])

    useEffect(() => {
        try {
            localStorage.setItem(AGENDA_TASK_STORAGE_KEY, JSON.stringify(agendaTaskListState))
        } catch (error) {
            console.error('Error saving agenda task list state:', error)
        }
    }, [agendaTaskListState])

    const updateListState = useCallback((updates: Partial<TaskListState>) => {
        setListState((prev) => ({ ...prev, ...updates }))
    }, [])

    const updateAgendaTaskListState = useCallback((updates: Partial<TaskListState>) => {
        setAgendaTaskListState((prev) => ({ ...prev, ...updates }))
    }, [])

    const resetFilters = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            filters: {},
            searchTerm: '',
            sortInfo: undefined,
            page: 1,
        }))
    }, [])

    const resetAgendaTaskFilters = useCallback(() => {
        setAgendaTaskListState((prev) => ({
            ...prev,
            filters: {},
            searchTerm: '',
            sortInfo: undefined,
            page: 1,
        }))
    }, [])

    const resetToDefault = useCallback(() => {
        setListState(getDefaultState())
        setAgendaTaskListState(getDefaultState())
    }, [])

    const setTaskContext = useCallback((taskId: number, taskTitle: string) => {
        setListState((prev) => ({
            ...prev,
            taskId,
            taskTitle,
        }))
    }, [])

    const setAgendaTaskContext = useCallback((taskId: number, taskTitle: string) => {
        setAgendaTaskListState((prev) => ({
            ...prev,
            taskId,
            taskTitle,
        }))
    }, [])

    const clearTaskContext = useCallback(() => {
        setListState((prev) => ({
            ...prev,
            taskId: 0,
            taskTitle: '',
        }))
    }, [])

    const clearAgendaTaskContext = useCallback(() => {
        setAgendaTaskListState((prev) => ({
            ...prev,
            taskId: 0,
            taskTitle: '',
        }))
    }, [])

    const contextValue = useMemo<TaskListStateContextType>(
        () => ({
            listState,
            updateListState,
            resetFilters,
            resetToDefault,
            setTaskContext,
            clearTaskContext,
            agendaTaskListState,
            updateAgendaTaskListState,
            resetAgendaTaskFilters,
            setAgendaTaskContext,
            clearAgendaTaskContext,
        }),
        [
            listState,
            updateListState,
            resetFilters,
            resetToDefault,
            setTaskContext,
            clearTaskContext,
            agendaTaskListState,
            updateAgendaTaskListState,
            resetAgendaTaskFilters,
            setAgendaTaskContext,
            clearAgendaTaskContext,
        ],
    )

    return (
        <TaskListStateContext.Provider value={contextValue}>
            {children}
        </TaskListStateContext.Provider>
    )
}

export const useTaskListState = () => {
    const ctx = useContext(TaskListStateContext)

    if (!ctx) {
        throw new Error('useTaskListState must be used inside TaskListStateProvider')
    }

    return ctx
}
