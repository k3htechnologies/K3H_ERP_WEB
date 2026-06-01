import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { DesignationMasterFilterModal } from '../components/DesignationMasterFilterModal'; // Adjust path if needed

// ==========================================
// Mocking the Global <Modal /> layout safely
// ==========================================
vi.mock('@/ui/components/Modal/Modal', () => ({
  Modal: ({ children, isOpen, title, onSubmit, saveText, onCancel, cancelText }: any) => {
    if (!isOpen) return null; // If modal is closed, show nothing
    return (
      <div data-testid="modal-container">
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit">{saveText}</button>
          <button type="button" onClick={onCancel}>{cancelText}</button>
        </form>
      </div>
    );
  },
}));

describe('DesignationMasterFilterModal Component Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnClear = vi.fn();
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===================================================
  // Test 1: Handle Closed State
  // ===================================================
  test('should return nothing when isOpen is false', () => {
    render(
      <DesignationMasterFilterModal
        isOpen={false} // Closed!
        onClose={mockOnClose}
        onApply={mockOnApply}
        onClear={mockOnClear}
        tempFilters={{}}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Verify modal container isn't even in the DOM
    expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
  });

  // ===================================================
  // Test 2: Basic Rendering & Value Binding
  // ===================================================
  test('should render title and display active filter string inside the input field', () => {
    const mockActiveFilters = { DesignationName: 'Project Lead' };

    render(
      <DesignationMasterFilterModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        onClear={mockOnClear}
        tempFilters={mockActiveFilters} // Prefilled filter text
        onFilterChange={mockOnFilterChange}
      />
    );

    // Check title text exists
    expect(screen.getByText('Filter - Designation Master')).toBeInTheDocument();

    // Verify that the input field displays our string cleanly
    const inputElement = screen.getByPlaceholderText('Enter Designation Name') as HTMLInputElement;
    expect(inputElement).toBeInTheDocument();
    expect(inputElement.value).toBe('Project Lead');
  });

  // ===================================================
  // Test 3: Simulating Typing (onChange)
  // ===================================================
  test('should execute change function when typing fresh criteria keys', () => {
    render(
      <DesignationMasterFilterModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        onClear={mockOnClear}
        tempFilters={{}}
        onFilterChange={mockOnFilterChange}
      />
    );

    const inputElement = screen.getByPlaceholderText('Enter Designation Name');

    // Simulate typing 'QA' into the filter input
    fireEvent.change(inputElement, { target: { value: 'QA' } });

    // Expect your parent handler to capture what field updated and with what value
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith('DesignationName', 'QA');
  });

  // ===================================================
  // Test 4: Clicking the Apply Button
  // ===================================================
  test('should run apply method when clicking the submission button', () => {
    render(
      <DesignationMasterFilterModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        onClear={mockOnClear}
        tempFilters={{}}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Find our save text button which is labeled 'Apply'
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    
    // Click it to trigger the form onSubmit
    fireEvent.click(applyButton);

    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  // ===================================================
  // Test 5: Clicking the Clear Button
  // ===================================================
  test('should execute the clear callback function when clicking cancel text buttons', () => {
    render(
      <DesignationMasterFilterModal
        isOpen={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        onClear={mockOnClear} // The function being tested
        tempFilters={{}}
        onFilterChange={mockOnFilterChange}
      />
    );

    // Find the cancel button labeled 'Clear'
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });
});