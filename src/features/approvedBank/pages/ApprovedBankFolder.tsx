import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { Download, Search, Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import type { AddUpdateApprovedBankFolderRequest, ApprovedBankFolderData, DeleteApprovedBankFolderRequest, FilterWithPaginationApprovedBankFolderRequest } from '@/features/approvedBank/models/ApprovedBankFolderModel';
import { approvedBankFolderService } from '@/features/approvedBank/services/ApprovedBankFolderService';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import Checkbox from '@/ui/components/forms/Checkbox';

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
    const [isLoadingMessage, setIsLoadingMessage] = useState('');

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
        searchApprovedBankFolder(value)
    }, 350);

    // SINGLE SEARCH 
    const [searchBankNameTerm, setSearchBankNameTerm] = useState('');

    //FILTER STATES
    const [filters, setFilters] = useState<FilterInfo>({});

    //DELETE APPROVED BANK FOLDER 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteApprovedBankFolderData, setDeleteApprovedBankFolderData] = useState<ApprovedBankFolderData | null>(null)

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    // ADD APPROVED BANK 
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    const [formData, setFormData] = useState<AddUpdateApprovedBankFolderRequest>(() => initialFormState());

    // RESET KEY
    const [resetKey, setResetKey] = useState(0);
    //#endregion

    const [bankListOptions, setBankListOptions] = useState<
        { label: string; value: string }[]
    >([]);

    const [selectedApprovedBankId, setSelectedApprovedBankId] = useState<string[]>([]);

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const location = useLocation();
    //#endregion

    //#region INIT
    useEffect(() => {
        const incoming = location.state?.listState;
        const listState = incoming ?? {
            page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: ''
        };

        setPagination({ currentPage: listState.page ?? pagination.currentPage });

        setSortInfo(listState.sortInfo);

        setFilters(listState.filters ?? {});

        setSearchTerm(listState.searchTerm ?? '');

        if (listState.searchTerm && String(listState.searchTerm).trim()) {

            loadApprovedBankFolder(listState.page ?? 1, { BankName: String(listState.searchTerm).trim() });
            return;
        }
        loadApprovedBankFolder(listState.page ?? 1, listState.filters ?? {});
    }, [location.state]);

    //#region DATA LOADING | FETCH |  LOAD | SEARCH 
    const fetchApprovedBankFolderList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
        return await loadApprovedBankFolder(page, filters, sort);
    }

    const loadApprovedBankFolder = useCallback(async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {
                let sortByParam = undefined;

                if (sortInfo) {

                    const column = ApprovedBankFolderColumns.find(col => col.key === sortInfo.column);
                    if (column) {
                        sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
                    }
                }
                const params: FilterWithPaginationApprovedBankFolderRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ApprovedBankFolderId: filterParams.ApprovedBankFolderId ? Number(filterParams.ApprovedBankFolderId) : undefined,
                    BankName: filterParams.BankName?.trim() || undefined,
                    SortBy: sortByParam
                };

                const response = await approvedBankFolderService.apiCallPullApprovedBankWithFolder(params);
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
        fetchApprovedBankFolderList();

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

    // HANDLE ADD APPROVED BANK 
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

    //#region SEARCH & CLEAR
    const searchApprovedBankFolder = async (searchValue: string) => {

        setSearchTerm(searchValue);
        if (searchValue.trim() === '') {
            fetchApprovedBankFolderList();
            return
        }
        const filterParams: FilterInfo = {
            BankName: searchValue.trim(),
        };
        await loadApprovedBankFolder(1, filterParams);
    };
    //#endregion

    //#region CLEAR 
    const clearSearchApprovedBankFolder = () => {
        setSearchTerm('');

        debouncedSearch.cancel?.();
        setFilters({});

        setPagination({ currentPage: 1 });
        loadApprovedBankFolder(1, {});
        try {
            navigate(location.pathname, { replace: true, state: {} });
        } catch {
        }
    };
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {
        fetchApprovedBankFolderList(page);
    }, []);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadApprovedBankFolder(1, filters, sort);

    }, [filters]);
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
    const ApprovedBankForTable = useMemo(() => approvedBankFolderList, [approvedBankFolderList]);
    //#endregion

    //#region NAVIGATE TO VIEW APPROVED BANK FILE
    const handleNavigateToView = (row: ApprovedBankFolderData) => {
        navigate(
            `/approvedBank/approvedBankFile/${row.ApprovedBankFolderId}`,
            {
                state: {
                    ApprovedBankData: row,
                    listState: {
                        page: pagination.currentPage,
                        filters,
                        sortInfo,
                        searchTerm,
                    }
                }
            }
        );
    };

    //#region DOWNLOAD AS ZIP FILE
    const handleDownloadApprovedBankFolder = (row: ApprovedBankFolderData) => {

        runApiWithLoader(

            setIsLoading,
            setIsLoadingMessage,

            async () => {
                const params = new URLSearchParams({
                    PageSize: '100',
                    PageNumber: '1',
                    ProjectId: String(row.ProjectId),
                    ExportType: 'ZIP',
                    ApprovedBankFolderId: String(row.ApprovedBankFolderId),
                });

                const response = await fetch(`/api/PullApprovedBankFile?${params}`);

                if (!response.ok) throw new Error('Download failed');

                const blob = await response.blob();

                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${row.BankName || 'ApprovedBank'}_Documents.zip`;

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

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: ApprovedBankFolderData) => {
        setDeleteApprovedBankFolderData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

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
                    text={value || 'N/A'}
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
                                    handleDownloadApprovedBankFolder(row);
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

    //#region COLUMN CUSTOMIZATION
    const requiredApprovedBankFolderColumnKeys: string[] = ['BankName'];

    const allApprovedBankFolderColumnKeys: string[] = ApprovedBankFolderColumns.map(c => c.key);

    const [selectedApprovedBankFolderColumnKeys, setSelectedApprovedBankFolderColumnKeys] = useState<string[]>(() => {
        try {

            const saved = LocalStorageHelper.getApprovedBankFolderTableColumns?.();

            if (saved) {
                const parsed = JSON.parse(saved) as string[]
                const withRequired = Array.from(new Set([...parsed, ...requiredApprovedBankFolderColumnKeys]));

                return withRequired.filter(k => allApprovedBankFolderColumnKeys.includes(k));
            }
        } catch { }
        return allApprovedBankFolderColumnKeys;
    });

    useEffect(() => {
        setSelectedApprovedBankFolderColumnKeys(prev => Array.from(new Set([...prev, ...requiredApprovedBankFolderColumnKeys])).filter(k => allApprovedBankFolderColumnKeys.includes(k)));
    }, [ApprovedBankFolderColumns.length])

    const visibleApprovedBankFolderColumns = useMemo(
        () => ApprovedBankFolderColumns.filter(col => selectedApprovedBankFolderColumnKeys.includes(col.key)),
        [ApprovedBankFolderColumns, selectedApprovedBankFolderColumnKeys]
    );
    //#endregion

    //#region INITIALIZATION
    const hasFetchedInitialApprovedBankFolder = useRef(false)

    useEffect(() => {

        if (hasFetchedInitialApprovedBankFolder.current) return
        hasFetchedInitialApprovedBankFolder.current = true;
        fetchApprovedBankFolderList()
    }, [])

    //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {
            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])
    //#endregion

    // RESET FORM DATA
    const handleResetForm = () => {
        setFormData(initialFormState());
        setSelectedApprovedBankId([]);
        setErrors({});
        setResetKey(prev => prev + 1);
    };
    //#endregion

    const handleAddApprovedBankFolder = () => {
        setDeleteApprovedBankFolderData(null);
        setFormData(initialFormState());
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
            setIsLoadingMessage,
            async () => {

                const payload = PushApprovedBankFolderFormData();

                const response = await approvedBankFolderService.apiCallAddUpdateApprovedBankWithFolder(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ApprovedBankFolderId === null || formData.ApprovedBankFolderId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as ApprovedBankFolderData
                        fetchApprovedBankFolderList()
                        setApprovedBankFolderList(prevData => [newRecord, ...prevData]);

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
            setIsLoadingMessage,
            async () => {
                const params: DeleteApprovedBankFolderRequest = {

                    ApprovedBankFolderId: deleteApprovedBankFolderData.ApprovedBankFolderId || 0,

                    Uniquekey: deleteApprovedBankFolderData.Uniquekey || "",

                    ProjectId: deleteApprovedBankFolderData.ProjectId || 0
                };

                const response = await approvedBankFolderService.apiCallDeleteApprovedBankWithFolder(params);

                if (E.isRight(response)) {

                    setApprovedBankFolderList(prevData => prevData.filter(item => item.ApprovedBankFolderId !== deleteApprovedBankFolderData.ApprovedBankFolderId));
                    setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords - 1,
                        totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
                    });
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            {/* LOADER */}

            <Loader loading={isLoading} title={isLoadingMessage} > <div></div> </Loader>

            {/* ACTION TOOLBAR */}

            <TableActionToolbar
                isShowSearchBar
                searchTerm={searchTerm}
                searchPlaceholder="Search By Bank Name"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchApprovedBankFolder}

                // ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddApprovedBankFolder}
            />

            {/*  APPROVED BANK FOLDER DATA TABLE*/}

            <DataTable
                data={ApprovedBankForTable}
                columns={visibleApprovedBankFolderColumns}
                pagination={ApprovedBankPaginationInfo}
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
                    setSearchBankNameTerm("");
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setSearchBankNameTerm("");
                }}
                title={'Add Bank'}
                onSubmit={handleAddUpdateApprovedBankFolder}
                saveText={'Add'}
                resetText="Reset"
                onreset={handleResetForm}
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
                                No Data Found
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
                                            className="flex items-center justify-between px-6 py-3 border-b border-blue-200 cursor-pointer last:border-b-0"
                                        >
                                            <span className="text-sm text-gray-800">{bank.label}</span>
                                            <Checkbox
                                                key={resetKey}
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
            <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                    setIsConfirmationDialogBoxOpen(false)
                    setDeleteApprovedBankFolderData(null)
                }}
                onConfirm={handleDeleteApprovedBankFolder}
                title="You are about to delete a Approved Bank Folder ?"
                message="Deleting this Approved Bank Folder will permanently remove its contents."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
                variant="danger"
            />

        </div>
    );
};

export default ApprovedBankFolder;
