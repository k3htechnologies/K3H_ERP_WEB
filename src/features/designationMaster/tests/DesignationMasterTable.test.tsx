import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { DesignationMasterTable } from '../components/DesignationMasterTable'; // Adjust path if needed
import type { DesignationMasterData } from '@/features/designationMaster/models/DesignationMasterModel';

// ==========================================
// 1. STUBS & MOCKING SETUP
// ==========================================
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock the nested DataTable component so we focus purely on DesignationMasterTable logic
vi.mock('@/ui/components/DataTable/DataTable', () => ({
  DataTable: ({ data, columns }: any) => {
    return (
      <table>
        <thead>
          <tr>
            {columns.map((c: any) => <th key={c.key}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, rowIndex: number) => (
            <tr key={rowIndex}>
              {columns.map((c: any) => (
                <td key={c.key}>
                  {/* If a custom render function exists for this column, execute it */}
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

// Mock Tooltip component to keep text matching simple
vi.mock('@/ui/components/Tooltip/TooltipText', () => ({
  default: ({ text, onClick }: any) => <span onClick={onClick}>{text}</span>,
}));

// ==========================================
// 2. FRESH TEST TEMPLATES
// ==========================================
describe('DesignationMasterTable Component Tests', () => {
  const mockOnSort = vi.fn();
  const mockOnView = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  const sampleColumns = [
    { key: 'DesignationName', label: 'Designation Name' },
    { key: 'Actions', label: 'Actions List' },
  ];

  const  samplePagination = {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 1,
    pageSize: 20,                       
    onPageChange: (page: number) => {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===================================================
  // Test 1: Basic View Rendering & Row Interactivity
  // ===================================================
  test('should render row layout and fire onView event when clicking designation name', () => {
    const mockRows = [
      { DesignationMasterId: 1, DesignationName: 'Software Engineer', NumberOfEmployee: 0 } as DesignationMasterData
    ];

    render(
      <DesignationMasterTable
        data={mockRows}
        columns={sampleColumns}
        pagination={samplePagination}
        onSort={mockOnSort}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canAction={true}
        loading={false}
      />
    );

    // Look for the name on screen
    const nameElement = screen.getByText('Software Engineer');
    expect(nameElement).toBeInTheDocument();

    // Click the name and verify the view function fires
    fireEvent.click(nameElement);
    expect(mockOnView).toHaveBeenCalledWith(mockRows[0]);
  });

  // ===================================================
  // Test 2: Checking Action Permissions Hiding
  // ===================================================
  test('should hide action pathways when canAction permission flag is false', () => {
    const mockRows = [
      { DesignationMasterId: 1, DesignationName: 'Manager', NumberOfEmployee: 0 } as DesignationMasterData
    ];

    render(
      <DesignationMasterTable
        data={mockRows}
        columns={sampleColumns}
        pagination={samplePagination}
        onSort={mockOnSort}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canAction={false} // No action permissions!
        loading={false}
      />
    );

    // The trash icon button should not exist on screen
    const trashButton = screen.queryByTitle('Delete Designation');
    expect(trashButton).not.toBeInTheDocument();
  });

  // ===================================================
  // Test 3: Standard Deletion Flow
  // ===================================================
  test('should allow clicking delete button when canAction is true and employee count is zero', () => {
    const mockRows = [
      { DesignationMasterId: 2, DesignationName: 'HR Executive', NumberOfEmployee: 0 } as DesignationMasterData
    ];

    render(
      <DesignationMasterTable
        data={mockRows}
        columns={sampleColumns}
        pagination={samplePagination}
        onSort={mockOnSort}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canAction={true}
        loading={false}
      />
    );

    // Locate the delete button by its hover title text
    const deleteButton = screen.getByTitle('Delete Designation');
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).not.toBeDisabled();

    // Click it and check if it communicates the row back up to the parent hook
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockRows[0]);
  });

  // ===================================================
  // Test 4: Locked Deletion Constraint
  // ===================================================
  test('should disable delete button if designation has assigned employees', () => {
    const mockRows = [
      { DesignationMasterId: 3, DesignationName: 'Accountant', NumberOfEmployee: 5 } as DesignationMasterData
    ];

    render(
      <DesignationMasterTable
        data={mockRows}
        columns={sampleColumns}
        pagination={samplePagination}
        onSort={mockOnSort}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canAction={true}
        loading={false}
      />
    );

    const deleteButton = screen.getByTitle('Delete Designation');
    
    // The button should be disabled because NumberOfEmployee is greater than 0
    expect(deleteButton).toBeDisabled();

    // Clicking it should return early and not execute the delete handler
    fireEvent.click(deleteButton);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  // ===================================================
  // Test 5: Route Redirection (Module Access Button)
  // ===================================================
  test('should show module access lock button and navigate on click when employees exist', () => {
    const mockRows = [
      { DesignationMasterId: 77, DesignationName: 'Team Lead', NumberOfEmployee: 2, IsSetAccessModule: true } as DesignationMasterData
    ];

    render(
      <DesignationMasterTable
        data={mockRows}
        columns={sampleColumns}
        pagination={samplePagination}
        onSort={mockOnSort}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        canAction={true}
        loading={false}
      />
    );

    // The lock button shows only if row.NumberOfEmployee > 0
    const accessButton = screen.getByTitle('Module Access');
    expect(accessButton).toBeInTheDocument();

    // Click to visit page access matrix view
    fireEvent.click(accessButton);

    // Verify it builds the correct URL router string matching the clicked ID
    expect(mockNavigate).toHaveBeenCalledWith(
      '/designationMaster/employeeModuleAccess/77',
      expect.objectContaining({
        state: { designationName: 'Team Lead' }
      })
    );
  });
});