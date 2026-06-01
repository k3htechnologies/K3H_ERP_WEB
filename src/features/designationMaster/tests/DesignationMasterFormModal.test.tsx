import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { DesignationMasterFormModal } from '../components/DesignationMasterFormModal'; // Adjust path if needed
import type { AddUpdateDesignationMasterRequest } from '@/features/designationMaster/models/DesignationMasterModel';

// ==========================================
// Mocking the <Modal /> Layout Safely
// ==========================================
vi.mock('@/ui/components/Modal/Modal', () => ({
  Modal: ({ children, isOpen, title, onSubmit, saveText, onCancel }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="form-modal-container">
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit">{saveText}</button>
          <button type="button" onClick={onCancel}>Cancel Button</button>
        </form>
      </div>
    );
  },
}));

describe('DesignationMasterFormModal Component Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnFieldChange = vi.fn();

  const emptyFormData: AddUpdateDesignationMasterRequest = {
    DesignationMasterId: 0,
    Uniquekey: '',
    DesignationName: '',
    NoticePeriod: 0,
    ProbationPeriod: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===================================================
  // Test 1: Add Mode (Default Layout Rendering)
  // ===================================================
  test('should show Add layout strings when editingData is null', () => {
    render(
      <DesignationMasterFormModal
        isOpen={true}
        onClose={mockOnClose}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
        formData={emptyFormData}
        onFieldChange={mockOnFieldChange}
        errors={{}}
        editingData={null} // Add Mode!
        loading={false}
      />
    );

    // Check header text and the form save button label
    expect(screen.getByText('Add Designation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    
    // Check fields show empty baseline fallbacks
    expect(screen.getByPlaceholderText('Enter Designation Name')).toHaveValue('');
  });

  // ===================================================
  // Test 2: Update Mode (Pre-populated Fields)
  // ===================================================
  test('should show Update title strings and map active state details into inputs', () => {
    const populatedFormData: AddUpdateDesignationMasterRequest = {
      DesignationMasterId: 45,
      Uniquekey: 'k-45',
      DesignationName: 'Senior Designer',
      NoticePeriod: 30,
      ProbationPeriod: 90,
    };

    render(
      <DesignationMasterFormModal
        isOpen={true}
        onClose={mockOnClose}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
        formData={populatedFormData}
        onFieldChange={mockOnFieldChange}
        errors={{}}
        editingData={{ DesignationMasterId: 45 }} // Update Mode!
        loading={false}
      />
    );

    // Verify Title flips to Update variants
    expect(screen.getByText('Update Designation')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();

    // Verify properties bind perfectly to the inputs
    expect(screen.getByPlaceholderText('Enter Designation Name')).toHaveValue('Senior Designer');
    expect(screen.getByPlaceholderText('Enter Notice Period')).toHaveValue('30');
    expect(screen.getByPlaceholderText('Enter Probation Period')).toHaveValue('90');
  });

  // ===================================================
  // Test 3: Standard Text Changes
  // ===================================================
  test('should run onFieldChange string update when typing designation name', () => {
    render(
      <DesignationMasterFormModal
        isOpen={true}
        onClose={mockOnClose}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
        formData={emptyFormData}
        onFieldChange={mockOnFieldChange}
        errors={{}}
        editingData={null}
        loading={false}
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter Designation Name');
    fireEvent.change(nameInput, { target: { value: 'HR Lead' } });

    expect(mockOnFieldChange).toHaveBeenCalledWith('DesignationName', 'HR Lead');
  });

  // ===================================================
  // Test 4: Number Processing & Letter Blockers
  // ===================================================
  test('should convert numerical digits and block mixed letter strings inside period inputs', () => {
    render(
      <DesignationMasterFormModal
        isOpen={true}
        onClose={mockOnClose}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
        formData={emptyFormData}
        onFieldChange={mockOnFieldChange}
        errors={{}}
        editingData={null}
        loading={false}
      />
    );

    const noticeInput = screen.getByPlaceholderText('Enter Notice Period');

    // Scenario A: User types mixed string "45days" -> should strip letters and pass number 45
    fireEvent.change(noticeInput, { target: { value: '45days' } });
    expect(mockOnFieldChange).toHaveBeenCalledWith('NoticePeriod', 45);

    // Scenario B: User clears field completely -> should safely replace with number 0
    fireEvent.change(noticeInput, { target: { value: '' } });
    expect(mockOnFieldChange).toHaveBeenCalledWith('NoticePeriod', 0);
  });

  // ===================================================
  // Test 5: Rendering Input Error Strings
  // ===================================================
  test('should render highlighted error text blocks when validation messages are passed', () => {
    const activeValidationErrors = {
      DesignationName: 'Designation name is required!',
      NoticePeriod: 'Notice period cannot be empty',
    };

    render(
      <DesignationMasterFormModal
        isOpen={true}
        onClose={mockOnClose}
        onCancel={mockOnCancel}
        onSubmit={mockOnSubmit}
        formData={emptyFormData}
        onFieldChange={mockOnFieldChange}
        errors={activeValidationErrors}
        editingData={null}
        loading={false}
      />
    );

    // Verify the error text nodes are injected underneath your field layouts
    expect(screen.getByText('Designation name is required!')).toBeInTheDocument();
    expect(screen.getByText('Notice period cannot be empty')).toBeInTheDocument();
  });
});