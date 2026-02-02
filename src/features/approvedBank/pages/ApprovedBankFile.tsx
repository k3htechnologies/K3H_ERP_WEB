import { Loader } from "@/core/utils/loader";
import type { AddUpdateApprovedBankFileRequest, ApprovedBankFileData, DeleteApprovedBankFileRequest, FilterWithPaginationApprovedBankFileRequest } from "@/features/approvedBank/models/ApprovedBankFileModel";
import { useCallback, useEffect, useMemo, useState } from "react";
import TableActionToolbar from "@/ui/components/TableAction/TableActionToolbar";
import useDebouncedCallback from "@/core/hooks/useDebouncedCallback";
import * as E from 'fp-ts/Either';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import {useNavigate, useParams } from "react-router-dom";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import usePagination from "@/core/hooks/usePagination";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { approvedBankFileService } from "@/features/approvedBank/services/ApprovedBankFileService";
import useToast from "@/core/hooks/useToast";
import { Edit, Trash2 } from "lucide-react";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import MultiImageViewer from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";
import { hasAnyDocumentFile } from "@/core/utils/fileValidation";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { getSortByParam } from "@/core/constants/sortingColumnDetails";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useApprovedBankListState } from "@/features/approvedBank/context/ApprovedBankListStateContext";

const initialFormState = (): AddUpdateApprovedBankFileRequest => ({
    ApprovedBankFileId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    ApprovedBankFileName: '',
    ApprovedBankFolderId: 0,
    ProjectId: 0,
    ApprovedBankFileURL: null,
    RemoveApprovedBankFileURL: '',
})

