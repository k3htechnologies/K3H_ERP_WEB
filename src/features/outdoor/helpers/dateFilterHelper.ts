import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { updateFilter } from '@/core/utils/filterHelper';

interface DateFilterUpdates {
  StartDate?: string | null;
  EndDate?: string | null;
}

interface UpdateListStateParams {
  filters: FilterInfo;
  page?: number;
}

/**
 * Helper function to update filters with date values using the existing updateFilter utility
 * @param contextFilters - Current filter state
 * @param updates - Date updates to apply
 * @param updateListState - Function to update list state
 * @param setTempFilters - Function to set temporary filters
 * @param shouldLoad - Whether to trigger a page load (default: true)
 */
export const updateFiltersWithDates = (
  contextFilters: FilterInfo,
  updates: DateFilterUpdates,
  updateListState: (params: UpdateListStateParams) => void,
  setTempFilters: (filters: FilterInfo) => void,
  shouldLoad = true
): void => {
  // Use existing updateFilter utility for each date field
  let newFilters = { ...contextFilters };
  
  if (updates.StartDate !== undefined) {
    newFilters = updateFilter(newFilters, 'StartDate', updates.StartDate);
  }
  
  if (updates.EndDate !== undefined) {
    newFilters = updateFilter(newFilters, 'EndDate', updates.EndDate);
  }
  
  setTempFilters(newFilters);
  if (shouldLoad) {
    updateListState({ filters: newFilters, page: 1 });
  } else {
    updateListState({ filters: newFilters });
  }
};

export const isEditDisabled = (createdDate: string | null) => {
   if (!createdDate) return false; 
  const created = new Date(createdDate);
  const now = new Date();

  const diffTime = now.getTime() - created.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays > 2;
};

