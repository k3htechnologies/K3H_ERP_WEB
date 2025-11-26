import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProjectMasterData,
  FilterWithPaginationProjectMasterRequest,
  AddUpdateProjectMasterRequest
} from '@/features/projectMaster/models/ProjectMasterModel';

import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Edit } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { PROJECT_STATUS_OPTIONS } from '@/core/constants';
import { useCountryStateCityDistrictVillageData } from '@/core/hooks/useCountryStateCityDistrictVillage';
import { MultiFilePicker } from '@/ui/components/ImagePicker/MultiFilePicker';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { Checkbox } from '@/ui/components/forms/Checkbox';
import { filterMobile, filterRERA, isValidMobile, isValidRERA } from '@/core/utils/fileValidation';

export const ProjectMaster: React.FC = () => {

  //#region STATE
  const [projectMasterList, setProjectMasterList] = useState<ProjectMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchProjects(value)
  }, 350)

  //VIEW PROJECT MASTER MODAL STATES
  const [viewProjectMasterDetailsData, setViewProjectMasterDetailsData] = useState<ProjectMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectMasterColumnsModal, setIsShowCustomizeProjectMasterColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialProjects = useRef(false)


  //ADD/EDIT MODAL STATES
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState<ProjectMasterData | null>(null);

  const [projectFormData, setProjectFormData] = useState<AddUpdateProjectMasterRequest>({
    ProjectId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectName: '',
    ProjectLocation: '',
    ProjectPhotoURL: null,
    RemoveProjectPhotoURL: '',
    CTSNumber: '',
    IsRedevelopment: 0,
    BussinessCategory: '',
    ProjectShortName: '',
    CountryMasterId: 0,
    DistrictMasterId: 0,
    StateMasterId: 0,
    CityMasterId: 0,
    ZipCode: '',
    ProjectScope: '',
    ProjectEstimateCost: 0,
    ProjectAreaInSqft: 0,
    OnGoingBudgetCost: 0,
    SurveyDate: null,
    ExpectedStartDate: null,
    ExecutionStartDate: null,
    SiteContactMobileNumber: '',
    SiteContactName: '',
    ProjectStatus: '',
    RERANumber: '',
    RERACertificateDate: null,
    RERAComplitionDate: null,
    ProjectScheme: '',
    ProjectSubScheme: '',
    GoogleLocation: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [projectPhotoFiles, setProjectPhotoFiles] = useState<(File | string)[]>([]);
  const [removedProjectPhotoUrls, setRemovedProjectPhotoUrls] = useState<string[]>([]);

  //LOCATION DROPDOWNS
  const {
    isLoading: isLocationLoading,
    countries,
    statesByCountryId,
    districtsByStateId,
    citiesByDistrictId,
  } = useCountryStateCityDistrictVillageData()

  const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = React.useState<number | null>(null)
  const [selectedCityId, setSelectedCityId] = React.useState<number | null>(null)

  const countryOptions = countries.map(c => ({ label: c.name, value: c.id }))
  const stateOptions = selectedCountryId != null ? (statesByCountryId[selectedCountryId] || []).map(s => ({ label: s.name, value: s.id })) : []
  const districtOptions = selectedStateId != null ? (districtsByStateId[selectedStateId] || []).map(d => ({ label: d.name, value: d.id })) : []
  const cityOptions = selectedDistrictId != null ? (citiesByDistrictId[selectedDistrictId] || []).map(c => ({ label: c.name, value: c.id })) : []

  const location = useLocation() as {
    state?: {
      listState?: {
        page: number;
        filters: FilterInfo;
      };
    };
  };
  //#endregion

  //#region INIT
  useEffect(() => {
    if (hasFetchedInitialProjects.current) return;
    hasFetchedInitialProjects.current = true;

    // 🔥 If coming back from AddProject with saved state
    const savedListState = location.state?.listState;

    const initialPage = savedListState?.page ?? pagination.currentPage;
    const initialFilters: FilterInfo = savedListState?.filters ?? {};

    setFilters(initialFilters);
    setTempFilters(initialFilters);

    // load with same page + filters as before
    loadProjects(initialPage, initialFilters);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchProjectList = async (page: number = pagination.currentPage) => {
    return await loadProjects(page, filters);
  }

  const loadProjects = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = projectMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsProjectAccess: true,
          ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
          ProjectName: filterParams.ProjectName?.trim() || undefined,
          ProjectLocation: filterParams.ProjectLocation?.trim() || undefined,
          CTCNumber: filterParams.CTCNumber?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getProjects(params);
        if (E.isRight(response)) {
          setProjectMasterList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Project Data...'
    )
  }

  const searchProjects = async (searchValue: string) => {
    setSearchTerm(searchValue);
    if (searchValue.trim() === '') {
      const emptyFilters: FilterInfo = { ...filters };
      delete emptyFilters.ProjectName;

      setFilters(emptyFilters);
      await loadProjects(1, emptyFilters);
      return;
    }
    const newFilters: FilterInfo = {
      ...filters,
      ProjectName: searchValue.trim(),
    };
    setFilters(newFilters);
    await loadProjects(1, newFilters);
  }

  const clearsearchProjects = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchProjectList();
  }

  const handleExportProjects = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = projectMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsProjectAccess: true,
          ProjectName: filters.ProjectName?.trim() || undefined,
          ProjectLocation: filters.ProjectLocation?.trim() || undefined,
          CTCNumber: filters.CTCNumber?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getProjects(params);
        handleExportFile(response, exportType, 'Project Master', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportProjectExcel = () => handleExportProjects('Excel')
  const handleExportProjectPdf = () => handleExportProjects('PDF')

  const getProjects = async (filterParams: FilterWithPaginationProjectMasterRequest) => {
    return await ProjectMasterService.apiCallPullProjectMaster(filterParams);
  }
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = (page: number) => {
    fetchProjectList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchProjectList(1);
  }

  const projectMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const projectListForTable = useMemo(() => projectMasterList, [projectMasterList]);

  const handleViewProjectDetails = useCallback((row: ProjectMasterData) => {
    setViewProjectMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const projectMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ProjectName',
        label: 'Project Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || '-'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewProjectDetails(row)}
            />

            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditProjectMasterData(row);
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Project"
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                </>

              </div>
            )}
          </div>
        )
      },
      {
        key: 'ProjectLocation',
        label: 'Project Location',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="180px"
            tooltipThreshold={18}
          />
        )
      },
      {
        key: 'CTSNumber',
        label: 'CTS Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'BussinessCategory',
        label: 'Business Category',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'ProjectStatus',
        label: 'Project Status',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'StateName',
        label: 'State',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewProjectDetails]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredProjectMasterColumnKeys: string[] = ['ProjectName'];

  const [selectedProjectMasterColumnKeys, setSelectedProjectMasterColumnKeys] = useState<string[]>([]);

  useEffect(() => {
    if (projectMasterColumns.length === 0) return;

    try {
      const saved = localStorage.getItem('projectMasterTableColumns');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const filtered = parsed.filter(k =>
          projectMasterColumns.some(col => col.key === k)
        );
        const final = Array.from(
          new Set([
            ...filtered,
            ...requiredProjectMasterColumnKeys,
          ])
        );
        setSelectedProjectMasterColumnKeys(final);
        return;
      }
    } catch { }

    const allKeys = projectMasterColumns.map(c => c.key);
    const final = Array.from(
      new Set([...allKeys, ...requiredProjectMasterColumnKeys])
    );
    setSelectedProjectMasterColumnKeys(final);
  }, [projectMasterColumns]);

  const visibleProjectMasterColumns = useMemo(
    () => projectMasterColumns.filter(col =>
      selectedProjectMasterColumnKeys.includes(col.key)
    ),
    [projectMasterColumns, selectedProjectMasterColumnKeys]
  );

  //#endregion

  //#region VIEW MODAL
  interface ViewProjectDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: ProjectMasterData | null
  }

  const ViewProjectDetailsModal: React.FC<ViewProjectDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="View Project Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
        size='large80'
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Basic Details
            </h4>
            <div className="space-y-3">
              <FieldItem label="Project Name" value={data.ProjectName} isRow />
              <FieldItem label="CTS Number" value={data.CTSNumber} isRow />
              <FieldItem label="Project Location" value={data.ProjectLocation} isRow />
              <FieldItem label="Business Category" value={data.BussinessCategory} isRow />
              <FieldItem label="Project Status" value={data.ProjectStatus} isRow />
              <FieldItem label="Is Redevelopment" value={data.IsRedevelopment ? 'Yes' : 'No'} isRow />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldItem label="Country" value={data.CountryName} isRow={false} />
              <FieldItem label="State" value={data.StateName} isRow={false} />
              <FieldItem label="District" value={data.DistrictName} isRow={false} />
              <FieldItem label="City" value={data.CityName} isRow={false} />
              <FieldItem label="PIN Code" value={data.ZipCode} isRow={false} />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Project Documentation
            </h4>
            <FieldItem label="RERA Number" value={data.RERANumber} isRow />
            <FieldItem label="RERA Certificate Date" value={data.RERACertificateDate ? formatDate_dd_MonthName_yy(data.RERACertificateDate) : '-'} isRow />
            <FieldItem label="RERA Completion Date" value={data.RERAComplitionDate ? formatDate_dd_MonthName_yy(data.RERAComplitionDate) : '-'} isRow />
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Project Financials
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FieldItem label="Project Estimate Cost" value={data.ProjectEstimateCost?.toString() || '-'} isRow={false} />
              <FieldItem label="On Going Budget Cost" value={data.OnGoingBudgetCost || '-'} isRow={false} />
              <FieldItem label="Project Area in Sqft" value={data.ProjectAreaInSqft || '-'} isRow={false} />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FieldItem label="Survey Date" value={data.SurveyDate ? formatDate_dd_MonthName_yy(data.SurveyDate) : '-'} isRow={false} />
              <FieldItem label="Expected Start Date" value={data.ExpectedStartDate ? formatDate_dd_MonthName_yy(data.ExpectedStartDate) : '-'} isRow={false} />
              <FieldItem label="Execution Start Date" value={data.ExecutionStartDate ? formatDate_dd_MonthName_yy(data.ExecutionStartDate) : '-'} isRow={false} />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Contact Information
            </h4>
            <FieldItem label="Site Contact Name" value={data.SiteContactName} isRow />
            <FieldItem label="Site Contact Mobile Number" value={data.SiteContactMobileNumber} isRow />
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldItem label="Created By" isRow={true} value={data.CreatedBy} />
                <FieldItem label="Created Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} />
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" isRow={true} value={data.ModifiedBy} />
                    <FieldItem label="Modified Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal >
    )
  }

  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadProjects(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadProjects(1, {})
    setShowFilterPopup(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...tempFilters }
    if (value.trim()) {
      newFilters[key] = value.trim()
    } else {
      delete newFilters[key]
    }
    setTempFilters(newFilters)
  }

  //#endregion

  //#region ADD/EDIT PROJECT MASTER DATA
  const handleAddProjectMaster = () => {
    setEditingProjectData(null);
    setProjectFormData({
      ProjectId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      ProjectName: '',
      ProjectLocation: '',
      ProjectPhotoURL: null,
      RemoveProjectPhotoURL: '',
      CTSNumber: '',
      IsRedevelopment: 0,
      BussinessCategory: '',
      ProjectShortName: '',
      CountryMasterId: 1,
      DistrictMasterId: 0,
      StateMasterId: 0,
      CityMasterId: 0,
      ZipCode: '',
      ProjectScope: '',
      ProjectEstimateCost: 0,
      ProjectAreaInSqft: 0,
      OnGoingBudgetCost: 0,
      SurveyDate: null,
      ExpectedStartDate: null,
      ExecutionStartDate: null,
      SiteContactMobileNumber: '',
      SiteContactName: '',
      ProjectStatus: '',
      RERANumber: '',
      RERACertificateDate: null,
      RERAComplitionDate: null,
      ProjectScheme: '',
      ProjectSubScheme: '',
      GoogleLocation: ''
    });
    setProjectPhotoFiles([]);
    setRemovedProjectPhotoUrls([]);
    setFormErrors({});
    setSelectedCountryId(1);
    setSelectedStateId(null);
    setSelectedDistrictId(null);
    setSelectedCityId(null);
    setIsAddEditModalOpen(true);
  }

  const handleEditProjectMasterData = (row: ProjectMasterData) => {
    setEditingProjectData(row);
    setProjectFormData({
      ProjectId: row.ProjectId || 0,
      Uniquekey: row.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      ProjectName: row.ProjectName || '',
      ProjectLocation: row.ProjectLocation || '',
      ProjectPhotoURL: null,
      RemoveProjectPhotoURL: '',
      CTSNumber: row.CTSNumber || '',
      IsRedevelopment: row.IsRedevelopment ? 1 : 0,
      BussinessCategory: row.BussinessCategory || '',
      ProjectShortName: row.ProjectShortName || '',
      CountryMasterId: row.CountryMasterId || 1,
      DistrictMasterId: row.DistrictMasterId || 0,
      StateMasterId: row.StateMasterId || 0,
      CityMasterId: row.CityMasterId || 0,
      ZipCode: row.ZipCode || '',
      ProjectScope: row.ProjectScope || '',
      ProjectEstimateCost: row.ProjectEstimateCost || 0,
      ProjectAreaInSqft: Number(row.ProjectAreaInSqft) || 0,
      OnGoingBudgetCost: Number(row.OnGoingBudgetCost) || 0,
      SurveyDate: row.SurveyDate,
      ExpectedStartDate: row.ExpectedStartDate,
      ExecutionStartDate: row.ExecutionStartDate,
      SiteContactMobileNumber: row.SiteContactMobileNumber || '',
      SiteContactName: row.SiteContactName || '',
      ProjectStatus: row.ProjectStatus || '',
      RERANumber: row.RERANumber || '',
      RERACertificateDate: row.RERACertificateDate,
      RERAComplitionDate: row.RERAComplitionDate,
      ProjectScheme: row.ProjectScheme || '',
      ProjectSubScheme: row.ProjectSubScheme || '',
      GoogleLocation: row.GoogleLocation || ''
    });
    setProjectPhotoFiles([]);
    setRemovedProjectPhotoUrls([]);
    setFormErrors({});
    setSelectedCountryId(row.CountryMasterId || 1);
    setSelectedStateId(row.StateMasterId || null);
    setSelectedDistrictId(row.DistrictMasterId || null);
    setSelectedCityId(row.CityMasterId || null);
    setIsAddEditModalOpen(true);
  }

  const handleFieldChange = (field: keyof AddUpdateProjectMasterRequest, value: string | number | null) => {
    setProjectFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateProjectForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!projectFormData.ProjectName?.trim()) {
      newErrors.ProjectName = "Project Name is required.";
    }

    if (!projectFormData.CTSNumber?.trim()) {
      newErrors.CTSNumber = "CTS Number is required.";
    }

    if (!projectFormData.ProjectLocation?.trim()) {
      newErrors.ProjectLocation = "Project Location is required.";
    }

    if (!projectFormData.StateMasterId) {
      newErrors.StateMasterId = "State is required.";
    }

    if (!projectFormData.DistrictMasterId) {
      newErrors.DistrictMasterId = "District is required.";
    }

    if (!projectFormData.CityMasterId) {
      newErrors.CityMasterId = "City is required.";
    }

    if (projectFormData.SiteContactMobileNumber && !isValidMobile(projectFormData.SiteContactMobileNumber)) {
      newErrors.SiteContactMobileNumber = "Enter a valid 10-digit mobile number.";
    }

    if (projectFormData.RERANumber && !isValidRERA(projectFormData.RERANumber)) {
      newErrors.RERANumber = "Enter a valid RERA Number.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushProjectFormData = (): FormData => {
    const fd = new FormData();
    fd.append('ProjectId', String(projectFormData.ProjectId ?? 0));
    fd.append('Uniquekey', projectFormData.Uniquekey ?? '');
    fd.append('ProjectName', projectFormData.ProjectName ?? '');
    fd.append('ProjectLocation', projectFormData.ProjectLocation ?? '');
    fd.append('CTSNumber', projectFormData.CTSNumber ?? '');
    fd.append('IsRedevelopment', String(projectFormData.IsRedevelopment ?? 0));
    fd.append('BussinessCategory', projectFormData.BussinessCategory ?? '');
    fd.append('ProjectShortName', projectFormData.ProjectShortName ?? '');
    fd.append('CountryMasterId', String(projectFormData.CountryMasterId ?? 0));
    fd.append('StateMasterId', String(projectFormData.StateMasterId ?? 0));
    fd.append('DistrictMasterId', String(projectFormData.DistrictMasterId ?? 0));
    fd.append('CityMasterId', String(projectFormData.CityMasterId ?? 0));
    fd.append('ZipCode', projectFormData.ZipCode ?? '');
    fd.append('ProjectScope', projectFormData.ProjectScope ?? '');
    fd.append('ProjectEstimateCost', String(projectFormData.ProjectEstimateCost ?? 0));
    fd.append('ProjectAreaInSqft', String(projectFormData.ProjectAreaInSqft ?? 0));
    fd.append('OnGoingBudgetCost', String(projectFormData.OnGoingBudgetCost ?? 0));
    fd.append('SurveyDate', projectFormData.SurveyDate ?? '');
    fd.append('ExpectedStartDate', projectFormData.ExpectedStartDate ?? '');
    fd.append('ExecutionStartDate', projectFormData.ExecutionStartDate ?? '');
    fd.append('SiteContactMobileNumber', projectFormData.SiteContactMobileNumber ?? '');
    fd.append('SiteContactName', projectFormData.SiteContactName ?? '');
    fd.append('ProjectStatus', projectFormData.ProjectStatus ?? '');
    fd.append('RERANumber', projectFormData.RERANumber ?? '');
    fd.append('RERACertificateDate', projectFormData.RERACertificateDate ?? '');
    fd.append('RERAComplitionDate', projectFormData.RERAComplitionDate ?? '');
    fd.append('ProjectScheme', projectFormData.ProjectScheme ?? '');
    fd.append('ProjectSubScheme', projectFormData.ProjectSubScheme ?? '');
    fd.append('GoogleLocation', projectFormData.GoogleLocation ?? '');

    projectPhotoFiles.forEach(file => {
      if (file instanceof File) {
        fd.append('ProjectPhotoURL', file);
      }
    });
    fd.append('RemoveProjectPhotoURL', removedProjectPhotoUrls.join(','));

    return fd;
  }

  const handleAddUpdateProjectMaster = async () => {
    setFormErrors({});

    const validation = validateProjectForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        const formData = PushProjectFormData();
        const response = await ProjectMasterService.apiCallAddUpdateProjectMaster(formData);

        if (E.isRight(response)) {
          const isAdd = projectFormData.ProjectId === 0;
          
          addToast({
            type: 'success',
            title: isAdd ? 'Project added successfully' : response.right.SuccessMessage?.[0] || 'Project updated successfully'
          });

          setIsAddEditModalOpen(false);
          
          setEditingProjectData(null);
          await loadProjects(pagination.currentPage, filters);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Operation failed' });
      },
      undefined,
      projectFormData.ProjectId === 0 ? 'Adding Project...' : 'Updating Project...'
    );
  }

  //#endregion



  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by project name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchProjects}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeProjectMasterColumnsModal(true)}
          isShowAddButton={canAction}
          isShowImportButton={canAction}
          isShowExportButton={canExport}
          onAdd={handleAddProjectMaster}
          onExportExcel={handleExportProjectExcel}
          onExportPdf={handleExportProjectPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={projectListForTable}
          columns={visibleProjectMasterColumns}
          pagination={projectMasterPaginationInfo}
          emptyMessage="No projects found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewProjectDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewProjectMasterDetailsData(null)
          }}
          data={viewProjectMasterDetailsData}
        />
        
        <Modal
          isOpen={isAddEditModalOpen}
          onClose={() => {
            setIsAddEditModalOpen(false)
            setEditingProjectData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddEditModalOpen(false)
            setEditingProjectData(null)
            setFormErrors({})
          }}
          title={editingProjectData ? 'Update Project Details' : 'Add Project Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateProjectMaster()
          }}
          saveText="Save"
          cancelText="Cancel"
          loading={isLoading}
          size="large80"
        >
          <div className="space-y-6">
            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Project Name"
                    required
                    error={formErrors.ProjectName}
                    type="text"
                    value={projectFormData.ProjectName}
                    onChange={(e) => handleFieldChange('ProjectName', e.target.value)}
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Input
                    label="CTS Number"
                    required
                    error={formErrors.CTSNumber}
                    type="text"
                    value={projectFormData.CTSNumber}
                    onChange={(e) => handleFieldChange('CTSNumber', e.target.value)}
                    placeholder="Enter CTS number"
                  />
                </div>
                <div>
                  <MultiFilePicker
                    label="Project Photo"
                    required
                    error={formErrors.ProjectPhotoURL}
                    value={projectPhotoFiles}
                    onChange={setProjectPhotoFiles}
                    availableFilesURL={editingProjectData?.ProjectPhotoURL ?? ""}
                    allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                    maxFiles={5}
                    maxSizeMB={10}
                  />
                </div>
                <div>
                  <SinglePageSelection
                    label="Country"
                    required
                    value={selectedCountryId || ''}
                    onChange={(val) => {
                      const id = Number(val);
                      setSelectedCountryId(id);
                      setSelectedStateId(null);
                      setSelectedDistrictId(null);
                      setSelectedCityId(null);
                      handleFieldChange('CountryMasterId', id);
                    }}
                    disabled={isLocationLoading}
                    options={countryOptions}
                  />
                </div>
                <div>
                  <SinglePageSelection
                    label="State"
                    required
                    error={formErrors.StateMasterId}
                    value={selectedStateId ?? ''}
                    onChange={(val) => {
                      const id = Number(val);
                      setSelectedStateId(id);
                      setSelectedDistrictId(null);
                      setSelectedCityId(null);
                      handleFieldChange('StateMasterId', id);
                    }}
                    disabled={!selectedCountryId || stateOptions.length === 0}
                    options={stateOptions}
                  />
                </div>
                <div>
                  <SinglePageSelection
                    label="District"
                    required
                    error={formErrors.DistrictMasterId}
                    value={selectedDistrictId ?? ''}
                    onChange={(val) => {
                      const id = Number(val);
                      setSelectedDistrictId(id);
                      setSelectedCityId(null);
                      handleFieldChange('DistrictMasterId', id);
                    }}
                    disabled={!selectedStateId || districtOptions.length === 0}
                    options={districtOptions}
                  />
                </div>
                <div>
                  <SinglePageSelection
                    label="City"
                    required
                    error={formErrors.CityMasterId}
                    value={selectedCityId ?? ''}
                    onChange={(val) => {
                      const id = Number(val);
                      setSelectedCityId(id);
                      handleFieldChange('CityMasterId', id);
                    }}
                    disabled={!selectedDistrictId || cityOptions.length === 0}
                    options={cityOptions}
                  />
                </div>
                <div>
                  <Input
                    label="PIN Code"
                    type="text"
                    value={projectFormData.ZipCode}
                    onChange={(e) => handleFieldChange('ZipCode', e.target.value)}
                    placeholder="Enter PIN code"
                  />
                </div>
                <div>
                  <Input
                    label="Business Category"
                    type="text"
                    value={projectFormData.BussinessCategory}
                    onChange={(e) => handleFieldChange('BussinessCategory', e.target.value)}
                    placeholder="Enter Bussiness category"
                  />
                </div>
                <div>
                  <Input
                    label="Project Location"
                    required
                    error={formErrors.ProjectLocation}
                    type="text"
                    value={projectFormData.ProjectLocation}
                    onChange={(e) => handleFieldChange('ProjectLocation', e.target.value)}
                    placeholder="Enter project location"
                  />
                </div>
                <div>
                  <Input
                    label="Google Location"
                    type="text"
                    value={projectFormData.GoogleLocation}
                    onChange={(e) => handleFieldChange('GoogleLocation', e.target.value)}
                    placeholder="Enter Google location"
                  />
                </div>
              </div>
            </div>

            {/* Scheme & Scope Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Scheme & Scope Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Project Scope"
                    type="text"
                    value={projectFormData.ProjectScope}
                    onChange={(e) => handleFieldChange('ProjectScope', e.target.value)}
                    placeholder="Enter project scope"
                  />
                </div>
                <div>
                  <Input
                    label="Project Scheme"
                    type="text"
                    value={projectFormData.ProjectScheme}
                    onChange={(e) => handleFieldChange('ProjectScheme', e.target.value)}
                    placeholder="Enter project scheme"
                  />
                </div>
                <div>
                  <Input
                    label="Project Sub Scheme"
                    type="text"
                    value={projectFormData.ProjectSubScheme}
                    onChange={(e) => handleFieldChange('ProjectSubScheme', e.target.value)}
                    placeholder="Enter project sub scheme"
                  />
                </div>
              </div>
            </div>

            {/* Project Documentation */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Documentation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="RERA Number"
                    error={formErrors.RERANumber}
                    type="text"
                    value={projectFormData.RERANumber}
                    onChange={(e) => handleFieldChange('RERANumber', filterRERA(e.target.value))}
                    placeholder="Enter RERA number"
                  />
                </div>
                <div>
                  <DatePickerInput
                    label="RERA Certificate Date"
                    value={formatDate_dd_mm_yyyy(projectFormData.RERACertificateDate)}
                    onChange={(val) => handleFieldChange('RERACertificateDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label="RERA Completion Date"
                    value={formatDate_dd_mm_yyyy(projectFormData.RERAComplitionDate)}
                    onChange={(val) => handleFieldChange('RERAComplitionDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  />
                </div>
              </div>
            </div>

            {/* Project Financials */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Project Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Project Estimate Cost"
                    type="number"
                    value={projectFormData.ProjectEstimateCost || ''}
                    onChange={(e) => handleFieldChange('ProjectEstimateCost', Number(e.target.value) || 0)}
                    placeholder="Enter estimate cost"
                  />
                </div>
                <div>
                  <Input
                    label="On Going Budget Cost"
                    type="number"
                    value={projectFormData.OnGoingBudgetCost || ''}
                    onChange={(e) => handleFieldChange('OnGoingBudgetCost', Number(e.target.value) || 0)}
                    placeholder="Enter budget cost"
                  />
                </div>
                <div>
                  <Input
                    label="Project Area in Sqft"
                    type="number"
                    value={projectFormData.ProjectAreaInSqft || ''}
                    onChange={(e) => handleFieldChange('ProjectAreaInSqft', Number(e.target.value) || 0)}
                    placeholder="Enter area in sqft"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <DatePickerInput
                    label="Survey Date"
                    value={formatDate_dd_mm_yyyy(projectFormData.SurveyDate)}
                    onChange={(val) => handleFieldChange('SurveyDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label="Expected Start Date"
                    value={formatDate_dd_mm_yyyy(projectFormData.ExpectedStartDate)}
                    onChange={(val) => handleFieldChange('ExpectedStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  />
                </div>
                <div>
                  <DatePickerInput
                    label="Execution Start Date"
                    value={formatDate_dd_mm_yyyy(projectFormData.ExecutionStartDate)}
                    onChange={(val) => handleFieldChange('ExecutionStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Site Contact Name"
                    type="text"
                    value={projectFormData.SiteContactName}
                    onChange={(e) => handleFieldChange('SiteContactName', e.target.value)}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Input
                    label="Site Contact Mobile Number"
                    error={formErrors.SiteContactMobileNumber}
                    type="text"
                    value={projectFormData.SiteContactMobileNumber}
                    maxLength={10}
                    onChange={(e) => handleFieldChange('SiteContactMobileNumber', filterMobile(e.target.value))}
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <SinglePageSelection
                    label="Project Status"
                    value={projectFormData.ProjectStatus}
                    onChange={(val) => handleFieldChange('ProjectStatus', String(val))}
                    options={PROJECT_STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  />
                </div>
              </div>
            </div>

            {/* Redevelopment Checkbox */}
            <div className="space-y-4">
              <Checkbox
                label="Is this project a Redevelopment Project?"
                checked={projectFormData.IsRedevelopment === 1}
                onChange={(e) => handleFieldChange('IsRedevelopment', e.target.checked ? 1 : 0)}
              />
            </div>
          </div>
        </Modal>

        <CustomizeColumnsModal
          isOpen={isShowCustomizeProjectMasterColumnsModal}
          onClose={() => setIsShowCustomizeProjectMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredProjectMasterColumnKeys])
            );
            setSelectedProjectMasterColumnKeys(withRequired);
            try {
              // Note: LocalStorageHelper method might need to be added
              localStorage.setItem('projectMasterTableColumns', JSON.stringify(withRequired));
            } catch { }
          }}
          columns={projectMasterColumns}
          selectedKeys={selectedProjectMasterColumnKeys}
          requiredKeys={requiredProjectMasterColumnKeys}
          title="Customize Project Master Table Columns"
        />

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Project Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  label='Project Name'
                  type="text"
                  value={tempFilters.ProjectName || ''}
                  onChange={(e) => handleFilterChange('ProjectName', e.target.value)}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Input
                  label='Project Location'
                  type="text"
                  value={tempFilters.ProjectLocation || ''}
                  onChange={(e) => handleFilterChange('ProjectLocation', e.target.value)}
                  placeholder="Enter project location"
                />
              </div>
              <div>
                <Input
                  label='CTS Number'
                  type="text"
                  value={tempFilters.CTCNumber || ''}
                  onChange={(e) => handleFilterChange('CTCNumber', e.target.value)}
                  placeholder="Enter CTS number"
                />
              </div>
            </div>
          </div>
        </Modal>


      </div>
    </>
  )
}

export default ProjectMaster

