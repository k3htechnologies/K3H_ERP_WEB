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
import { Download, Search, Trash2 } from 'lucide-react';
import type { AddUpdateApprovedBankFolderRequest, ApprovedBankFolderData, DeleteApprovedBankFolderRequest, FilterWithPaginationApprovedBankFolderRequest } from '@/features/approvedBank/models/ApprovedBankFolderModel';
import { approvedBankFolderService } from '@/features/approvedBank/services/ApprovedBankFolderService';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import Checkbox from '@/ui/components/forms/Checkbox';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { useApprovedBankListState } from '@/features/approvedBank/context/ApprovedBankListStateContext';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { handleExportFile } from '@/core/utils/exportFile';

const initialFormState = (): AddUpdateApprovedBankFolderRequest => ({
    ApprovedBankFolderId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BankListMasterId: '',
    ProjectId: 0
});

export const ApprovedBankFolder: React.FC = () => {

    //#region STATE MANAGEMENT
    const [approvedBankFolderList, setApprovedBankFolderList] = useState<ApprovedBankFolderData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // USE NAVIGATE
    const navigate = useNavigate();

    // PAGINATION STATE
    const { pagination, setPagination } = usePagination(20);

    const { projectId } = useProject();

    // TOAST
    const { addToast } = useToast();

    // SINGLE SEARCH 
    const [searchBankNameTerm, setSearchBankNameTerm] = useState('');

    //DELETE APPROVED BANK FOLDER 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteApprovedBankFolderData, setDeleteApprovedBankFolderData] = useState<ApprovedBankFolderData | null>(null)

    // ADD APPROVED BANK FOLDER
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<AddUpdateApprovedBankFolderRequest>(() => initialFormState());

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [bankListOptions, setBankListOptions] = useState<
        { label: string; value: string }[]
    >([]);

    const [selectedApprovedBankId, setSelectedApprovedBankId] = useState<string[]>([]);

    const { pagination: bankPagination, setPagination: setBankPagination } = usePagination(20);
    const [isFetchingMoreBank, setIsFetchingMoreBank] = useState(false);

    const visibleBankIds = bankListOptions.map(b => b.value).filter(Boolean) as string[];
    const isAllBankVisibleSelected = visibleBankIds.length > 0 && visibleBankIds.every(id => selectedApprovedBankId.includes(id));

    const toggleBankSelectAllVisible = () => {
        setSelectedApprovedBankId(prev => {
            let updated: string[];
            if (isAllBankVisibleSelected) {
                updated = prev.filter(id => !visibleBankIds.includes(id));
            } else {
                updated = Array.from(new Set([...prev, ...visibleBankIds]));
            }

            setFormData(f => ({
                ...f,
                ProjectId: Number(projectId),
                BankListMasterId: updated.join(',')
            }));

            return updated;
        });

        if (errors.BankListMasterId) {
            setErrors(e => ({ ...e, BankListMasterId: '' }));
        }
    };

    const searchBank = async (searchValue: string) => {
        setSearchBankNameTerm(searchValue);
        await loadBankList(1, searchValue);
    };

    const debouncedBankSearch = useDebouncedCallback((value: string) => {
        searchBank(value);
    }, 350);

    const loadBankList = async (page: number, searchValue: string = "") => {
        const response = await fetchBankListMasterDropdown(page, { value: searchValue.trim() });

        setBankListOptions(prev =>
            page === 1
                ? response.itemList
                : [...prev, ...(Array.isArray(response.itemList) ? response.itemList : [])]
        );

        setBankPagination({
            currentPage: page,
            totalRecords: response.totalNumberOfRecord,
            totalPages: Math.ceil(response.totalNumberOfRecord / bankPagination.pageSize),
        });
    };

    const handleBankListScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const threshold = 60;
        if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {
            if (bankPagination.currentPage < (bankPagination.totalPages || 0) && !isFetchingMoreBank) {
                const nextPage = bankPagination.currentPage + 1;
                setIsFetchingMoreBank(true);
                loadBankList(nextPage, searchBankNameTerm).finally(() => setIsFetchingMoreBank(false));
            }
        }
    };

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    //#region APPROVED BANK LIST STATE CONTEXT
    const { listState, updateListState, clearApprovedBankContext } = useApprovedBankListState();
    const { page, sortInfo, searchTerm } = listState;
    //#endregion

    //#region INIT
    useEffect(() => {

        if (!projectId) return

        if (searchTerm && searchTerm.trim()) {

            loadApprovedBankFolder(page, sortInfo, searchTerm?.trim());

        } else {

            loadApprovedBankFolder(page, sortInfo);
        }

    }, [projectId, page, sortInfo, searchTerm, clearApprovedBankContext]);

    useEffect(() => {

        setPagination({ currentPage: page });

    }, [page]);

    //#endregion

    const debouncedSearch = useDebouncedCallback((value: string) => {

        if (value.trim() === '') {

            updateListState({ searchTerm: '', page: 1 });
            return;
        }
        updateListState({ searchTerm: value, page: 1 });
    }, 350);
    //#endregion

    //#region DATA LOADING |  LOAD | SEARCH 
    const fetchApprovedBankFolderList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadApprovedBankFolder(page, sort, searchTerm);
    }

    const loadApprovedBankFolder = useCallback(async (page: number, sortInfo?: SortInfo, searchtext?: string) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationApprovedBankFolderRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    BankName: searchtext?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ApprovedBankFolderColumns)
                };

                const response = await approvedBankFolderService.apiCallPullApprovedBankFolder(params);
                if (E.isRight(response)) {
                    setApprovedBankFolderList(response.right.Data);
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
            'Loading Approved Bank'
        );
    }, [projectId, pagination.pageSize, addToast])
    //#endregion

    // #region Download
    const handleDownloadFolder = async (row: ApprovedBankFolderData, exportType: 'Zip' = 'Zip') => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationApprovedBankFolderRequest = {

                    PageNumber: 1,
                    PageSize: pagination.totalRecords,
                    ProjectId: Number(projectId) || 0,
                    ApprovedBankFolderId: row.ApprovedBankFolderId,
                    BankName: row.BankName ?? undefined,
                    ExportType: exportType,
                    SortBy: getSortByParam(sortInfo ?? null, ApprovedBankFolderColumns),
                };

                const response = await approvedBankFolderService.apiCallPullApprovedBankFolder(params);

                handleExportFile(response, exportType, row.BankName ?? 'Approved Bank', addToast);

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message || 'Export failed' }),
            undefined,
            'Preparing Download'
        );
    };


    //#region INIT
    useEffect(() => {

        if (!projectId) return;
        fetchApprovedBankFolderList(1);
    }, [projectId])
    //#endregion

    useEffect(() => {
        if (!isAddUpdateModalOpen) return;
        loadBankList(1, searchBankNameTerm);
    }, [isAddUpdateModalOpen]);

    // HANDLE ADD APPROVED BANK MODAL
    const handleAddBankModal = (bankId: string) => {
        setSelectedApprovedBankId(prev => {
            const updated = prev.includes(bankId)
                ? prev.filter(id => id !== bankId)
                : [...prev, bankId];

            setFormData(f => ({
                ...f,
                ProjectId: Number(projectId),
                BankListMasterId: updated.join(','),
            }));

            if (errors.BankListMasterId) {
                setErrors(e => ({ ...e, BankListMasterId: '' }));
            }
            return updated;
        });
    };
    //#endregion

    //#region SEARCH APPROVED BANK
    const searchApprovedBankFolder = async (searchValue: string) => {
        updateListState({ searchTerm: searchValue, page: 1 });
        await loadApprovedBankFolder(1, sortInfo, searchValue);
    };
    //#endregion

    //#region CLEAR 
    const clearSearchApprovedBankFolder = () => {
        updateListState({ searchTerm: '', page: 1 });
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });
        loadApprovedBankFolder(1, sortInfo, '');
    };

    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((newPage: number) => {
        updateListState({ page: newPage });
    }, [updateListState]);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        updateListState({ sortInfo: sort, page: 1 });
    }, [updateListState]);
    //#endregion

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteApprovedBankFolderData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteApprovedBankFolderData]);

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: ApprovedBankFolderData) => {
        setDeleteApprovedBankFolderData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE PAGINATION INFO
    const ApprovedBankFolderPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }),
        [pagination, handlePageChange]
    );
    const ApprovedBankFolderForTable = useMemo(() => approvedBankFolderList, [approvedBankFolderList]);
    //#endregion

    //#region NAVIGATE TO VIEW APPROVED BANK FILE
    const handleNavigateToView = useCallback((row: ApprovedBankFolderData) => {
        updateListState({ ApprovedBankFolderId: row.ApprovedBankFolderId ?? 0, BankName: row.BankName ?? '' });

        navigate('/approvedBank/approvedBankFile/');
    }, [navigate, updateListState]);

    //#region TABLE COLUMNS
    const ApprovedBankFolderColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'BankName',
            label: 'Bank Name',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value, row) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="500px"
                    tooltipThreshold={25}
                    onClick={() => handleNavigateToView(row)}
                />
            )
        },
        {
            key: 'NumberOfApprovedBankFile',
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
                    <div className="flex items-center justify-center gap-2">
                        {row.NumberOfApprovedBankFile === 0 ? (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleConfirmationDialogBoxOpen(row);
                                }}
                                color='transparent'
                                isborderRadius
                                size='sm'
                                style={{
                                    color: 'red', padding: '4px 8px'
                                }}
                                title="Delete Approved Bank"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                        ) : (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDownloadFolder(row);
                                }}
                                color='transparent'
                                isborderRadius
                                size='sm'
                                style={{
                                    color: 'blue', padding: '4px 8px'
                                }}
                                title="Download Documents"
                            >
                                <Download className='w-4 h-4' />
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen, canAction]);
    //#endregion

    const handleAddApprovedBankFolder = () => {
        setDeleteApprovedBankFolderData(null);
        setSelectedApprovedBankId([]);
        setFormData(() => {
            return {
                ...initialFormState(),
                ProjectId: Number(projectId),
            }
        });
        setBankListOptions([]);

        setSearchBankNameTerm('');
        setErrors({});
        setBankPagination({
            currentPage: 1,
            pageSize: bankPagination.pageSize,
            totalRecords: 0,
            totalPages: 0,
        });
        setIsAddUpdateModalOpen(true);
    }

    //PUSH FORM DATA
    const PushApprovedBankFolderFormData = (): AddUpdateApprovedBankFolderRequest => {
        return {
            BankListMasterId: formData.BankListMasterId,
            Uniquekey: formData.Uniquekey,
            ApprovedBankFolderId: formData.ApprovedBankFolderId,
            ProjectId: formData.ProjectId,
        };
    };

    // ADD UPDATE APPROVED BANK FOLDER
    const handleAddUpdateApprovedBankFolder = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushApprovedBankFolderFormData();
                const response = await approvedBankFolderService.apiCallAddUpdateApprovedBankFolder(payload);

                if (E.isRight(response)) {
                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ApprovedBankFolderId === 0;

                    if (isAdd) {
                        const newRecords = response.right.Data as ApprovedBankFolderData[];

                        if (newRecords && newRecords.length > 0) {
                            setApprovedBankFolderList(prevData => [
                                ...newRecords,
                                ...prevData
                            ]);

                            setPagination({
                                ...pagination,
                                totalRecords: pagination.totalRecords + newRecords.length,
                                totalPages: Math.ceil(
                                    (pagination.totalRecords + newRecords.length) / pagination.pageSize
                                )
                            });
                        }

                        addToast({
                            type: 'success',
                            title: response.right.SuccessMessage[0]
                        });
                    } else {
                        const updatedRecord =
                            response.right.Data[0] as ApprovedBankFolderData;

                        if (updatedRecord) {
                            setApprovedBankFolderList(prevData =>
                                prevData.map(item =>
                                    item.ApprovedBankFolderId === formData.ApprovedBankFolderId
                                        ? updatedRecord
                                        : item
                                )
                            );
                        }

                        addToast({
                            type: 'success',
                            title: response.right.SuccessMessage[0]
                        });
                    }
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
            'Add Approve Bank Folder'
        )
    };

    //#region DELETE APPROVED BANK FOLDER
    const handleDeleteApprovedBankFolder = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteApprovedBankFolderData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteApprovedBankFolderRequest = {

                    ApprovedBankFolderId: deleteApprovedBankFolderData.ApprovedBankFolderId || 0,

                    Uniquekey: deleteApprovedBankFolderData.Uniquekey || '',

                    ProjectId: deleteApprovedBankFolderData.ProjectId || 0
                };

                const response = await approvedBankFolderService.apiCallDeleteApprovedBankFolder(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (approvedBankFolderList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadApprovedBankFolder(pageToShow, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteApprovedBankFolderData(null);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Approved Bank"
        );
    };
    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            {/* ACTION TOOLBAR */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Bank Name"
                onSearchChange={searchApprovedBankFolder}
                onClearSearch={clearSearchApprovedBankFolder}

                // ADD
                isShowAddButton={canAction && (projectId ?? 0) > 0}
                addTitle="Add"
                onAdd={handleAddApprovedBankFolder}
            />

            {/*  APPROVED BANK FOLDER DATA TABLE*/}

            <DataTable
                data={ApprovedBankFolderForTable}
                columns={ApprovedBankFolderColumns}
                pagination={ApprovedBankFolderPaginationInfo}
                emptyMessage="No Approved Bank Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* ADD APPROVED BANK FOLDER MODAL */}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setSelectedApprovedBankId([]);
                    setBankListOptions([]);
                    setErrors({});
                    setSearchBankNameTerm('');
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setSelectedApprovedBankId([]);
                    setBankListOptions([]);
                    setErrors({});
                    setSearchBankNameTerm("");
                }}
                title='Add Bank'
                onSubmit={handleAddUpdateApprovedBankFolder}
                saveText='Add'
                loading={isLoading}
                size="large-half"
            >
                <div className="space-y-4">

                    <div className="px-2 py-2">

                        <div className="flex items-center gap-3 w-full">

                            <Checkbox id="select-all-banks"
                                checked={isAllBankVisibleSelected}
                                onChange={() => toggleBankSelectAllVisible()}
                            />

                            <div className="relative min-w-0 flex-1">
                                <Input
                                    type="text"
                                    value={searchBankNameTerm}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setSearchBankNameTerm(v);
                                        debouncedBankSearch(v);
                                    }}
                                    placeholder="Search By Bank Name"
                                    leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                                />
                            </div>

                            <span className="text-sm text-gray-600 whitespace-nowrap ml-auto">
                                {selectedApprovedBankId.length} selected
                            </span>

                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex-1 min-h-0 overflow-auto thin-scroll divide-y divide-gray-200" onScroll={handleBankListScroll} style={{ maxHeight: '55vh' }}>
                            {bankListOptions.length > 0 ? (
                                bankListOptions.map((bank, _i) => {
                                    const id = bank.value;
                                    const checked = selectedApprovedBankId.includes(id);

                                    return (
                                        <div key={id} className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer px-2"
                                            onClick={(ev) => {
                                                if ((ev.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                                                handleAddBankModal(id);
                                            }}>
                                            <div className="flex items-center">
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={() => handleAddBankModal(id)}
                                                    onClick={(ev) => ev.stopPropagation()}
                                                    aria-label={`Select ${bank.label}`}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-sm text-gray-800 whitespace-normal break-words">
                                                        {bank.label}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <NoDataView message="No bank found" />
                            )}

                            {isFetchingMoreBank && (
                                <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
                            )}
                        </div>
                    </div>
                </div>

            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteApprovedBankFolder}
                loading={isLoading}
                pageName='Approved Bank'
            />
        </div>
    );
};

export default ApprovedBankFolder;