import { useState } from 'react';

export interface PaginationState {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export const usePagination = (initialPageSize: number = 20) => {
    
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        pageSize: initialPageSize,
        totalRecords: 0,
        totalPages: 0,
    });

    const updatePagination = (updates: Partial<PaginationState>) => {
        setPagination((prev) => ({ ...prev, ...updates }));
    };

    const resetPagination = () => {
        setPagination({
            currentPage: 1,
            pageSize: initialPageSize,
            totalRecords: 0,
            totalPages: 0,
        });
    };

    return { pagination, setPagination: updatePagination, resetPagination };
};

export default usePagination;