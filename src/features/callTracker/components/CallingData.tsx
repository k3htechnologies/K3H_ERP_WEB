import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CallingDataData, FilterWithPaginationCallingDataRequest } from "@/features/callTracker/models/CallingDataModel";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import usePagination from "@/core/hooks/usePagination";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import type { FilterPullExcelSample } from "@/features/technical/models/TechnicalModel";
import { technicalService } from "@/features/technical/services/TechnicalService";
import { handleExportFile } from "@/core/utils/exportFile";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { updateFilter } from "@/core/utils/filterHelper";
import ExportImport from "@/ui/components/ExcelImport/ExcelImport";
import { Modal } from "@/ui/components/Modal/Modal";
import CustomizeColumnsModal from "@/ui/components/CustomizeColumns/CustomizeColumnsModal";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import { Loader } from "@/core/utils/loader";
import { callingDataService } from "@/features/callTracker/services/CallingDataService";
import * as E from 'fp-ts/Either';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { Button, Input } from "@/ui/components/forms";
import type { AddUpdateCallingDataRequest } from "@/features/callTracker/models/CallingDataModel";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { SUBSOURCE_TYPE_OPTIONS } from "@/core/constants";
import { TextArea } from "@/ui/components/forms/Textarea";
import { Edit, Mail, Phone } from "lucide-react";
import { filterEmail, filterMobile, isValidEmail, isValidMobile } from "@/core/utils/fileValidation";

