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

    //#region INIT
    useEffect(() => {

        if (!projectId) return;
        fetchApprovedBankFolderList(1);
    }, [projectId])
    //#endregion

    useEffect(() => {
        if (!isAddUpdateModalOpen) return;
        const loadBankList = async () => {

            const response = await fetchBankListMasterDropdown(1);
            setBankListOptions(response.itemList);
        };
        loadBankList();
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
                    maxWidth="250px"
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
    ], [handleNavigateToView, handleConfirmationDialogBoxOpen]);
    //#endregion

    const handleAddApprovedBankFolder = () => {
        setDeleteApprovedBankFolderData(null);
        setSelectedApprovedBankId([]);
        setFormData(initialFormState());

        setSearchBankNameTerm('');
        setErrors({});
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

                        const newRecord = response.right.Data[0] as ApprovedBankFolderData
                        setApprovedBankFolderList(prevData => [newRecord, ...prevData]);

                        fetchApprovedBankFolderList();
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {

                        const updatedRecord = response.right.Data[0] as ApprovedBankFolderData;

                        setApprovedBankFolderList(prevData =>
                            prevData.map(item =>
                                item.ApprovedBankFolderId === formData.ApprovedBankFolderId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
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
                isShowAddButton={canAction}
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
                    setErrors({});
                    setSearchBankNameTerm('');
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setSearchBankNameTerm("");
                }}
                title='Add Bank'
                onSubmit={handleAddUpdateApprovedBankFolder}
                saveText='Add'
                loading={isLoading}
                size="small-half"
            >
                <div className=" space-y-4 ">

                    <Input
                        type="text"
                        placeholder="Search by Bank Name"
                        value={searchBankNameTerm}
                        onChange={e => {
                            setSearchBankNameTerm(e.target.value);
                        }}
                        leftIcon={<Search className="h-8 w-8 pb-1 text-gray-400" />}
                        className="w-full p-12 border border-gray-300 rounded mb-1"
                    />

                    <div className="overflow-x-auto thin-scroll">
                        {bankListOptions
                            .filter(bank =>
                                bank.label.toLowerCase().includes(searchBankNameTerm.toLowerCase())
                            ).length === 0 ? (
                            <div className="flex items-center justify-center h-100 text-gray-500 text-sm">
                                <NoDataView />
                            </div>

                        ) : (
                            bankListOptions
                                .filter(bank =>
                                    bank.label.toLowerCase().includes(searchBankNameTerm.toLowerCase())
                                )
                                .map(bank => {
                                    const checked = selectedApprovedBankId.includes(bank.value);
                                    return (
                                        <label
                                            key={bank.value}
                                            className="flex items-center justify-between gap-2 px-6 py-3 border-b border-blue-200 cursor-pointer last:border-b-0"
                                        >
                                            <span className="text-sm text-gray-800">{bank.label}</span>
                                            <Checkbox
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => handleAddBankModal(bank.value)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </label>
                                    );
                                })
                        )}
                    </div>
                </div>

            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteApprovedBankFolder}
                loading={isLoading}
                pageName='Approved Bank Folder'
            />
        </div>
    );
};

export default ApprovedBankFolder;