export const ApprovedBankFile: React.FC = () => {

    //#region STATE MANAGEMENT
    const [approvedBankFileList, setApprovedBankFileList] = useState<ApprovedBankFileData[]>([]);
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

    //SET APPROVED BANK FILE
    const [approvedBankFiles, setApprovedBankFiles] = useState<(File | string)[]>([]);
    const [removeApprovedBankFileUrls, setRemoveApprovedBankFileUrls] = useState<string[]>([]);
    const [approvedBankFileURL, setApprovedBankFileURL] = useState<string>();

    // SINGLE SEARCH TEXT BOX
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchApprovedBankFile(value)
    }, 350);

    // ADD EDIT APPROVED BANK FILE
    const [editingApprovedBankFileData, setEditingApprovedBankFileData] = useState<ApprovedBankFileData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    //DELETE APPROVED BANK FILE 
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteApprovedBankFileData, setDeleteApprovedBankFileData] = useState<ApprovedBankFileData | null>(null)

    //ERROR SET UP
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const [formData, setFormData] = useState<AddUpdateApprovedBankFileRequest>(() => initialFormState());

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    const { ApprovedBankFolderId } = useParams<{ ApprovedBankFolderId?: string }>();
    const { listState } = useApprovedBankListState();
    const approvedBankFolderId = ApprovedBankFolderId ? Number(ApprovedBankFolderId) : listState.ApprovedBankFolderId;
    //#endregion

    //#region DATA LOADING | LOAD | SEARCH 
    const loadApprovedBankFile = useCallback(async (page: number, sortInfo?: SortInfo, searchtext?: string) => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationApprovedBankFileRequest = {
                    PageNumber: page,
                    PageSize: pagination.pageSize,
                    ProjectId: Number(projectId),
                    ApprovedBankFolderId: approvedBankFolderId,
                    ApprovedBankFileName: searchtext?.trim() || undefined,
                    SortBy: getSortByParam(sortInfo ?? null, ApprovedBankFileColumns)
                };

                const response = await approvedBankFileService.apiCallPullApprovedBankFile(params);
                if (E.isRight(response)) {
                    setApprovedBankFileList(response.right.Data);
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
            'Loading Approved Bank File'
        )
    }, [pagination.pageSize, approvedBankFolderId, projectId, addToast])
    //#endregion

    //#region INIT
    useEffect(() => {

        if (!projectId || !approvedBankFolderId) return;

        loadApprovedBankFile(1, sortInfo, searchTerm);

    }, [projectId, approvedBankFolderId, sortInfo]);

    //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
    useEffect(() => {
        return () => {

            debouncedSearch.cancel?.()
        }
    }, [debouncedSearch])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingApprovedBankFileData) {
                setFormData({
                    ApprovedBankFileId: editingApprovedBankFileData.ApprovedBankFileId || 0,
                    Uniquekey: editingApprovedBankFileData.Uniquekey || initialFormState().Uniquekey,
                    ApprovedBankFolderId: editingApprovedBankFileData.ApprovedBankFolderId || 0,
                    ProjectId: editingApprovedBankFileData.ProjectId || 0,
                    ApprovedBankFileName: editingApprovedBankFileData.ApprovedBankFileName || null,
                    ApprovedBankFileURL: null,
                    RemoveApprovedBankFileURL: ''
                });
                setApprovedBankFiles([]);
                setApprovedBankFileURL(editingApprovedBankFileData.ApprovedBankFileURL || '');
                setRemoveApprovedBankFileUrls([]);
            } else {
                setFormData({
                    ...initialFormState(),
                    ProjectId: Number(projectId)
                });
                setApprovedBankFiles([]);
                setApprovedBankFileURL('');
                setRemoveApprovedBankFileUrls([]);
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingApprovedBankFileData, projectId]);
    //#endregion

    //#region SEARCH & CLEAR
    const searchApprovedBankFile = async (searchValue: string) => {
        setSearchTerm(searchValue);
        await loadApprovedBankFile(1, sortInfo, searchValue);
    };
    //#endregion

    //#region CLEAR 
    const clearSearchApprovedBankFile = () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        setPagination({ currentPage: 1 });

        loadApprovedBankFile(1, sortInfo, '');
    };
    //#endregion

    //#region HANDLE PAGE CHNAGE EVENT
    const handlePageChange = useCallback((page: number) => {
        loadApprovedBankFile(page, sortInfo, searchTerm);
    }, [sortInfo, searchTerm]);

    //#region TABLE SORT COLUMN
    const handleSortColumn = useCallback((sort: SortInfo) => {
        setSortInfo(sort);
        loadApprovedBankFile(1, sort, searchTerm);
    }, [searchTerm]);
    //#endregion

    //#region EDIT APPROVED BANK FILE
    const handleEditApprovedBankFile = useCallback((row: ApprovedBankFileData) => {
        setEditingApprovedBankFileData({
            ...row,
            ApprovedBankFileName: row.ApprovedBankFileName || ''
        })
        setIsAddUpdateModalOpen(true);
    }, [])
    //#endregion

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteApprovedBankFileData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteApprovedBankFileData]);

    //#region CONFIRMATION DIALOG BOX
    const handleConfirmationDialogBoxOpen = useCallback((row: ApprovedBankFileData) => {
        setDeleteApprovedBankFileData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])
    //#endregion

    //#region TABLE PAGINATION INFO
    const ApprovedBankFilePaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange
        }), [pagination, handlePageChange]);

    const ApprovedBankFileForTable = useMemo(() => approvedBankFileList, [approvedBankFileList]);

    //#region TABLE COLUMNS
    const ApprovedBankFileColumns = useMemo<TableColumn[]>(() => [
        {
            key: 'ApprovedBankFileName',
            label: 'Title',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
            render: (value: string, row: any) => {
                return (
                    <div className="flex items-center gap-2 justify-between w-full">
                        <MultiImageViewer
                            images={parseDocumentUrls(row.ApprovedBankFileURL)}
                            title="Document"
                            triggerLabel={
                                <TooltipText
                                    text={value || '-'}
                                    maxWidth="250px"
                                    tooltipThreshold={25}
                                />
                            }
                        />
                    </div>
                );
            }
        },
        {
            key: 'CreatedBy',
            label: 'Last Modified By',
            width: '33',
            sortable: true,
            align: 'center',
            render: (value) => value || '-'
        },
        {
            key: 'CreatedDate',
            label: 'Last Modified Date',
            width: '33',
            sortable: true,
            align: 'center',
            render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '12',
            fixed: 'right',
            align: 'center',
            render: (_value, row) => (
                <div className="flex items-center justify-center">
                    {canAction && (
                        <>
                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: 'blue',
                                    padding: '0px 8px'
                                }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleEditApprovedBankFile(row)
                                }}
                                leftIcon={<Edit className="h-4 w-4" />}
                            />

                            <Button
                                color="transparent"
                                size="sm"
                                style={{
                                    color: 'red',
                                    padding: '0px 8px'
                                }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleConfirmationDialogBoxOpen(row)
                                }}
                                leftIcon={<Trash2 className="h-4 w-4" />}
                            />
                        </>
                    )}
                </div>
            )
        },

    ], [canAction, handleEditApprovedBankFile, handleConfirmationDialogBoxOpen])

    const handleFieldChange = (field: keyof AddUpdateApprovedBankFileRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddApprovedBankFileModal = () => {
        setEditingApprovedBankFileData(null);
        setFormData({
            ...initialFormState(),
            ProjectId: Number(projectId),
            ApprovedBankFolderId: approvedBankFolderId
        });
        setErrors({});
        setApprovedBankFiles([]);
        setApprovedBankFileURL('');
        setRemoveApprovedBankFileUrls([]);
        setIsAddUpdateModalOpen(true);
    }

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================

    const validationAddUpdateApprovedBankFileForm = (): {
        isValid: boolean
        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.ApprovedBankFileName || formData.ApprovedBankFileName.trim() === '') {
            newErrors.ApprovedBankFileName = "Title is required."

        } else if (formData.ApprovedBankFileName.trim().length < 3) {
            newErrors.ApprovedBankFileName = "Title must be at least 3 characters long."
        }
        if (!hasAnyDocumentFile(approvedBankFiles, approvedBankFileURL, removeApprovedBankFileUrls)) {
            newErrors.ApprovedBankFileURL = "File is required.";
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    //#region PUSH FORM DATA
    const PushApprovedBankFileFormData = (): FormData => {

        const fd = new FormData();
        fd.append('ApprovedBankFileId', String(formData.ApprovedBankFileId ?? 0));
        fd.append('ApprovedBankFolderId', String(approvedBankFolderId));
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectId', String(projectId));
        fd.append('ApprovedBankFileName', formData.ApprovedBankFileName ?? '');

        approvedBankFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('ApprovedBankFileURL', file);
            }
        });

        fd.append('RemoveApprovedBankFileURL', removeApprovedBankFileUrls.join(','));
        return fd;
    };

    //#region ADD UPDATE APPROVED BANK FILE
    const handleAddUpdateApprovedBankFile = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validationAddUpdateApprovedBankFileForm()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushApprovedBankFileFormData();

                const response = await approvedBankFileService.apiCallAddUpdateApprovedBankFile(payload);
                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const isAdd = formData.ApprovedBankFileId === 0;

                    if (isAdd) {
                        const newRecord = response.right.Data[0] as ApprovedBankFileData
                        setApprovedBankFileList(prevData => [newRecord, ...prevData]);
                        setPagination({
                            currentPage: pagination.currentPage,
                            totalRecords: pagination.totalRecords + 1,
                            totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                        });
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {
                        const updatedRecord = response.right.Data[0] as ApprovedBankFileData;
                        setApprovedBankFileList(prevData =>
                            prevData.map(item =>
                                item.ApprovedBankFileId === formData.ApprovedBankFileId
                                    ? updatedRecord
                                    : item
                            )
                        )
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
                    setEditingApprovedBankFileData(null)
                    setApprovedBankFiles([])
                    setApprovedBankFileURL('')
                    setRemoveApprovedBankFileUrls([])
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
            'Add Approved Bank File'
        )
    };
    //#endregion

    //#region DELETE APPROVED BANK FILE
    const handleDeleteApprovedBankFile = async () => {
        setIsConfirmationDialogBoxOpen(false);
        if (!deleteApprovedBankFileData) return

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteApprovedBankFileRequest = {
                    ApprovedBankFileId: deleteApprovedBankFileData.ApprovedBankFileId,
                    Uniquekey: deleteApprovedBankFileData.Uniquekey || '',
                    ApprovedBankFolderId: deleteApprovedBankFileData.ApprovedBankFolderId,
                    ProjectId: deleteApprovedBankFileData.ProjectId
                }
                const response = await approvedBankFileService.apiCallDeleteApprovedBankFile(params);

                if (E.isRight(response)) {

                    const newTotalRecords = pagination.totalRecords - 1;

                    const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

                    let pageToShow = pagination.currentPage;

                    if (pagination.currentPage > newTotalPages) {
                        pageToShow = newTotalPages;
                    }

                    else if (approvedBankFileList.length === 1 && pagination.currentPage > 1) {
                        pageToShow = pagination.currentPage - 1;
                    }
                    setPagination({
                        currentPage: pageToShow,
                        totalRecords: newTotalRecords,
                        totalPages: newTotalPages
                    });
                    await loadApprovedBankFile(pageToShow, sortInfo);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteApprovedBankFileData(null);
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
            'Delete Approved Bank File'
        )
    }
    //#endregion

    //#region BACK APPROVED BANK FOLDER PAGE
    const handleBackToListApprovedBankFolder = () => {
        navigate('/approvedBank');
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
                searchPlaceholder="Search By Title"
                onSearchChange={v => {
                    setSearchTerm(v);
                    debouncedSearch(v);
                }}
                onClearSearch={clearSearchApprovedBankFile}

                //ADD
                isShowAddButton={canAction}
                addTitle="Add"
                onAdd={handleAddApprovedBankFileModal}
            />

            <div className="flex items-center gap-3 mb-6 border-b border-gray-300 pb-3">

                <HeaderActionBar
                    titleText={"Approved Bank Document"}
                    cancelText="Cancel"
                    onCancel={() => handleBackToListApprovedBankFolder()}
                    canAction={false}
                    isLoading={isLoading}
                />
            </div>

            {/* DATA TABLE APPROVED BANK FILE*/}

            <DataTable
                columns={ApprovedBankFileColumns}
                data={ApprovedBankFileForTable}
                pagination={ApprovedBankFilePaginationInfo}
                emptyMessage="No Approved Bank File Found"
                fixedHeight={true}
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={handleSortColumn}
            />

            {/* ADD APPROVED BANK FILE MODAL */}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditingApprovedBankFileData(null);
                    setFormData(initialFormState());
                    setErrors({});
                    setApprovedBankFiles([]);
                    setApprovedBankFileURL('');
                    setRemoveApprovedBankFileUrls([])
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false)
                    setEditingApprovedBankFileData(null)
                    setFormData(initialFormState());
                    setErrors({})
                    setApprovedBankFiles([]);
                    setApprovedBankFileURL('');
                    setRemoveApprovedBankFileUrls([])
                }}
                title={editingApprovedBankFileData ? 'Update' : 'Add'}
                onSubmit={handleAddUpdateApprovedBankFile}
                saveText='Save'
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <Input
                                label='Title'
                                required
                                type="text"
                                value={formData.ApprovedBankFileName ?? ''}
                                onChange={(e) => handleFieldChange("ApprovedBankFileName", e.target.value)}
                                error={errors.ApprovedBankFileName}
                                maxLength={250}
                                placeholder="Enter Title"
                            />
                        </div>

                        <div>
                            <MultiFilePicker
                                label="Files"
                                placeholder='Select Files'
                                value={approvedBankFiles}
                                onChange={setApprovedBankFiles}
                                availableFilesURL={approvedBankFileURL ?? ""}
                                error={errors.ApprovedBankFileURL}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg", "application/pdf"]}
                                maxFiles={5}
                                maxSizeMB={10}
                                onRemoveExisting={(url) => {
                                    setRemoveApprovedBankFileUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>

                    </div>
                </div>

            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteApprovedBankFile}
                loading={isLoading}
                pageName='Approved Bank File'
            />
        </div>
    )
}

export default ApprovedBankFile;