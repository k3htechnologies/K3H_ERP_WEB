import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AddUpdateNoticeSectionMasterRequest, DeleteNoticeSectionMasterRequest, FilterWithPaginationNoticeSectionMasterRequest, NoticeSectionMasterData } from "@/features/noticeSectionMaster/models/NoticeSectionMasterModel";
import usePagination from "@/core/hooks/usePagination";
import { Loader } from "@/core/utils/loader";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useToast from "@/core/hooks/useToast";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { runApiWithLoader } from "@/core/utils";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import { noticeSectionMasterService } from "@/features/noticeSectionMaster/services/NoticeSectionMasterService";
import * as E from 'fp-ts/Either';
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import Tabs from "@/ui/components/Tab/Tab";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { Modal } from "@/ui/components/Modal/Modal";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { Button, Input } from "@/ui/components/forms";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { handleExportFile } from "@/core/utils/exportFile";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { fetchGovernmentComplianceDropdown } from "@/features/noticeSectionMaster/NoticeSectionDropdown";
import { Trash2 } from "lucide-react";

const initialFormState = (): AddUpdateNoticeSectionMasterRequest => ({
    NoticeSectionMasterId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    GovernmentCompliance: '',
    NoticeSection: ''
});

export const NoticeSectionMaster = () => {

    const [noticeSectionList, setNoticeSectionList] = useState<NoticeSectionMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
    const [filters, setFilters] = useState<FilterInfo>({});
    const [editingNoticeSectionMasterData, setEditingNoticeSectionMasterData] = useState<NoticeSectionMasterData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateNoticeSectionMasterRequest>(() => initialFormState());
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteNoticeSectionMasterData, setDeleteNoticeSectionMasterData] = useState<NoticeSectionMasterData | null>(null)
    const [viewNoticeSectionMasterData, setViewNoticeSectionMasterData] = useState<NoticeSectionMasterData | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { pagination, setPagination } = usePagination(20);

    const { addToast } = useToast();

    const hasFetchedInitialNoticeSectionMaster = useRef(false);

    const { canAction, canExport } = useMenuPermissions();

    const [searchTerm, setSearchTerm] = useState('');

    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchNoticeSectionMaster(value);
    }, 350);

    const noticeSectionTabList = [
        { id: "Income Tax", label: "Income Tax" },
        { id: "GST", label: "GST" },
        { id: "PT", label: "PT" },
        { id: "PF", label: "PF" },
        { id: "ESIC", label: "ESIC" },
        { id: "Other", label: "Other" },
    ];

    const [activeTab, setActiveTab] = useState<string>(noticeSectionTabList[0].id);

    useEffect(() => {
        if (hasFetchedInitialNoticeSectionMaster.current) return;
        hasFetchedInitialNoticeSectionMaster.current = true;
        fetchNoticeSectionList();
    }, []);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.();
        };
    }, [debouncedSearch]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingNoticeSectionMasterData) {
                setFormData({
                    NoticeSectionMasterId: editingNoticeSectionMasterData.NoticeSectionMasterId || 0,
                    Uniquekey: editingNoticeSectionMasterData.Uniquekey || initialFormState().Uniquekey,
                    GovernmentCompliance: editingNoticeSectionMasterData.GovernmentCompliance || '',
                    NoticeSection: editingNoticeSectionMasterData.NoticeSection || '',
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingNoticeSectionMasterData]);

    const fetchNoticeSectionList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadNoticeSections(page, filters, sort ?? sortInfo);
    };

    const loadNoticeSections = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationNoticeSectionMasterRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    IsCheckPermission: true,
                    NoticeSectionMasterId: filterParams.NoticeSectionMasterId ? Number(filterParams.NoticeSectionMasterId) : 0,
                    GovernmentCompliance: filterParams.GovernmentCompliance ?? activeTab,
                    NoticeSection: searchtext ?? filterParams.NoticeSection ?? undefined,
                    SortBy: getSortByParam(sortInfo ?? null, noticeSectionMasterColumns)
                }

                const response = await noticeSectionMasterService.apiCallPullNoticeSectionMaster(params);

                if (E.isRight(response)) {

                    setNoticeSectionList(response.right.Data);

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
            'Loading Notice Sections'
        )
    }

    const searchNoticeSectionMaster = async (searchValue: string) => {
        setSearchTerm(searchValue);

        const baseFilters: FilterInfo = {
            ...filters,
            GovernmentCompliance: filters.GovernmentCompliance || activeTab,
        };

        if (searchValue.trim() === '') {
            setFilters(baseFilters);
            await loadNoticeSections(1, baseFilters);
            return;
        }

        await loadNoticeSections(1, filters, sortInfo, searchValue)
    };

    const clearSearchNoticeSection = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        loadNoticeSections(1, { NoticeSection: '' }, sortInfo, undefined);
    };

    const handleExportNoticeSection = async (exportType: 'Excel' | 'PDF') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationNoticeSectionMasterRequest = {
                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    IsCheckPermission: true,
                    GovernmentCompliance: activeTab?.trim() || undefined,
                    NoticeSection: filters.NoticeSection?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, noticeSectionMasterColumns),
                    ExportType: exportType
                };

                const response = await noticeSectionMasterService.apiCallPullNoticeSectionMaster(params);

                handleExportFile(response, exportType, 'Notice Section Master', addToast);

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Export failed' });
            },
            undefined,
            'Preparing Export'
        );
    };

    const handleExportNoticeSectionExcel = () => handleExportNoticeSection('Excel');
    const handleExportNoticeSectionPdf = () => handleExportNoticeSection('PDF');

    const handlePageChange = (page: number) => {
        fetchNoticeSectionList(page);
    };

    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);

        const updatedFilters = {
            ...filters,
            GovernmentCompliance: filters.GovernmentCompliance || activeTab
        };

        loadNoticeSections(1, updatedFilters, sort, searchTerm || undefined);
    }, [filters, searchTerm, activeTab]);

    const noticeSectionMasterPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
    );

    const noticeSectionListForTable = useMemo(() => noticeSectionList, [noticeSectionList]);

    const handleViewNoticeSectionMasterDetails = useCallback((row: NoticeSectionMasterData) => {
        setViewNoticeSectionMasterData(row);
        setIsViewModalOpen(true);
    }, []);


    const handleEditNoticeSectionMaster = useCallback((row: NoticeSectionMasterData) => {
        setEditingNoticeSectionMasterData({
            ...row,
            GovernmentCompliance: row.GovernmentCompliance || activeTab,
            NoticeSection: row.NoticeSection || '',
        })
        setIsAddUpdateModalOpen(true);

    }, [])

    const handleConfirmationDialogBoxOpen = useCallback((row: NoticeSectionMasterData) => {
        setDeleteNoticeSectionMasterData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const noticeSectionMasterColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'NoticeSection',
                label: 'Notice Section',
                width: '30',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <div className="flex items-center justify-start">
                        <TooltipText
                            text={value || '-'}
                            maxWidth="320px"
                            tooltipThreshold={30}
                            onClick={() => handleViewNoticeSectionMasterDetails(row)}
                        />
                    </div>
                )
            },
            {
                key: 'actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',
                render: (_value, row: NoticeSectionMasterData) => {

                    const isDisabled = canAction;

                    return canAction ? (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row)
                                }}
                                color="transparent"
                                isborderRadius
                                disabled={isDisabled}
                                size="sm"
                                style={{
                                    color: isDisabled ? "#9CA3AF" : "red",
                                    padding: "4px 8px",
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    opacity: isDisabled ? 0.5 : 1,
                                }}
                                title="Delete Notice Section"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null;
                },
            }
        ],
        [handleViewNoticeSectionMasterDetails, handleEditNoticeSectionMaster, handleConfirmationDialogBoxOpen]
    )

    const requiredNoticeSectionMasterMasterColumnKeys: string[] = ['NoticeSection', 'Actions'];

    const allNoticeSectionMasterColumnKeys: string[] = noticeSectionMasterColumns.map(c => c.key)

    const [selectedNoticeSectionMasterColumnKeys, setSelectedNoticeSectionMasterColumnKeys] = useState<string[]>(() => {
        try {
            const saved = LocalStorageHelper.getNoticeSectionMasterTableColumns();
            if (saved) {
                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredNoticeSectionMasterMasterColumnKeys]));
                return withRequired.filter(k => allNoticeSectionMasterColumnKeys.includes(k));
            }
        } catch { }
        return allNoticeSectionMasterColumnKeys
    })

    useEffect(() => {

        setSelectedNoticeSectionMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredNoticeSectionMasterMasterColumnKeys])).filter(k => allNoticeSectionMasterColumnKeys.includes(k)));

    }, [noticeSectionMasterColumns.length])

    const visibleNoticeSectionMasterColumns = useMemo(
        () => noticeSectionMasterColumns.filter(col => selectedNoticeSectionMasterColumnKeys.includes(col.key)),
        [noticeSectionMasterColumns, selectedNoticeSectionMasterColumnKeys]
    )

    interface ViewNoticeSectionMasterModalProps {
        isOpen: boolean;
        onClose: () => void;
        data: NoticeSectionMasterData | null;
    }

    const ViewNoticeSectionMasterModal: React.FC<ViewNoticeSectionMasterModalProps> = ({ isOpen, onClose, data }) => {
        if (!data) return null;

        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Notice Section Details"
                onSubmit={e => {
                    e.preventDefault();
                    onClose();
                }}
                cancelText="Close"
                loading={false}
                size='lg'
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <FieldItem label="Government Compliance" value={data.GovernmentCompliance} isRow withBorder={true} />
                        <FieldItem label="Notice Section" value={data.NoticeSection} isRow withBorder={true} />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold pb-2">
                            Action Details
                        </h4>

                        <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

                        {data.ModifiedBy !== '' ?
                            <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />

                            :
                            ''}
                    </div>
                    <div className="flex justify-between items-center pt-4">

                        {canAction && (
                            <>
                                <Button
                                    color='red'
                                    variant='solid'
                                    colorMode="light"
                                    size='md'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setIsViewModalOpen(false)
                                        handleConfirmationDialogBoxOpen(data)
                                    }}
                                >
                                    Delete
                                </Button>

                                <Button
                                    color='blue'
                                    size='md'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setIsViewModalOpen(false)
                                        handleEditNoticeSectionMaster(data)
                                    }}
                                >
                                    Edit
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Modal>
        );
    };

    const handleFieldChange = (field: keyof AddUpdateNoticeSectionMasterRequest, value: any) => {

        setFormData((prev) => ({ ...prev, [field]: value }))

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    };

    const handleAddNoticeSectionModal = () => {
        setEditingNoticeSectionMasterData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const validateAddNoticeSectionMasterForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (formData.NoticeSection.trim() === "") {
            newErrors.NoticeSection = "Notice Section is required";
        }

        if (formData.GovernmentCompliance.trim() === "") {
            newErrors.GovernmentCompliance = "Government Compliance is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const PushNoticeSectionMasterFormData = (): AddUpdateNoticeSectionMasterRequest => {
        return {
            NoticeSectionMasterId: formData.NoticeSectionMasterId,
            Uniquekey: formData.Uniquekey,
            GovernmentCompliance: formData.GovernmentCompliance,
            NoticeSection: formData.NoticeSection
        };
    };

    const handleAddUpdateNoticeSectionMaster = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})

        const validation = validateAddNoticeSectionMasterForm()

        if (!validation.isValid) {

            setErrors(validation.errors)

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setLoadingMessage,
            async () => {

                const payload = PushNoticeSectionMasterFormData();

                const response = await noticeSectionMasterService.apiCallAddUpdateNoticeSectionMaster(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.NoticeSectionMasterId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as NoticeSectionMasterData

                        setNoticeSectionList(prevData => [newRecord, ...prevData]);

                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });


                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as NoticeSectionMasterData;

                        setNoticeSectionList(prevData =>
                            prevData.map(item =>
                                item.NoticeSectionMasterId === formData.NoticeSectionMasterId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setEditingNoticeSectionMasterData(null);
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

            Number(formData.NoticeSectionMasterId) === 0 ? 'Add Notice Section' : 'Update Notice Section'
        )

    };

    const handleDeleteNoticeSectionMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteNoticeSectionMasterData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,

            async () => {

                const params: DeleteNoticeSectionMasterRequest = {
                    NoticeSectionMasterId: deleteNoticeSectionMasterData.NoticeSectionMasterId ?? 0,
                    Uniquekey: deleteNoticeSectionMasterData.Uniquekey ?? ""
                }

                const response = await noticeSectionMasterService.apiCallDeleteNoticeSectionMaster(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (noticeSectionList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });

                    await loadNoticeSections(pageToShow, filters, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpen(false);

                    setDeleteNoticeSectionMasterData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });

                    setIsConfirmationDialogBoxOpen(false);
                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete Notice Section'
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Notice Section"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchNoticeSection}
                isShowFilterButton={false}
                isShowCustomizeButton={false}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddNoticeSectionModal}
                isShowImportButton={false}
                isShowExportButton={canExport && noticeSectionListForTable.length > 0}
                onExportExcel={handleExportNoticeSectionExcel}
                onExportPdf={handleExportNoticeSectionPdf}
                exportLoading={isLoading}
            />

            <Tabs
                tabs={noticeSectionTabList}
                defaultActive={activeTab}
                islarge={true}
                onTabChange={(t) => {
                    setActiveTab(t.id);
                    const newFilters: FilterInfo = {
                        ...filters,
                        GovernmentCompliance: t.id,
                    };

                    setFilters(newFilters);
                    loadNoticeSections(1, newFilters, sortInfo);
                }}
            />

            <div className='pt-5'>
                <DataTable
                    data={noticeSectionListForTable}
                    columns={visibleNoticeSectionMasterColumns}
                    pagination={noticeSectionMasterPaginationInfo}
                    emptyMessage="No Notice Sections Found"
                    recordsPerPage={20}
                    className="flex-1"
                    sortInfo={sortInfo}
                    onSort={handleSortColumn}
                />
                <ViewNoticeSectionMasterModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setViewNoticeSectionMasterData(null);
                    }}
                    data={viewNoticeSectionMasterData}
                />

                <Modal
                    isOpen={isAddUpdateModalOpen}
                    onClose={() => {
                        setIsAddUpdateModalOpen(false);
                        setEditingNoticeSectionMasterData(null);
                        setFormData(initialFormState());
                        setErrors({});
                    }}
                    onCancel={() => {
                        setIsAddUpdateModalOpen(false);
                        setEditingNoticeSectionMasterData(null);
                        setFormData(initialFormState());
                        setErrors({});
                    }}
                    title={editingNoticeSectionMasterData ? 'Update Notice Section' : 'Add Notice Section'}
                    onSubmit={handleAddUpdateNoticeSectionMaster}
                    saveText={editingNoticeSectionMasterData ? 'Update' : 'Add'}
                    loading={isLoading}
                    size='lg'
                >
                    <div className="space-y-10 p-6 bg-blue-100">
                        <div className="space-y-4" >
                            <div>
                                <div>
                                    <SingleSelectDropdownWithPagination
                                        label="Government Compliance"
                                        title="Select Government Compliance"
                                        size="lg"
                                        initialValue={
                                            formData.GovernmentCompliance
                                                ? { label: formData.GovernmentCompliance, value: formData.GovernmentCompliance }
                                                : undefined
                                        }
                                        dataFetchCallBack={fetchGovernmentComplianceDropdown}
                                        onSelected={(item) => {
                                            if (!item) {
                                                handleFieldChange("GovernmentCompliance", null);
                                                handleFieldChange("NoticeSection", null);
                                                handleFieldChange("NoticeSectionMasterId", 0);
                                                return;
                                            }
                                            handleFieldChange("GovernmentCompliance", item.value);
                                            handleFieldChange("NoticeSection", null);
                                            handleFieldChange("NoticeSectionMasterId", 0);
                                        }}
                                        error={errors.GovernmentCompliance}
                                    />
                                </div>
                            </div>

                            <div>
                                <Input
                                    label='Notice U/S'
                                    required
                                    error={errors.NoticeSection}
                                    type="text"
                                    value={formData.NoticeSection}
                                    maxLength={100}
                                    onChange={(e) => handleFieldChange('NoticeSection', e.target.value)}
                                    placeholder="Enter Notice U/S"
                                />
                            </div>
                        </div>
                    </div>
                </Modal>

                <DeleteDialog
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => {
                        setIsConfirmationDialogBoxOpen(false)
                        setDeleteNoticeSectionMasterData(null)
                    }}
                    onConfirm={handleDeleteNoticeSectionMaster}
                    loading={isLoading}
                    pageName='noticeSection'
                />
            </div>
        </div>
    );
};

export default NoticeSectionMaster;