export const CallingData: React.FC = () => {

    const initialFormStateForCallingData = (): AddUpdateCallingDataRequest => ({
        ProjectId: 0,
        CallingDataId: 0,
        Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        Name: '',
        MobileNumber: '',
        EmailId: '',
        Address: '',
        Source: ''
    })

    // STATE
    const [callingDataList, setCallingDataList] = useState<CallingDataData[]>([]);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo>();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isAddUpdateCallingDataModalOpen, setIsAddUpdateCallingDataModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateCallingDataRequest>(() => initialFormStateForCallingData());
    const [editingCallingData, setEditingCallingData] = useState<CallingDataData | null>(null);

    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [tempFilters, setTempFilters] = useState<FilterInfo>({});
    const [filters, setFilters] = useState<FilterInfo>({});

    const { canExport, canAction } = useMenuPermissions();

    const [showImportModal, setShowImportModal] = useState(false);

    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();

    const { addToast } = useToast();

    const [isShowCustomizeCallingDataColumnsModal, setIsShowCustomizeCallingDataColumnsModal] = useState(false);


    const fetchCallingData = async (page: number = pagination.currentPage) => {
        return await loadCallingData(page, filters);
    };

    const loadCallingData = useCallback(async (page: number = pagination.currentPage, filterParams: FilterInfo, sort?: SortInfo, searchText?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationCallingDataRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    Name: searchText ?? filterParams.Name?.trim() ?? undefined,
                    FromDate: filterParams.FromDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.FromDate) || undefined : undefined,
                    ToDate: filterParams.ToDate ? convert_dd_mm_yyyy_To_Yyyy_mm_dd(filterParams.ToDate) || undefined : undefined,
                    MobileNumber: filterParams.MobileNumber ?? undefined,
                    Source: filterParams.Source ?? undefined,
                    SortBy: getSortByParam(sort ?? null, CallingDataColumns),
                };

                const response = await callingDataService.apiCallPullCallingData(params);

                if (E.isRight(response)) {
                    setCallingDataList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Calling Data'
        );
    },
        [projectId, pagination.currentPage, pagination.pageSize, addToast, setPagination,]);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;

        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sortInfo, searchTerm);
    }, [projectId]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sortInfo, value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sortInfo, '');
    };


    const handlePageChange = (page: number) => {
        setPagination({ currentPage: page });
        loadCallingData(page, filters, sortInfo, searchTerm);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {

        setSortInfo(sort);
        setPagination({ currentPage: 1 });
        loadCallingData(1, filters, sort, searchTerm);

    }, [searchTerm]);


    const handleFieldChange = (field: keyof AddUpdateCallingDataRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleEditCallingData = useCallback((row: CallingDataData) => {
        setEditingCallingData({
            ...row,
            Name: row.Name
        })
        setIsAddUpdateCallingDataModalOpen(true);
    }, [])


    useEffect(() => {
        if (isAddUpdateCallingDataModalOpen) {
            if (editingCallingData) {
                setFormData({
                    CallingDataId: editingCallingData.CallingDataId ?? 0,
                    Uniquekey: editingCallingData.Uniquekey ?? initialFormStateForCallingData().Uniquekey,
                    Name: editingCallingData.Name ?? '',
                    MobileNumber: editingCallingData.MobileNumber ?? '',
                    EmailId: editingCallingData.EmailId ?? '',
                    Address: editingCallingData.Address ?? '',
                    Source: editingCallingData.Source ?? '',
                    ProjectId: Number(projectId) || 0
                });

            } else {
                setFormData(initialFormStateForCallingData());
            }
            setErrors({});
        }
    }, [isAddUpdateCallingDataModalOpen, editingCallingData, projectId]);

    const PushCallingDataRequest = (): AddUpdateCallingDataRequest => {
        return {
            CallingDataId: formData.CallingDataId,
            ProjectId: projectId || 0,
            Uniquekey: formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            Name: formData.Name,
            MobileNumber: formData.MobileNumber,
            EmailId: formData.EmailId,
            Address: formData.Address,
            Source: formData.Source
        };
    };

    const validationAddUpdateCallingData = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.Name || formData.Name.trim() === "") {
            newErrors.Name = "Name is required";
        }

        if (!formData.MobileNumber) {
            newErrors.MobileNumber = "Mobile Number is required";
        } else if (!isValidMobile(formData.MobileNumber)) {
            newErrors.MobileNumber = "Enter a valid 10-digit mobile number";
        }

        if (formData.EmailId !== "" && !isValidEmail(formData.EmailId!.trim())) {
            newErrors.EmailId = "Enter a Valid E-mail Id";

        }

        if (!formData.Source || formData.Source.trim() === "") {
            newErrors.Source = "Source is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddCallingData = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({})

        const validation = validationAddUpdateCallingData();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushCallingDataRequest();

                const response = await callingDataService.apiCallAddUpdateCallingData(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateCallingDataModalOpen(false);

                    const isAdd = formData.CallingDataId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data?.[0] as CallingDataData
                        setCallingDataList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    }
                    else {
                        const updatedRecord = response.right.Data[0] as CallingDataData;

                        setCallingDataList(prevData =>
                            prevData.map(item =>
                                item.CallingDataId === formData.CallingDataId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setFormData(initialFormStateForCallingData())
                    setEditingCallingData(null);
                } else {

                    addToast({ type: "error", title: response.left?.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Calling Data Added Successfully'
        )
    }

    const handleExportCallingData = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCallingDataRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    Name: filters.Name?.trim() || undefined,
                    ProjectId: Number(projectId),
                    SortBy: getSortByParam(sortInfo ?? null, CallingDataColumns),
                    ExportType: exportType
                };

                const response = await callingDataService.apiCallPullCallingData(params);

                handleExportFile(response, exportType, 'Calling Data', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Export'
        );
    };

    const handleExportCallingDataExcel = () => handleExportCallingData('Excel')
    const handleExportCallingDataPdf = () => handleExportCallingData('PDF')

    const uploadExcel = async (file: File, mergeExisting: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const fd = new FormData();

                fd.append("ExcelFile", file);
                fd.append("IsAllDelete", mergeExisting);
                fd.append("TableName", 'Calling Data');
                fd.append("ProjectId", String(projectId));

                const response = await technicalService.apiCallExcelImport(fd);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: "Excel imported sucessfully" })

                    fetchCallingData();

                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (err: any) => addToast({ type: "error", title: err.message }),
            undefined,
            "Importing Excel"
        );
    };

    const downloadExcelSampleCallingData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterPullExcelSample = {
                    TableName: 'CALLING DATA'
                }

                const response = await technicalService.apiCallPullExcelSample(params);

                handleExportFile(response, 'Excel', 'Calling Data', addToast, 'Sample file download successfully')

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' })
            },
            undefined,
            'Preparing Downloading'
        )
    }
    const handleDownloadExcelSampleCallingData = () => downloadExcelSampleCallingData()

    const CallingDataColumns = useMemo<TableColumn[]>(() => [

        {
            key: 'Name',
            label: 'Customer Name',
            width: '15',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: value => value || '-'
        },

        {
            key: 'MobileNumber',
            label: 'Mobile Number',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value ? `+91 ${value}` : '-'
        },
        {
            key: 'EmailId',
            label: 'E-mail Id',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: "ModifiedDate",
            label: "Last Modified Date",
            width: "33",
            sortable: false,
            align: "left",
            render: (value, row) =>
                value ? formatDate_dd_MonthName_yy(value) : row.CreatedDate ? formatDate_dd_MonthName_yy(row.CreatedDate) : "-",
        },
        {
            key: 'Source',
            label: 'Source',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'NoOfTimeCalling',
            label: 'No. of Time Calling',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Address',
            label: 'Address',
            width: '15',
            sortable: false,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'Actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {

                const isLocked = canAction && Number(row.NoOfTimeCalling) === 0;


                return (
                    <div className="flex items-center justify-center">

                        <Button
                            color="transparent"
                            size="sm"
                            disabled={!isLocked}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (!isLocked) return;
                                handleEditCallingData(row)
                            }}
                            style={{
                                color: !isLocked ? '#9CA3AF' : '',
                                padding: '4px 8px',
                                cursor: !isLocked ? 'not-allowed' : 'pointer',
                                opacity: !isLocked ? 0.5 : 1
                            }}
                            leftIcon={<Edit className="h-4 w-4" />}
                        />


                    </div>
                )
            }
        },
    ], [handleEditCallingData]);

    const requiredCallingDataColumnKeys: string[] = ['Name', 'Actions'];

    const allCallingDataColumnKeys: string[] = CallingDataColumns.map(c => c.key);

    const [selectedCallingDataColumnKeys, setSelectedCallingDataColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getCallingDataTableColumns?.();

            if (saved) {

                const parsed = JSON.parse(saved) as string[]

                const withRequired = Array.from(new Set([
                    ...parsed, ...requiredCallingDataColumnKeys]));

                return withRequired.filter(k => allCallingDataColumnKeys.includes(k));
            }
        } catch { }
        return allCallingDataColumnKeys;
    });

    useEffect(() => {
        setSelectedCallingDataColumnKeys(prev => Array.from(new Set([...prev, ...requiredCallingDataColumnKeys])).filter(k => allCallingDataColumnKeys.includes(k)));
    }, [CallingDataColumns.length])

    const visibleCallingDataColumns = useMemo(
        () => CallingDataColumns.filter(col => selectedCallingDataColumnKeys.includes(col.key)),
        [CallingDataColumns, selectedCallingDataColumnKeys]
    );

    //#region FILTER MODAL HELPERS
    const applyFilters = () => {
        setFilters(tempFilters);
        setPagination({ currentPage: 1 });

        loadCallingData(1, tempFilters);
        setShowFilterPopup(false);
    };
    //#endregion

    //#region Clear
    const clearFilters = () => {
        setTempFilters({});
        setFilters({});
        setPagination({ currentPage: 1 });

        loadCallingData(1, {}, sortInfo, searchTerm);
    };

    //#region HANDLE FILTER CHNAGE
    const handleFilterChange = (key: string, value: string) => {
        setTempFilters(prev => updateFilter(prev, key, value));
    }
    //#endregion

    //#region HANDLE ADD
    const handleAddCallingDataModal = () => {
        setIsAddUpdateCallingDataModalOpen(true);
        setFormData(initialFormStateForCallingData());
    }
    //#endregion

    //#region CALLING DATA TABLE PAGINATION INFO
    const CallingDataPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    )
    const CallingDataForTable = useMemo(() => callingDataList, [callingDataList]);
    //#endregion

    //#region
    return (
        <div>

            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Customer Name"
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}

                isShowFilterButton
                filters={filters}
                onOpenFilter={() => {
                    setTempFilters(filters);
                    setShowFilterPopup(true);
                }}

                isShowAddButton={canAction && Number(projectId) > 0 ? true : false}
                addTitle="Add"
                onAdd={handleAddCallingDataModal}

                isShowCustomizeButton
                onCustomize={() => {
                    setIsShowCustomizeCallingDataColumnsModal(true);
                }}

                isShowImportButton={canAction && Number(projectId) > 0 ? true : false}
                onDownloadSampleExcel={handleDownloadExcelSampleCallingData}
                onUploadExcel={() => setShowImportModal(true)}

                // EXPORT
                isShowExportButton={canExport && CallingDataForTable.length > 0}
                onExportExcel={handleExportCallingDataExcel}
                onExportPdf={handleExportCallingDataPdf}
                exportLoading={isLoading}
            />

            {/* DATA TABLE */}

            <DataTable
                data={CallingDataForTable}
                columns={visibleCallingDataColumns}
                pagination={CallingDataPaginationInfo}
                emptyMessage="No Calling Data Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* CALLING DATA CUSTOMIZE COLUMNS MODAL */}

            <CustomizeColumnsModal
                isOpen={isShowCustomizeCallingDataColumnsModal}
                onClose={() => setIsShowCustomizeCallingDataColumnsModal(false)}
                onApply={keys => {
                    const withRequired = Array.from(
                        new Set([...keys, ...requiredCallingDataColumnKeys])
                    );
                    setSelectedCallingDataColumnKeys(withRequired);

                    try {
                        LocalStorageHelper.storeCallingDataTableColumns?.(
                            JSON.stringify(withRequired)
                        );
                    } catch { }
                }}
                columns={CallingDataColumns}
                selectedKeys={selectedCallingDataColumnKeys}
                requiredKeys={requiredCallingDataColumnKeys}
                title="Customize Table Columns"
            />


            {/* FILTER MODAL FOR CALLING DATA */}

            <Modal
                isOpen={showFilterPopup}
                onClose={() => setShowFilterPopup(false)}
                title="Filter - Calling Data"
                onSubmit={e => {
                    e.preventDefault();
                    applyFilters();
                }}
                saveText="Apply "
                cancelText="Clear"
                onCancel={() => clearFilters()}
                resetText=""
                size="small-half"
            >
                <div className="space-y-4">
                    <div>

                        <Input
                            type="text"
                            label='Customer Name'
                            value={tempFilters.Name || ''}
                            onChange={e => handleFilterChange('Name', e.target.value)}
                            placeholder="Enter Name"
                            maxLength={100}
                        />
                    </div>
                    <div>

                        <Input
                            type="text"
                            label='Mobile Number'
                            value={tempFilters.MobileNumber || ''}
                            onChange={e => handleFilterChange('MobileNumber', e.target.value)}
                            placeholder="Enter Mobile Number"
                        />
                    </div>
                    <div>
                        <DatePickerInput
                            label='From Date'
                            value={tempFilters.FromDate || ''}
                            onChange={(value) => handleFilterChange('FromDate', value || '')}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label='To Date'
                            value={tempFilters.ToDate || ''}
                            onChange={(value) => handleFilterChange('ToDate', value || '')}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Source'
                            value={tempFilters.Source || ''}
                            onChange={e => handleFilterChange('Source', e.target.value)}
                            placeholder="Enter Source"
                        />
                    </div>

                </div>
            </Modal>

            <ExportImport
                open={showImportModal}
                onClose={() => setShowImportModal(false)}
                onUpload={(file, mergeExisting) => {
                    setShowImportModal(false);
                    uploadExcel(file, mergeExisting);
                }}
            />

            {/* ADD MODAL FOR CALLING DATA */}
            <Modal
                isOpen={isAddUpdateCallingDataModalOpen}
                onClose={() => {
                    setIsAddUpdateCallingDataModalOpen(false);
                    setEditingCallingData(null);
                    setFormData(initialFormStateForCallingData());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateCallingDataModalOpen(false);
                    setFormData(initialFormStateForCallingData());
                    setErrors({});
                }}
                title="Add Calling Data"
                saveText="Add"
                onSubmit={handleAddCallingData}
                size='xl'
            >
                <div className="space-y-4 p-6 bg-blue-100">
                    <div>
                        <Input
                            type="text"
                            label='Name'
                            value={formData.Name || ''}
                            onChange={e => handleFieldChange("Name", e.target.value)}
                            placeholder="Enter Name"
                            maxLength={70}
                            required
                            error={errors.Name}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            label='Mobile Number'
                            value={formData.MobileNumber || ''}
                            onChange={(e) => {
                                const mobile = filterMobile(e.target.value);
                                handleFieldChange("MobileNumber", mobile);
                            }}
                            placeholder="Enter Mobile Number"
                            required
                            leftIcon="+91"
                            rightIcon={<Phone className="h-4 w-4 text-gray-400" />}
                            error={errors.MobileNumber}
                            maxLength={10}
                        />
                    </div>
                    <div>
                        <Input
                            type="text"
                            label='Email Id'
                            value={formData.EmailId || ''}
                            error={errors.EmailId}
                            maxLength={250}
                            rightIcon={<Mail className="h-6 w-6 text-gray-400" />}
                            onChange={(e) => {
                                const emailId = filterEmail(e.target.value);
                                handleFieldChange("EmailId", emailId);
                            }}
                            placeholder="Enter Valid E-mail Id"
                        />
                    </div>
                    <div>
                        <TextArea
                            label='Address'
                            value={formData.Address || ''}
                            onChange={e => handleFieldChange("Address", e.target.value)}
                            placeholder="Enter Address"
                        />
                    </div>

                    <div>
                        <SinglePageSelection
                            label="Source"
                            required
                            placeholder='Select Source'
                            value={formData.Source || ''}
                            onChange={(e) => {
                                handleFieldChange('Source', String(e));
                            }}
                            options={SUBSOURCE_TYPE_OPTIONS.map((opt) => ({ label: opt.name, value: opt.id }))}
                            error={errors.Source}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
export default CallingData;