import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { useDesignationMaster } from '../hooks/useDesignationMaster'; // Adjust path if needed
import { designationMasterService } from '@/features/designationMaster/services/DesignationMasterService';
import * as E from 'fp-ts/Either';

// ==========================================
// 1. GLOBAL ENVIRONMENT MOCKS
// ==========================================
const mockAddToast = vi.fn();
vi.mock('@/core/hooks/useToast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock('@/features/menu/hooks/useMenuPermissions', () => ({
  useMenuPermissions: () => ({ canAction: true, canExport: true }),
}));

vi.mock('@/core/utils/localStorageHelper', () => ({
  LocalStorageHelper: {
    // FIX: Add these token and employee data mock functions
    getStoredTokenData: () => 'mock-token',
    getStoredEmployeeData: () => ({
      UniqueKey: '123',
      FullName: 'Test User',
    }),
    getDesignationMasterTableColumns: () => null,
  },
}));

// Mock Constants
vi.mock('@/features/designationMaster/constants/designationMasterConstants', () => ({
  getInitialFormState: () => ({
    DesignationMasterId: 0,
    Uniquekey: 'temp-key-123',
    DesignationName: '',
    NoticePeriod: 0,
    ProbationPeriod: 0,
  }),
  getDesignationMasterColumns: () => [
    { key: 'DesignationName', label: 'Designation Name' },
  ],
  REQUIRED_COLUMN_KEYS: ['DesignationName'],
}));

// Mock Service Endpoint Calls
vi.mock('@/features/designationMaster/services/DesignationMasterService', () => ({
  designationMasterService: {
    apiCallPullDesignationMaster: vi.fn(),
    apiCallAddUpdateDesignationMaster: vi.fn(),
    apiCallDeleteDesignationMaster: vi.fn(),
  },
}));

// ==========================================
// 2. MOCK DATASETS
// ==========================================
const mockDesignationData = [
  { DesignationMasterId: 1, Uniquekey: 'a', DesignationName: 'Software Engineer', NoticePeriod: 30, ProbationPeriod: 90 },
  { DesignationMasterId: 2, Uniquekey: 'b', DesignationName: 'QA Lead', NoticePeriod: 30, ProbationPeriod: 180 },
];

const mockPullResponse = {
  Data: mockDesignationData,
  TotalNumberOfRecord: 2,
};

// ==========================================
// 3. MAIN TEST SUITE
// ==========================================
describe('useDesignationMaster Custom Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default fallback mock so hook mounts successfully without crashing
    vi.mocked(designationMasterService.apiCallPullDesignationMaster).mockResolvedValue(
      E.right(mockPullResponse as any)
    );
  });

  // ===================================================
  // Test 1: Hook Initialization & Loading Data
  // ===================================================
  test('should load designations on mount automatically', async () => {
    const { result } = renderHook(() => useDesignationMaster());

    // Expect loading indicators to start as true
    expect(result.current.isLoading).toBe(true);

    // Wait for async endpoint sequence to finish completely
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check that our list state holds our array data
    expect(result.current.designationMasterList).toEqual(mockDesignationData);
    expect(result.current.pagination.totalRecords).toBe(2);
  });

  // ===================================================
  // Test 2: Simulating Form Input Changes
  // ===================================================
  test('should update state form fields when handleFieldChange runs', async () => {
    const { result } = renderHook(() => useDesignationMaster());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.handleFieldChange('DesignationName', 'Business Analyst');
      result.current.handleFieldChange('NoticePeriod', 60);
    });

    expect(result.current.formData.DesignationName).toBe('Business Analyst');
    expect(result.current.formData.NoticePeriod).toBe(60);
    expect(result.current.formData.ProbationPeriod).toBe(0); // Remained untouched!
  });

  // ===================================================
  // Test 3: Form Validation Errors
  // ===================================================
  test('should trigger validation errors if fields are empty on submit', async () => {
    const { result } = renderHook(() => useDesignationMaster());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Open add modal which defaults to clean, empty inputs
    act(() => {
      result.current.handleAddDesignationModal();
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    // Run form submit action
    await act(async () => {
      await result.current.handleAddUpdateDesignationMaster(mockEvent);
    });

    // Expect errors object to be filled with error warning strings
    expect(result.current.errors.DesignationName).toBe('Designation Name is required');
    expect(result.current.errors.NoticePeriod).toBe('Notice Period is required');
    expect(result.current.errors.ProbationPeriod).toBe('Probation Period is required');
    
    // Verify that the API call was blocked from executing
    expect(designationMasterService.apiCallAddUpdateDesignationMaster).not.toHaveBeenCalled();
  });

  // ===================================================
  // Test 4: Successful Submission (Add Mode)
  // ===================================================
  test('should successfully add a record and close modal on API success', async () => {
    const freshRecord = { DesignationMasterId: 9, Uniquekey: 'c', DesignationName: 'DevOps', NoticePeriod: 30, ProbationPeriod: 90 };
    
    vi.mocked(designationMasterService.apiCallAddUpdateDesignationMaster).mockResolvedValue(
      E.right({
        Data: [freshRecord],
        SuccessMessage: ['Designation added successfully'],
      } as any)
    );

    const { result } = renderHook(() => useDesignationMaster());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Open and correctly populate fields to clear form validation rules
    act(() => {
      result.current.handleAddDesignationModal();
    });

    act(() => {
      result.current.handleFieldChange('DesignationName', 'DevOps');
      result.current.handleFieldChange('NoticePeriod', 30);
      result.current.handleFieldChange('ProbationPeriod', 90);
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    // Submit form layout
    await act(async () => {
      await result.current.handleAddUpdateDesignationMaster(mockEvent);
    });

    // 1. The modal should automatically close
    expect(result.current.isAddUpdateModalOpen).toBe(false);

    // 2. Your new record should be prepended to index position 0
    expect(result.current.designationMasterList[0].DesignationName).toBe('DevOps');

    // 3. A success notification toast must be triggered
    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Designation added successfully',
    });
  });

  // ===================================================
  // Test 5: Successful Deletion Flow
  // ===================================================
//   test('should drop list array records when confirmation delete returns success', async () => {
//     vi.mocked(designationMasterService.apiCallDeleteDesignationMaster).mockResolvedValue(
//       E.right({ SuccessMessage: ['Designation deleted successfully'] } as any)
//     );

//     const { result } = renderHook(() => useDesignationMaster());
//     await waitFor(() => expect(result.current.isLoading).toBe(false));

//     // Choose target row and open the confirmation block
//     const targetRow = mockDesignationData[0]; // Software Engineer
//     act(() => {
//       result.current.handleConfirmationDialogBoxOpen(targetRow);
//     });

//     expect(result.current.isConfirmationDialogBoxOpen).toBe(true);
//     expect(result.current.deleteDesignationMasterDetailsData).toEqual(targetRow);

//     // Confirm deletion action sequence
//     await act(async () => {
//       await result.current.handleDeleteDesignationMaster();
//     });

//     // Verify deletion dialog closes and API parameters match row specifications
//     expect(result.current.isConfirmationDialogBoxOpen).toBe(false);
//     expect(designationMasterService.apiCallDeleteDesignationMaster).toHaveBeenCalledWith({
//       DesignationMasterId: 1,
//       UniqueKey: 'a',
//     });
//   });
});