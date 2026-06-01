import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { DesignationMasterViewModal } from '../components/DesignationMasterViewModal'; // Adjust path if needed
import type { DesignationMasterData } from '@/features/designationMaster/models/DesignationMasterModel';

// ==========================================
// 1. MOCKING COMPONENT DEPENDENCIES
// ==========================================

// Mocking the <Modal /> Layout
vi.mock('@/ui/components/Modal/Modal', () => ({
  Modal: ({ children, isOpen, title }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="view-modal-container">
        <h2>{title}</h2>
        <div>{children}</div>
      </div>
    );
  },
}));

// Mocking <FieldItem /> to simplify layout text lookups
vi.mock('@/ui/components/forms/FieldItem', () => ({
  FieldItem: ({ label, value }: { label: string; value: any }) => (
    <div data-testid="field-item">
      <span className="label">{label}:</span>
      <span className="value">{value}</span>
    </div>
  ),
}));

// Mocking the Date Formatter utility to return a predictable, stable string
vi.mock('@/core/utils/dateFormat', () => ({
  formatDate_dd_MonthName_yy_hh_mm: (date: any) => '25-May-2026 12:00 PM',
}));

// ==========================================
// 2. MOCK DATA TEMPLATES
// ==========================================
const sampleDataWithoutModification = {
  DesignationMasterId: 10,
  DesignationName: 'Frontend Engineer',
  ProbationPeriod: 90,
  NoticePeriod: 30,
  NumberOfEmployee: 0,
  CreatedBy: 'Harshita S',
  CreatedDate: '2026-05-25T12:00:00Z',
  ModifiedBy: '', // Intentionally empty to test fallback
  ModifiedDate: '',
} as DesignationMasterData;

const sampleDataWithEmployeesAndModification = {
  DesignationMasterId: 20,
  DesignationName: 'Project Manager',
  ProbationPeriod: 0, // Testing fallback formatting
  NoticePeriod: 60,
  NumberOfEmployee: 4, // More than 0 employees!
  CreatedBy: 'Rahul K',
  CreatedDate: '2026-05-20T10:00:00Z',
  ModifiedBy: 'Admin User', // Has modification records
  ModifiedDate: '2026-05-24T15:30:00Z',
} as DesignationMasterData;

// ==========================================
// 3. MAIN TEST SUITE
// ==========================================
describe('DesignationMasterViewModal Component Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===================================================
  // Test 1: Empty Data Guard
  // ===================================================
  test('should render nothing if data prop is null', () => {
    render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={null} // No data
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByTestId('view-modal-container')).not.toBeInTheDocument();
  });

  // ===================================================
  // Test 2: Standard Data Mapping and String Formats
  // ===================================================
  test('should render record fields correctly with appended string modifiers', () => {
    render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithoutModification}
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Verify main header title
    expect(screen.getByText('Designation Master Details')).toBeInTheDocument();

    // Verify raw fields and mapped modifications (e.g. "90" -> "90 Days")
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('90 Days')).toBeInTheDocument();
    expect(screen.getByText('30 Days')).toBeInTheDocument();
    
    // Check dynamic mock string from our date mock helper
    expect(screen.getByText('Harshita S - 25-May-2026 12:00 PM')).toBeInTheDocument();
  });

  // ===================================================
  // Test 3: Fallback Formatting Handling
  // ===================================================
  test('should display default fallback dash markers when numeric fields are zero or falsy', () => {
    render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithEmployeesAndModification}
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Because sampleDataWithEmployeesAndModification has ProbationPeriod: 0, it falls back to "-"
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  // ===================================================
  // Test 4: Conditional Modification Section Rendering
  // ===================================================
  test('should toggle visibility of the Modified By block depending on field content', () => {
    const { rerender } = render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithoutModification} // ModifiedBy is empty string ""
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Modified info text should not exist
    expect(screen.queryByText('Modified By / Date:')).not.toBeInTheDocument();

    // Re-render using the modified data row
    rerender(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithEmployeesAndModification} // ModifiedBy = "Admin User"
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Now it should show up perfectly
    expect(screen.getByText('Modified By / Date:')).toBeInTheDocument();
    expect(screen.getByText('Admin User - 25-May-2026 12:00 PM')).toBeInTheDocument();
  });

  // ===================================================
  // Test 5: Standard Interaction Handling (Edit Button)
  // ===================================================
  test('should trigger close sequence and call onEdit callback when clicking edit button', () => {
    render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithoutModification}
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    // The component explicitly calls onClose() first, then triggers the edit callback
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(sampleDataWithoutModification);
  });

  // ===================================================
  // Test 6: Deletion Guardrails (Delete Button Visibility)
  // ===================================================
  test('should hide delete button if the designation contains active employee assignments', () => {
    render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithEmployeesAndModification} // NumberOfEmployee: 4
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // When employees are assigned, the layout hides the button and renders an empty helper div instead
    const deleteButton = screen.queryByRole('button', { name: 'Delete' });
    expect(deleteButton).not.toBeInTheDocument();
  });

  test('should display delete button and trigger callbacks cleanly when employee count is zero', () => {
    render(
      <DesignationMasterViewModal
        isOpen={true}
        onClose={mockOnClose}
        data={sampleDataWithoutModification} // NumberOfEmployee: 0
        canAction={true}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(sampleDataWithoutModification);
  });
});