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
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { Download, Edit, Trash2 } from 'lucide-react';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import type { AddUpdateMarketingContentFolderRequest, DeleteMarketingContentFolderRequest, FilterWithPaginationMarketingContentFolderRequest, MarketingContentFolderData } from '@/features/marketingContent/models/MarketingContentFolderModel';
import { marketingContentFolderService } from '@/features/marketingContent/services/MarketingContentFolderService';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';


const initialFormState = (): AddUpdateMarketingContentFolderRequest => ({
    MarketingContentFolderId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    MarketingContentFolderName: '',
    ProjectId: 0
});

export const MarketingContentFolder: React.FC = () => {

    //#region STATE MANAGEMENT
    const [marketingContentFolderList, setMarketingContentFolderList] = useState<MarketingContentFolderData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    //TABLE SORT INFO
    const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchMarketingContentFolder(value)
    }, 350);

    //DELETE MARKETING  CONTENT FOLDER 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteMarketingContentFolderData, setDeleteMarketingContentFolderData] = useState<MarketingContentFolderData | null>(null)

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // EDIT MARKETING CONTENT FOLDER  
    const [editingMarketingContentFolderData, setEditingMarketingContentFolderData] = useState<MarketingContentFolderData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //ADD UPDATE MARKETING CONTENT FOLDER  
    const [formData, setFormData] = useState<AddUpdateMarketingContentFolderRequest>(() => initialFormState());

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const location = useLocation();
    //#endregion

    //#region INIT
    useEffect(() => {
        const incoming = location.state?.listState;
        const listState = incoming ?? {
            page: 1, sortInfo: undefined, searchTerm: ''
        };

        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setSearchTerm(listState.searchTerm ?? '');

        if (listState.searchTerm && String(listState.searchTerm).trim()) {
            loadMarketingContentFolder(listState.page ?? 1, listState.sortInfo,
                String(listState.searchTerm).trim()
            ); return;
        }

        loadMarketingContentFolder(listState.page ?? 1, listState.filters ?? {});
    }, [location.state]);

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
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
    //#endregion

    //#region INIT
    useEffect(() => {
        if (!projectId) return;
        fetchMarketingContentFolderList(1, sortInfo);
    }, [projectId, sortInfo]);
    //#endregion

    //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

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
    //#endregion

    //#region SEARCH & CLEAR
    const searchMarketingContentFolder = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadMarketingContentFolder(1, sortInfo, searchValue);
    };
    //#endregion

    //#region CLEAR 
    const clearSearchMarketingContentFolder = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();

        setPagination({ currentPage: 1 });
        loadMarketingContentFolder(1, sortInfo, '');
    };
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {
        loadMarketingContentFolder(page, sortInfo, searchTerm);
    }, [searchTerm, sortInfo]);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadMarketingContentFolder(1, sort, searchTerm);

    }, [searchTerm]);
    //#endregion

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteMarketingContentFolderData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteMarketingContentFolderData]);

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: MarketingContentFolderData) => {
        setDeleteMarketingContentFolderData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE PAGINATION INFO
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
    //#endregion

    //#region NAVIGATE TO VIEW MARKETING CONTENT DOCUMENT
    const handleNavigateToView = (row: MarketingContentFolderData) => {
        navigate(
            `/content/contentDocument/${row.MarketingContentFolderId}`,
            { state: { MarketingContentData: row } }
        );
    };
    //#endregion

    //#region DOWNLOAD AS ZIP FILE
    const handleDownloadMarketingContentFolder = (row: MarketingContentFolderData) => {
        runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {
                const params = new URLSearchParams({
                    PageSize: '10',
                    PageNumber: '1',
                    ProjectId: String(row.ProjectId),
                    ExportType: 'ZIP',
                    MarketingContentFolderId: String(row.MarketingContentFolderId),
                }).toString();

                const response = await fetch(`/api/PullMarketingContent?${params}`);

                if (!response.ok) throw new Error('Download failed');

                const blob = await response.blob();

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${row.MarketingContentFolderName || 'Content'}_Documents.zip`;

                document.body.appendChild(link);
                link.click();
                link.remove();

                addToast({ type: 'success', title: 'File download successfully ' });

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message || 'Download failed' });
            },
            undefined,
            'Preparing Download'
        );
    };

    //#region TABLE COLUMNS
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
                    maxWidth="250px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'NumberOfMarketingContent',
            label: 'Document Count',
            width: '16',
            sortable: false,
            align: 'center',
            render: value => value || '0'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '12',
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

                        ) : (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDownloadMarketingContentFolder(row);
                                }}
                                color="transparent"
                                isborderRadius
                                size="sm"
                                style={{ color: 'blue', padding: '4px 8px' }}
                                title="Download Documents"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        )}

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
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
    //#endregion

    const handleFieldChange = (field: keyof AddUpdateMarketingContentFolderRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    const handleAddMarketingContentFolder = () => {
        setDeleteMarketingContentFolderData(null);
        setFormData(initialFormState());
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }

    //#region EDIT MARKETING CONTENT FOLDER
    const handleEditMarketingContentFolder = useCallback((row: MarketingContentFolderData) => {
        setEditingMarketingContentFolderData({
            ...row,
            MarketingContentFolderName: row.MarketingContentFolderName
        })
        setIsAddUpdateModalOpen(true);
    }, [])

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
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

    //PUSH FORM DATA
    const PushMarketingContentFolderFormData = (): AddUpdateMarketingContentFolderRequest => {
        return {
            MarketingContentFolderId: formData.MarketingContentFolderId,
            Uniquekey: formData.Uniquekey,
            MarketingContentFolderName: formData.MarketingContentFolderName,
            ProjectId: Number(projectId),
        };
    };

    // ADD UPDATE MARKETING CONTENT FOLDER
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
            'Add Content Folder'
        )
    };

    //#region DELETE MARKETING CONTENT FOLDER 
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
    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            {/* ACTION TOOLBAR */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Content Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchMarketingContentFolder}

                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddMarketingContentFolder}
            />

            {/* MARKETING CONTENT FOLDER DATA TABLE*/}

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
                title={editingMarketingContentFolderData ? 'Update Content' : 'Add Content'}
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
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteMarketingContentFolder}
                loading={isLoading}
                pageName='Content'
            />
        </div>
    );
};

export default MarketingContentFolder;
