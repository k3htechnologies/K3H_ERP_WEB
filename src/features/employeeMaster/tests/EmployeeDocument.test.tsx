import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import EmployeeDocument from '../pages/EmployeeDocument';
import { employeeDocumentService } from '@/features/employeeMaster/services/EmployeeDocumentService';
import * as E from 'fp-ts/Either';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockAddToast = vi.fn();
vi.mock('@/core/hooks/useToast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock('@/features/menu/hooks/useMenuPermissions', () => ({
  useMenuPermissions: () => ({ canAction: true, canExport: true }),
}));

vi.mock('@/features/employeeMaster/context/EmployeeListStateContext', () => ({
  useEmployeeListState: () => ({
    listState: {
      employeeName: 'Harshita Srivastava',
      employeeId: 101,
      pageName: 'PROFILE',
    },
  }),
}));


vi.mock('@/core/utils/localStorageHelper', () => ({
  LocalStorageHelper: {
    getStoredTokenData: () => 'mock-token',
  },
}));

vi.mock('@/core/utils/fileValidation', () => ({
  hasAnyDocumentFile: () => true,
}));

vi.mock('@/core/utils/documentUtils', () => ({
  parseDocumentUrls: (val: string) => (val ? [val] : []),
}));


vi.mock('@/ui/components/ImagePicker/MultiFilePicker', () => ({
  MultiFilePicker: ({ label, onChange }: any) => (
    <div data-testid="file-picker">
      <label>{label}</label>
      <button type="button" onClick={() => onChange([new File([], 'resume.pdf')])}>
        Simulate Upload
      </button>
    </div>
  ),
}));

vi.mock('@/ui/components/ImageViewer/ImageViewer', () => ({
  default: ({ triggerLabel }: any) => <button>{triggerLabel}</button>,
}));

vi.mock('@/features/employeeMaster/services/EmployeeDocumentService', () => ({
  employeeDocumentService: {
    apiCallPullEmployeeDocument: vi.fn(),
    apiCallAddUpdateEmployeeDocument: vi.fn(),
  },
}));

const mockDocuments = [
  {
    EmployeeDocumentId: 1,
    Uniquekey: 'doc-123',
    EmployeeId: 101,
    DocumentName: 'Aadhar Card',
    DocumentURL: 'https://mocklink.com/aadhar.png',
    ModifiedBy: 'Admin',
    ModifiedDate: '2026-05-25',
  },
];


describe('EmployeeDocument Page Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(employeeDocumentService.apiCallPullEmployeeDocument).mockResolvedValue(
      E.right({
        Data: mockDocuments,
        TotalNumberOfRecord: 1,
      } as any)
    );
  });

  test('should display employee name from context and fetch list on mount', async () => {
    render(<EmployeeDocument />);

    expect(screen.getByText('Harshita Srivastava')).toBeInTheDocument();

    const documentName = await screen.findByText('Aadhar Card');
    expect(documentName).toBeInTheDocument();
  });

  test('should update search input text normally when user types', async () => {
    render(<EmployeeDocument />);

    const searchInput = screen.getByPlaceholderText('Search By Document Name');
    fireEvent.change(searchInput, { target: { value: 'Pan Card' } });

    expect(searchInput).toHaveValue('Pan Card');
  });

});