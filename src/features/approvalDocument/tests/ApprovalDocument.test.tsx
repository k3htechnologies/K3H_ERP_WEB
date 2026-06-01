import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { Input } from '@/ui/components/forms'; // Adjust this import path to your actual Input component

describe('Document Name Input Component', () => {
  const mockHandleFieldChange = vi.fn();

  const defaultProps = {
    label: 'Document Name',
    required: true,
    error: '',
    type: 'text',
    value: '',
    maxLength: 100,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => 
      mockHandleFieldChange('ApprovalDocumentName', e.target.value),
    placeholder: 'Enter Document Name',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

//   ### Test 1: Rendering Basic Setup
  test('should render the input field with correct label and placeholder', () => {
    render(<Input {...defaultProps} />);

    // Verify the label exists
    expect(screen.getByText('Document Name')).toBeInTheDocument();

    // Verify the input element is accessible via its placeholder
    const inputElement = screen.getByPlaceholderText('Enter Document Name');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'text');
    expect(inputElement).toHaveAttribute('maxLength', '100');
  });

  test('should trigger onChange handler when user types a value', () => {
    render(<Input {...defaultProps} />);

    const inputElement = screen.getByPlaceholderText('Enter Document Name') as HTMLInputElement;

    // Simulate typing "Inward Invoice"
    fireEvent.change(inputElement, { target: { value: 'Inward Invoice' } });

    // Assert that the change handler was called with the correct field name and value
    expect(mockHandleFieldChange).toHaveBeenCalledTimes(1);
    expect(mockHandleFieldChange).toHaveBeenCalledWith('ApprovalDocumentName', 'Inward Invoice');
  });

//   test('should display the controlled value passed from form state', () => {
//     render(<Input {...defaultProps} value="Standard Operating Procedure" />);

//     const inputElement = screen.getByPlaceholderText('Enter Document Name') as HTMLInputElement;
    
//     // Check if the initial value maps perfectly to the DOM node
//     expect(inputElement.value).toBe('Standard Operating Procedure');
//   });

//   test('should render error message when validation fails', () => {
//     const errorMessage = 'Document Name is highly required';
    
//     render(<Input {...defaultProps} error={errorMessage} />);

//     // Assert that the specific error text is injected into the view layer
//     expect(screen.getByText(errorMessage)).toBeInTheDocument();
//   });
});