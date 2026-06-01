import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import ViewEmployeeMaster from '../pages/ViewEmployeeMaster';
import { employeeMasterService } from '../services/EmployeeMasterService';
import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService';
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
  useMenuPermissions: () => ({ canAction: true }),
}));

vi.mock('@/features/employeeMaster/context/EmployeeListStateContext', () => ({
  useEmployeeListState: () => ({
    listState: {
      employeeId: 101,
      employeeName: 'Harshita Srivastava',
    },
    updateListState: vi.fn(),
  }),
}));

vi.mock('@/core/utils/getNameInitials', () => ({
  getNameInitials: () => 'HS',
}));
vi.mock('@/core/utils/documentUtils', () => ({
  parseDocumentUrls: (v: string) => (v ? [v] : []),
}));

vi.mock('@/ui/components/ImageViewer/ImageViewer', () => ({
  default: ({ triggerLabel }: any) => <button>{triggerLabel}</button>,
}));

vi.mock('../services/EmployeeMasterService', () => ({
  employeeMasterService: { apiCallPullEmployeeMaster: vi.fn() },
}));
vi.mock('@/features/assetMappingMaster/services/AssetMappingMasterService', () => ({
  assetMappingMasterService: { apiCallPullAssetMappingMaster: vi.fn() },
}));
vi.mock('@/features/employeeMaster/services/EmployeeDocumentService', () => ({
  employeeDocumentService: { apiCallPullEmployeeDocument: vi.fn() },
}));
vi.mock('@/features/projectMaster/services/ProjectMasterService', () => ({
  projectMasterService: { apiCallPullProjectMaster: vi.fn() },
}));
vi.mock('@/features/shiftMappingMaster/services/ShiftMappingMasterService', () => ({
  shiftMappingMasterService: { apiCallPullShiftMappingMaster: vi.fn() },
}));
vi.mock('@/features/weekOffMappingMaster/services/WeekOffMappingMasterService', () => ({
  weekOffMappingMasterService: { apiCallPullWeekOffMappingMaster: vi.fn() },
}));

const mockEmployeeOverview = {
  EmployeeId: 101,
  EmployeeCode: 'EMP101',
  FirstName: 'Harshita',
  MiddleName: 'S',
  LastName: 'Srivastava',
  Gender: 'Female',
  MaritalStatus: 'Single',
  BloodGroup: 'O+',
  CompanyName: 'H and M',
  PanCardNumber: 'ABCDE1234F',
  PassportNumber: 'Z1234567',
  CountryName: 'India',
  EmployeeReportingCycleData: [],
};

const mockAssets = [
  { AssetName: 'MacBook Pro', AssetCode: 'ASST-001', AssetType: 'Laptop', SerialNumber: 'SN12345' },
];

const mockDocuments = [
  { EmployeeDocumentId: 1, DocumentName: 'Degree Certificate', DocumentURL: 'doc-url' },
];

describe('ViewEmployeeMaster Component Dashboard Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(employeeMasterService.apiCallPullEmployeeMaster).mockResolvedValue(
      E.right({ Data: [mockEmployeeOverview], TotalNumberOfRecord: 1 } as any)
    );
    vi.mocked(assetMappingMasterService.apiCallPullAssetMappingMaster).mockResolvedValue(
      E.right({ Data: mockAssets, TotalNumberOfRecord: 1 } as any)
    );
    vi.mocked(employeeDocumentService.apiCallPullEmployeeDocument).mockResolvedValue(
      E.right({ Data: mockDocuments, TotalNumberOfRecord: 1 } as any)
    );
  });


  test('should render Overview tab data immediately when page mounts', async () => {
    render(<ViewEmployeeMaster />);

    expect(screen.getByText('Employee Details :')).toBeInTheDocument();
    expect(screen.getByText('Harshita Srivastava')).toBeInTheDocument();

    expect(employeeMasterService.apiCallPullEmployeeMaster).toHaveBeenCalledWith(
      expect.objectContaining({ EmployeeId: 101 })
    );

    const businessCard = await screen.findByText('ANC Pvt Ltd');
    expect(businessCard).toBeInTheDocument();
    expect(screen.getByText('O+')).toBeInTheDocument();

    expect(screen.getByText('ABCDE1234F')).toBeInTheDocument();
    expect(screen.getByText('Z1234567')).toBeInTheDocument();
  });

  test('should update layout views and execute asset lookups when switching tabs', async () => {
    render(<ViewEmployeeMaster />);
    await screen.findByText('ANC Pvt Ltd');

    const assetTabButton = screen.getByRole('button', { name: 'Asset' });
    fireEvent.click(assetTabButton);

    expect(assetMappingMasterService.apiCallPullAssetMappingMaster).toHaveBeenCalledWith(
      expect.objectContaining({ EmployeeId: 101 })
    );

    const assetCardTitle = await screen.findByText('MacBook Pro');
    expect(assetCardTitle).toBeInTheDocument();
    expect(screen.getByText('ASST-001')).toBeInTheDocument();

    // Elements from the previous Overview tab layout should no longer be visible
    expect(screen.queryByText('ANC Pvt Ltd')).not.toBeInTheDocument();
  });

  test('should mount grid-cards and download references when matching Document tabs', async () => {
    render(<ViewEmployeeMaster />);
    await screen.findByText('ANC Pvt Ltd');

    fireEvent.click(screen.getByRole('button', { name: 'Document' }));

    expect(employeeDocumentService.apiCallPullEmployeeDocument).toHaveBeenCalled();

    const documentCardTitle = await screen.findByText('Degree Certificate');
    expect(documentCardTitle).toBeInTheDocument();
  });

  test('should bridge routing patterns to edit components when clicking the action bar triggers', async () => {
    render(<ViewEmployeeMaster />);
    await screen.findByText('ANC Pvt Ltd');


    const editActionButton = screen.getByRole('button', { name: 'Edit' });
    fireEvent.click(editActionButton);

    expect(mockNavigate).toHaveBeenCalledWith('/employeeMaster/add/101');
  });


  test('should mount backup NoDataView warnings if target lists return clear objects', async () => {
    vi.mocked(assetMappingMasterService.apiCallPullAssetMappingMaster).mockResolvedValue(
      E.right({ Data: [], TotalNumberOfRecord: 0 } as any)
    );

    render(<ViewEmployeeMaster />);
    await screen.findByText('ANC Pvt Ltd');

    fireEvent.click(screen.getByRole('button', { name: 'Assets' }));

    const warningLabel = await screen.findByText('No Assets Found');
    expect(warningLabel).toBeInTheDocument();
  });
});