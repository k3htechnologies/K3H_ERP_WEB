import { useState, useEffect, useCallback } from 'react';

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface UseMultiSelectDropdownOptions {
  /**
   * The current selected IDs (array of IDs or comma-separated string)
   */
  value: string | number | (string | number)[] | null | undefined;
  
  /**
   * Callback to fetch dropdown options
   * Should return a promise with { totalNumberOfRecord: number; itemList: DropdownOption[] }
   */
  fetchCallback: (
    pageNumber: number,
    params?: { value?: string; [key: string]: string | undefined }
  ) => Promise<{ totalNumberOfRecord: number; itemList: DropdownOption[] }>;
  
  /**
   * Additional params to pass to fetchCallback (e.g., departmentName for filtering)
   */
  fetchParams?: { [key: string]: string | undefined };
  
  /**
   * Whether to auto-fetch options for selected values (default: true)
   */
  autoFetchOptions?: boolean;
  
  /**
   * Maximum number of pages to fetch when looking for selected values (default: 10)
   */
  maxPages?: number;
}

export interface UseMultiSelectDropdownReturn {
  /**
   * Array of selected IDs (always an array of strings)
   */
  selectedValues: string[];
  
  /**
   * Pre-fetched options for selected values (for display in MultiSelectPagination)
   */
  initialOptions: DropdownOption[];
  
  /**
   * Callback to handle selection changes
   */
  handleChange: (values: (string | number)[]) => {
    ids: string[];
    idsString: string; // Comma-separated string
  };
  
  /**
   * Manually refresh options for selected values
   */
  refreshOptions: () => Promise<void>;
}

/**
 * Custom hook for managing multi-select dropdown binding
 * Handles parsing IDs, pre-fetching options, and creating comma-separated strings
 * 
 * @example
 * ```tsx
 * const { selectedValues, initialOptions, handleChange } = useMultiSelectDropdown({
 *   value: formData.DesignationId, // Can be "1,2,3" or [1,2,3]
 *   fetchCallback: fetchDesignationMasterDropdown,
 *   autoFetchOptions: true
 * });
 * 
 * <MultiSelectPagination
 *   selectedValues={selectedValues}
 *   options={initialOptions}
 *   onChange={(values) => {
 *     const { idsString } = handleChange(values);
 *     handleFieldChange('DesignationId', idsString);
 *   }}
 * />
 * ```
 */
export const useMultiSelectDropdown = ({
  value,
  fetchCallback,
  fetchParams,
  autoFetchOptions = true,
  maxPages = 10,
}: UseMultiSelectDropdownOptions): UseMultiSelectDropdownReturn => {
  // Parse value into array of string IDs
  const parseValue = useCallback((val: string | number | (string | number)[] | null | undefined): string[] => {
    if (!val) return [];
    
    if (Array.isArray(val)) {
      return val
        .map(id => String(id).trim())
        .filter(id => id && id !== '0' && !isNaN(Number(id)) && Number(id) > 0);
    }
    
    const str = String(val);
    if (!str || str === '0' || str.trim() === '') return [];
    
    return str
      .split(',')
      .map(id => id.trim())
      .filter(id => id && id !== '0' && !isNaN(Number(id)) && Number(id) > 0);
  }, []);

  const [selectedValues, setSelectedValues] = useState<string[]>(() => parseValue(value));
  const [initialOptions, setInitialOptions] = useState<DropdownOption[]>([]);

  // Update selectedValues when value prop changes
  useEffect(() => {
    const parsed = parseValue(value);
    setSelectedValues(parsed);
  }, [value, parseValue]);

  // Pre-fetch options for selected values
  const fetchOptionsForSelected = useCallback(async () => {
    const ids = parseValue(value);
    if (ids.length === 0) {
      setInitialOptions([]);
      return;
    }

    try {
      const allOptions: DropdownOption[] = [];
      let page = 1;
      let hasMore = true;
      let foundCount = 0;
      const uniqueIds = Array.from(new Set(ids));

      while (hasMore && foundCount < uniqueIds.length && page <= maxPages) {
        const result = await fetchCallback(page, {
          value: '',
          ...fetchParams,
        });

        allOptions.push(...result.itemList);

        // Check how many of our selected IDs we've found
        const foundIds = allOptions
          .map(opt => String(opt.value))
          .filter(val => uniqueIds.includes(val));
        foundCount = foundIds.length;

        hasMore = result.itemList.length > 0 && allOptions.length < result.totalNumberOfRecord;
        page++;

        // Stop if we found all selected values
        if (foundCount >= uniqueIds.length) {
          break;
        }
      }

      // Filter to only include selected options
      const selectedOptions = allOptions.filter(opt =>
        uniqueIds.includes(String(opt.value))
      );

      setInitialOptions(selectedOptions);
    } catch (error) {
      console.error('Failed to pre-fetch options for multi-select:', error);
      setInitialOptions([]);
    }
  }, [value, fetchCallback, fetchParams, parseValue, maxPages]);

  // Auto-fetch options when value changes (if enabled)
  useEffect(() => {
    if (autoFetchOptions) {
      void fetchOptionsForSelected();
    }
  }, [autoFetchOptions, fetchOptionsForSelected]);

  // Handle selection change
  const handleChange = useCallback(
    (values: (string | number)[]) => {
      const stringValues = (values || [])
        .map(v => String(v).trim())
        .filter(v => v && v !== '0' && !isNaN(Number(v)) && Number(v) > 0);
      
      setSelectedValues(stringValues);
      
      return {
        ids: stringValues,
        idsString: stringValues.length > 0 ? stringValues.join(',') : '',
      };
    },
    []
  );

  return {
    selectedValues,
    initialOptions,
    handleChange,
    refreshOptions: fetchOptionsForSelected,
  };
};





