import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { Download, Edit, Trash2 } from 'lucide-react';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import type { AddUpdateMarketingContentFolderRequest, DeleteMarketingContentFolderRequest, FilterWithPaginationMarketingContentFolderRequest, MarketingContentFolderData } from '@/features/marketingContent/models/MarketingContentFolderModel';
import { marketingContentFolderService } from '@/features/marketingContent/services/MarketingContentFolderService';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useMarketingContentListState } from '@/features/marketingContent/context/MarketingContentListStateContext';
import type { FilterWithPaginationMarketingContentRequest } from '@/features/marketingContent/models/MarketingContentModel';
import { marketingContentService } from '@/features/marketingContent/services/MarketingContentService';
import { handleExportFile } from '@/core/utils/exportFile';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';


const initialFormState = (): AddUpdateMarketingContentFolderRequest => ({
    MarketingContentFolderId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    MarketingContentFolderName: '',
    ProjectId: 0
});

export const MarketingContentFolder: React.FC = () => {
    const [marketingContentFolderList, setMarketingContentFolderList] = useState<MarketingContentFolderData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();
    const { addToast } = useToast();
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteMarketingContentFolderData, setDeleteMarketingContentFolderData] = useState<MarketingContentFolderData | null>(null)
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [editingMarketingContentFolderData, setEditingMarketingContentFolderData] = useState<MarketingContentFolderData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateMarketingContentFolderRequest>(() => initialFormState());
    const { canAction, canExport } = useMenuPermissions();
    const { listState, updateListState, clearMarketingContentContext } = useMarketingContentListState();
    const { page, sortInfo, searchTerm } = listState;

    useEffect(() => {

        if (!projectId) return

        if (searchTerm && searchTerm.trim()) {

            loadMarketingContentFolder(page, sortInfo, searchTerm?.trim());

        } else {

            loadMarketingContentFolder(page, sortInfo);
        }

    }, [projectId, page, sortInfo, searchTerm, clearMarketingContentContext]);

    useEffect(() => {

        setPagination({ currentPage: page });

    }, [page]);

    const debouncedSearch = useDebouncedCallback((value: string) => {

        if (value.trim() === '') {

            updateListState({ searchTerm: '', page: 1 });
            return;
        }
        updateListState({ searchTerm: value, page: 1 });
    }, 350);

    const fetchMarketingContentFolderList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadMarketingContentFolder(page, sort, searchTerm);
    }

    const loadMarketingContentFolder = useCallback(async (page: number, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationMarketingContentFolderRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    MarketingContentFolderName: searchtext?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, MarketingContentFolderColumns)
                };

                const response = await marketingContentFolderService.apiCallPullMarketingContentFolder(params);
                if (E.isRight(response)) {

                    setMarketingContentFolderList(response.right.Data);
                    setPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Content Folder'
        );
    }, [projectId, pagination.pageSize, addToast])



    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingMarketingContentFolderData) {
                setFormData({
                    MarketingContentFolderId: editingMarketingContentFolderData.MarketingContentFolderId || 0,
                    Uniquekey: editingMarketingContentFolderData.Uniquekey || initialFormState().Uniquekey,
                    MarketingContentFolderName: editingMarketingContentFolderData.MarketingContentFolderName || "",
                    ProjectId: Number(projectId)
                });
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingMarketingContentFolderData]);

    const searchMarketingContentFolder = (searchValue: string) => {
        updateListState({ searchTerm: searchValue, page: 1 });
    };

    const clearSearchMarketingContentFolder = () => {

        debouncedSearch.cancel?.();

        updateListState({ searchTerm: '', page: 1 });
    };

    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);



    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState]);

    const handleConfirmationDialogBoxOpen = useCallback((row: MarketingContentFolderData) => {
        setDeleteMarketingContentFolderData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const ApprovedBankPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );
    const ApprovedBankForTable = useMemo(() => marketingContentFolderList, [marketingContentFolderList]);

    const handleNavigateToView = useCallback((row: MarketingContentFolderData) => {

        updateListState({ MarketingContentFolderId: row.MarketingContentFolderId ?? 0, MarketingContentFolderName: row.MarketingContentFolderName ?? '' });
        navigate('/content/contentDocument/');
    }, [navigate, updateListState]);

    const handleEditMarketingContentFolder = useCallback((row: MarketingContentFolderData) => {
        setEditingMarketingContentFolderData({
            ...row,
            MarketingContentFolderName: row.MarketingContentFolderName
        })
        setIsAddUpdateModalOpen(true);
    }, [])

    const handleDownloadFolder = async (row: MarketingContentFolderData, exportType: 'ZIP' = 'ZIP') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationMarketingContentRequest = {

                    PageNumber: 1,
                    PageSize: row.NumberOfMarketingContent || 0,
                    ProjectId: Number(projectId) || 0,
                    MarketingContentFolderId: row.MarketingContentFolderId || 0,
                    ExportType: exportType,
                    SortBy: getSortByParam(sortInfo ?? null, MarketingContentFolderColumns),
                };

                const response = await marketingContentService.apiCallPullMarketingContent(params);

                handleExportFile(response, exportType, row.MarketingContentFolderName ?? 'Marketing Content Folder', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Download'
        );
    };

    const MarketingContentFolderColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'MarketingContentFolderName',
            label: 'Content Name',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="400px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'NumberOfMarketingContent',
            label: 'Document Count',
            width: '10',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'ModifiedBy',
            label: 'Last Modified By',
            width: '10',
            sortable: false,
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || row.CreatedBy || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'ModifiedDate',
            label: 'Last Modified Date',
            width: '10',
            sortable: false,
            align: 'center',
            render: (value, row) =>
                value
                    ? formatDate_dd_MonthName_yy_hh_mm(value)
                    : row.CreatedDate
                        ? formatDate_dd_MonthName_yy_hh_mm(row.CreatedDate)
                        : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '10',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => {
                if (!canAction) return null;

                return (
                    <div className="flex items-center justify-center gap-4">

                        {row.NumberOfMarketingContent === 0 ? (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: 'red', padding: '4px 8px' }}
                                title="Delete Content Folder"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                        ) : row.NumberOfMarketingContent > 0 && canExport ? (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDownloadFolder(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: 'blue', padding: '4px 8px' }}
                                title="Download Documents"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        ) : null}

                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditMarketingContentFolder(row);
                            }}
                            color="transparent"
                            isborderRadius
                            size="sm"
                            style={{ color: 'blue', padding: '4px 8px' }}
                            title="Edit Content Folder"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [handleNavigateToView, handleEditMarketingContentFolder, canAction, canExport, handleConfirmationDialogBoxOpen, handleDownloadFolder]);

    const handleFieldChange = (field: keyof AddUpdateMarketingContentFolderRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddMarketingContentFolder = () => {
        setDeleteMarketingContentFolderData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    const validateAddMarketingContentFolderForm = (): {

        isValid: boolean
        errors: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}

        if (!formData.MarketingContentFolderName?.trim()) {

            newErrors.MarketingContentFolderName = "Content Name is required.";

        } else if (formData.MarketingContentFolderName.trim().length < 3) {

            newErrors.MarketingContentFolderName = "Content Name must be at least 3 characters long."
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }
    const PushMarketingContentFolderFormData = (): AddUpdateMarketingContentFolderRequest => {
        return {
            MarketingContentFolderId: formData.MarketingContentFolderId,
            Uniquekey: formData.Uniquekey,
            MarketingContentFolderName: formData.MarketingContentFolderName,
            ProjectId: Number(projectId),
        };
    };
    const handleAddUpdateMarketingContentFolder = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddMarketingContentFolderForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushMarketingContentFolderFormData();

                const response = await marketingContentFolderService.apiCallAddUpdateMarketingContentFolder(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.MarketingContentFolderId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as MarketingContentFolderData

                        fetchMarketingContentFolderList()
                        setMarketingContentFolderList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {

                        const updatedRecord = response.right.Data[0] as MarketingContentFolderData;

                        setMarketingContentFolderList(prevData =>
                            prevData.map(item =>
                                item.MarketingContentFolderId === formData.MarketingContentFolderId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingMarketingContentFolderData(null);
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
            'Add Content Name'
        )
    };
    const handleDeleteMarketingContentFolder = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteMarketingContentFolderData) return;

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteMarketingContentFolderRequest = {

                    MarketingContentFolderId: deleteMarketingContentFolderData.MarketingContentFolderId || 0,

                    Uniquekey: deleteMarketingContentFolderData.Uniquekey || "",

                    ProjectId: deleteMarketingContentFolderData.ProjectId || 0
                };

                const response = await marketingContentFolderService.apiCallDeleteMarketingContentFolder(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (marketingContentFolderList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadMarketingContentFolder(pageToShow, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteMarketingContentFolderData(null);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Content Folder"
        );
    };

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            {/* ACTION TOOLBAR */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Content Name"
                onSearchChange={searchMarketingContentFolder}
                onClearSearch={clearSearchMarketingContentFolder}
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMarketingContentFolder}
            />

            <DataTable
                data={ApprovedBankForTable}
                columns={MarketingContentFolderColumns}
                pagination={ApprovedBankPaginationInfo}
                emptyMessage="No Content Folder Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* ADD MARKETING CONTENT FOLDER MODAL */}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingMarketingContentFolderData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingMarketingContentFolderData(null);
                    setFormData(initialFormState());
                    setErrors({});
                }}
                title={editingMarketingContentFolderData ? 'Update Content Name' : 'Add Content Name'}
                onSubmit={handleAddUpdateMarketingContentFolder}
                saveText={editingMarketingContentFolderData ? 'Update ' : 'Add '}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <Input
                                label='Content Name'
                                required
                                type="text"
                                value={formData.MarketingContentFolderName ?? ''}
                                onChange={(e) => handleFieldChange("MarketingContentFolderName", e.target.value)}
                                error={errors.MarketingContentFolderName}
                                maxLength={250}
                                placeholder="Enter Content Name "
                            />
                        </div>

                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}
            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteMarketingContentFolderData(null);
                }}
                onConfirm={handleDeleteMarketingContentFolder}
                loading={isLoading}
                pageName='Marketing Content Folder'
            />
        </div>
    );
};

export default MarketingContentFolder;
