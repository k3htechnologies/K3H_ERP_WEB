import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, beforeEach, test, expect } from 'vitest';
import { useDepartmentMaster } from '../hooks/useDepartmentMaster';
import { departmentMasterService } from '@/features/departmentMaster/services/DepartmentMasterService';
import * as E from 'fp-ts/Either';
import type { DepartmentMasterData } from '../models/DepartmentMasterModel';

// vi.useFakeTimers();
const mockAddToast = vi.fn();

vi.mock('@/core/hooks/useToast', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

vi.mock('@/features/menu/hooks/useMenuPermissions', () => ({
  useMenuPermissions: () => ({
    canAction: true,
    canExport: true,
  }),
}));

vi.mock('@/core/utils/localStorageHelper', () => ({
  LocalStorageHelper: {
    getStoredTokenData: () => 'mock-token',

    getStoredEmployeeData: () => ({
      UniqueKey: '123',
      FullName: 'Test User',
    }),

    getDepartmentMasterTableColumns: () => null,
  },
}));

vi.mock(
  '@/features/departmentMaster/constants/departmentMasterConstants',
  () => ({
    getInitialFormState: () => ({
      DepartmentMasterId: 0,
      Uniquekey: 'initial-temp-key',
      DepartmentCode: '',
      DepartmentName: '',
    }),

    getDepartmentMasterColumns: () => [
      {
        key: 'DepartmentCode',
        label: 'Code',
      },
      {
        key: 'DepartmentName',
        label: 'Name',
      },
    ],

    REQUIRED_COLUMN_KEYS: ['DepartmentCode'],
  })
);

vi.mock(
  '@/features/departmentMaster/services/DepartmentMasterService',
  () => ({
    departmentMasterService: {
      apiCallPullDepartmentMaster: vi.fn(),
      apiCallAddUpdateDepartmentMaster: vi.fn(),
      apiCallDeleteDepartmentMaster: vi.fn(),
    },
  })
);

const mockDepartmentData = [
  {
    DepartmentMasterId: 10,
    Uniquekey: 'k1',
    DepartmentCode: 'ENG',
    DepartmentName: 'Engineering',
  } as DepartmentMasterData,
  {
    DepartmentMasterId: 20,
    Uniquekey: 'k2',
    DepartmentCode: 'HRM',
    DepartmentName: 'Human Resources',
  } as DepartmentMasterData, // <-- And here
];

const mockPullResponse = {
  Data: mockDepartmentData,
  TotalNumberOfRecord: 2,
  SuccessMessage: '',
  ErrorMessage: '',
  WarningMessage: '',
  IsSuccess: true,
  HttpStatusCode: 200,
};


describe('useDepartmentMaster Custom Hook Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(
      departmentMasterService.apiCallPullDepartmentMaster
    ).mockResolvedValue(
      E.right(mockPullResponse as any)
    );
  });

  test('should automatically load initial departments on mount', async () => {

    const { result } = renderHook(() => useDepartmentMaster());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(
      departmentMasterService.apiCallPullDepartmentMaster
    ).toHaveBeenCalled();

    expect(result.current.departmentMasterList)
      .toEqual(mockDepartmentData);

    expect(result.current.pagination.totalRecords)
      .toBe(2);
  });

  // =========================================
  // Test 2: Validation Errors
  // =========================================

  test('should reject form submission when validation fails', async () => {

    const { result } = renderHook(() => useDepartmentMaster());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.handleAddDepartmentModal();
    });

    expect(result.current.isAddUpdateModalOpen)
      .toBe(true);

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleAddUpdateDepartmentMaster(
        mockEvent
      );
    });

    expect(result.current.errors.DepartmentCode)
      .toBe('Department Code is required');

    expect(result.current.errors.DepartmentName)
      .toBe('Department Name is required');

    expect(
      departmentMasterService.apiCallAddUpdateDepartmentMaster
    ).not.toHaveBeenCalled();
  });

  // =========================================
  // Test 3: Handling Form Input Changes
  // =========================================
  test('should update formData when handleFieldChange is called', async () => {
    const { result } = renderHook(() => useDepartmentMaster());

    // Wait for initial loading to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Simulate typing "IT" into the DepartmentCode field
    act(() => {
      result.current.handleFieldChange('DepartmentCode', 'IT');
    });

    // Verify only the DepartmentCode updated in state
    expect(result.current.formData.DepartmentCode).toBe('IT');
    expect(result.current.formData.DepartmentName).toBe('');
  });

  // =========================================
  // Test 4: Opening the View Details Modal
  // =========================================
  test('should open view modal and set the correct data when viewing row details', async () => {
    const { result } = renderHook(() => useDepartmentMaster());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const rowToView = mockDepartmentData[0]; // Engineering row

    // Simulate clicking the "View" button on a row
    act(() => {
      result.current.handleViewDepartmentDetails(rowToView);
    });

    // Verify the modal opens and holds the exact row data
    expect(result.current.isViewModalOpen).toBe(true);
    expect(result.current.viewDepartmentMasterDetailsData).toEqual(rowToView);
  });

  // =========================================
  // Test 5: Clearing Filters
  // =========================================
  test('should reset filters and reload data when clearFilters is called', async () => {
    const { result } = renderHook(() => useDepartmentMaster());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Put some temporary data inside filters first
    act(() => {
      result.current.setTempFilters({ DepartmentName: 'Sales' });
      result.current.setFilters({ DepartmentName: 'Sales' });
    });

    // Simulate clicking the "Clear Filters" button
    act(() => {
      result.current.clearFilters();
    });

    // Verify all filter states went back to an empty object
    expect(result.current.tempFilters).toEqual({});
    expect(result.current.filters).toEqual({});
    expect(result.current.showFilterPopup).toBe(false);
    
    // Verify it called the API to reload the fresh unfiltered list
    expect(departmentMasterService.apiCallPullDepartmentMaster).toHaveBeenCalled();
  });

});