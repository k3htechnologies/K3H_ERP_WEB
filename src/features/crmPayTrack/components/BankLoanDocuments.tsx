import { type TableColumn } from '@/ui/components/DataTable/DataTable';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { Modal } from '@/ui/components/Modal/Modal';
import { useState } from 'react';
import { Button, Input } from '@/ui/components/forms';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { runApiWithLoader } from '@/core/utils';
import type { BankDocumentsPayTrackBookingFilesData, FilterWithPaginationBankDocumentsPayTrackBookingFiles, AddUpdateBankDocumentsPayTrackBookingFilesRequest, DeleteBankDocumentsPayTrackBookingFilesRequest } from "@/features/crmPayTrack/models/BankDocumentsPayTrackBookingFilesModel";
import useToast from '@/core/hooks/useToast';
import { bankDocumentPayTrackBookingFilesService } from "@/features/crmPayTrack/services/BankDocumentPayTrackBookingFilesService";
import * as E from 'fp-ts/Either';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Loader } from '@/core/utils/loader';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import { usePayTrackBookingListState } from '@/features/crmPayTrack/context/PayTrackBookingListStateContext';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { hasAnyDocumentFile } from '@/core/utils/fileValidation';
import type { BookingLoanDetailsData, FilterWithPaginationBookingLoanDetails } from '../models/BookingLoanDetailsModel';
import { bookingLoanDetailsService } from '../services/BookingLoanDetailsService';
import { DataTableExpandable, type DataTableExpandableRef } from '@/ui/components/DataTable/DataTableExpandable';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { DataTableWithOutBorder } from '@/ui/components/DataTable/DataTableWithoutBorder';
import { formatCurrency } from '@/core/utils/comman';

const initialFormState = (): AddUpdateBankDocumentsPayTrackBookingFilesRequest => ({
    PayTrackBookingFilesId: 0,
    Uniquekey: '345f2698-c51e-f111-af70-a0b9bd2bb8fe',
    BookingId: 0,
    ProjectId: 0,
    FileName: '',
    FileType: '',
    IsMaster: 0,
    PayTrackBookingFilesURL: null,
    RemovePayTrackBookingFilesURL: ''
})


export const BankLoanDocuments: React.FC = () => {
    const [bookingLoanDetailsList, setBookingLoanDetailsList] = useState<BookingLoanDetailsData[]>([]);
    const dtRef = useRef<DataTableExpandableRef | null>(null);
    const [expandedParentRow, setExpandedParentRow] = useState<any>(null);

    const [expandedParentId, setExpandedParentId] = useState<number>(0);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [formData, setFormData] = useState<AddUpdateBankDocumentsPayTrackBookingFilesRequest>(() => initialFormState());

    const [documentFiles, setDocumentFiles] = useState<(File | string)[]>([]);
    const [removedDocumentURLs, setRemovedDocumentURLs] = useState<string[]>([]);
    const [documentURL, setDocumentURL] = useState<string>();


    const [editingBankDocumentPayTrackBookingFilesData, setEditingBankDocumentPayTrackBookingFilesData] = useState<BankDocumentsPayTrackBookingFilesData | null>(null);
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
    const [deleteBankDocumentPayTrackDetailsData, setDeleteBankDocumentPayTrackDetailsData] = useState<BankDocumentsPayTrackBookingFilesData | null>(null)

    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const { canAction } = useMenuPermissions("/bankLoan");

    const { listState } = usePayTrackBookingListState();
    const { bookingId,bookingApprovalStatus } = listState;

    const { projectId } = useProject();

    const { addToast } = useToast();

    useEffect(() => {
        if (projectId && bookingId) {
            fetchBankLoanDetails();
        }
    }, [projectId, bookingId]);

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editingBankDocumentPayTrackBookingFilesData) {
                setFormData({
                    PayTrackBookingFilesId: editingBankDocumentPayTrackBookingFilesData.PayTrackBookingFilesId,
                    Uniquekey: editingBankDocumentPayTrackBookingFilesData.Uniquekey || initialFormState().Uniquekey,
                    BookingId: editingBankDocumentPayTrackBookingFilesData.BookingId || 0,
                    ProjectId: Number(projectId),
                    FileName: editingBankDocumentPayTrackBookingFilesData.FileName || "",
                    FileType: "BANK DOCUMENT",
                });

                setDocumentFiles([]);
                setDocumentURL(editingBankDocumentPayTrackBookingFilesData.PayTrackBookingFilesURL || "");
                setRemovedDocumentURLs([]);
            } else {
                setFormData(initialFormState());
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editingBankDocumentPayTrackBookingFilesData, projectId]);

    const fetchBankLoanDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationBookingLoanDetails = {
                    PageNumber: 1,
                    PageSize: 500,
                    ProjectId: Number(projectId),
                    BookingId: bookingId,
                };
                const response = await bookingLoanDetailsService.apiCallPullBookingLoanDetails(params);

                if (E.isRight(response)) {
                    setBookingLoanDetailsList(response.right.Data);
                } else {

                    addToast({ type: "error", title: response.left.message });

                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Bank Loan Details",
        );
    };

    const handleEditBankDocumentPayTrackDetails = useCallback((row: BankDocumentsPayTrackBookingFilesData) => {
        setEditingBankDocumentPayTrackBookingFilesData({
            ...row,
            FileName: row.FileName || "",
        });
        setIsAddUpdateModalOpen(true)
    }, [])

    const handleConfirmationDialogBoxOpen = useCallback((row: BankDocumentsPayTrackBookingFilesData) => {
        setDeleteBankDocumentPayTrackDetailsData(row)
        setIsConfirmationDialogBoxOpen(true)
    }, [])

    const handleBankDocumentsModal = useCallback((row: BookingLoanDetailsData) => {
        setExpandedParentRow(row);
        setExpandedParentId(row.BookingLoanDetailsId);
        setEditingBankDocumentPayTrackBookingFilesData(null);
        setFormData(initialFormState());
        setErrors({});
        setDocumentFiles([]);
        setDocumentURL('');
        setRemovedDocumentURLs([]);
        setIsAddUpdateModalOpen(true);
    }, []);

    const bankLoanDetailsColumns = useMemo<TableColumn[]>(
        () => [

            {
                key: "BankName",
                label: "Bank Name",
                width: "15",
                sortable: false,
                align: "left",
                render: value => value || '-'
            },
            {
                key: "BankStatusClosedActive",
                label: "Status",
                width: "15",
                sortable: false,
                align: "left",
                render: value => value || '-'
            },
            {
                key: "LoanSanctionAmount",
                label: "Loan Sanction Amount",
                width: "15",
                sortable: false,
                align: "right",
                render: value => formatCurrency(value) || '-'
            },
            {
                key: "LoanAccountNumber",
                label: "Loan Account Number",
                width: "15",
                sortable: false,
                align: "right",
                render: value => value || '-'
            },
            {
                key: "BankBranchName",
                label: "Bank Branch Name",
                width: "15",
                sortable: false,
                align: "left",
                render: value => value || '-'
            },
            {
                key: "NoOfBankDocument",
                label: "Documents Count",
                width: "15",
                sortable: false,
                align: "center",
                render: value => value || '0'
            },
            {
                key: "actions",
                label: "Actions",
                width: "12",
                fixed: "right",
                align: "center",
                render: (_value, row) => {

                    const showEdit = canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED'  ? (row.BankStatusClosedActive) === "Active" : false;

                    return (
                        <div>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!showEdit) return;
                                        handleBankDocumentsModal(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={!showEdit}
                                    size="sm"
                                    title="Add"
                                    style={{
                                        color: showEdit ? '' : '#9CA3AF',
                                        cursor: showEdit ? 'pointer' : 'not-allowed',
                                        opacity: showEdit ? 1 : 0.5
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                        </div>
                    );
                },
            },

        ], [canAction]
    );

    const bankDocumentColumns = useMemo<TableColumn[]>(
        () => [

            {
                key: "FileName",
                label: "File Name",
                width: "15",
                sortable: false,
                align: "left",
                render: (value: string, row: any) => {
                    return (
                        <div className="flex items-center justify-between w-full">
                            <div className="truncate max-w-[400px]">
                                <MultiImageViewer images={parseDocumentUrls(row.PayTrackBookingFilesURL)} title="Document" triggerLabel={value || "-"} />
                            </div>
                        </div>
                    );
                },
            },

            {
                key: "ModifiedBy",
                label: "Last Modified By",
                width: "33",
                sortable: false,
                align: "left",
                render: (value, row) => <TooltipText text={value || row.CreatedBy || "-"} maxWidth="180px" tooltipThreshold={18} />,
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
                key: "Actions",
                label: "Actions",
                width: "12",
                align: "center",
                fixed: "right",
                render: (_value, row) => {

                    const showEdit = canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED'  ? (row.BankStatusClosedActive) === "Active" : false;

                    return (
                        <div className="flex items-center justify-end ml-2 gap-1">

                            <div className="flex-shrink-0 ml-2">

                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!showEdit) return;
                                        handleEditBankDocumentPayTrackDetails(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={!showEdit}
                                    size="sm"
                                    style={{
                                        color: showEdit ? '' : '#9CA3AF',
                                        cursor: showEdit ? 'pointer' : 'not-allowed',
                                        opacity: showEdit ? 1 : 0.5
                                    }}
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>

                            </div>

                            <div className="w-[34px] flex justify-center">

                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!showEdit) return;
                                        handleConfirmationDialogBoxOpen(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={!showEdit}
                                    size="sm"
                                    style={{
                                        color: showEdit ? 'red' : '#9CA3AF',
                                        cursor: showEdit ? 'pointer' : 'not-allowed',
                                        opacity: showEdit ? 1 : 0.5
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                            </div>

                        </div>
                    );
                },
            },

        ], [canAction, handleConfirmationDialogBoxOpen, handleEditBankDocumentPayTrackDetails]
    );

    const handleFieldChange = (field: keyof AddUpdateBankDocumentsPayTrackBookingFilesRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validateAddBankDocumentPayTrackBookingFiles = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.FileName?.trim()) {
            newErrors.FileName = 'File Name is required';
        }

        if (!hasAnyDocumentFile(documentFiles, documentURL, removedDocumentURLs)) {
            newErrors.documentFiles = "File is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const PushBankDocumentPayTrackBookingFiles = (): FormData => {

        const fd = new FormData();
        fd.append('PayTrackBookingFilesId', formData.PayTrackBookingFilesId?.toString() ?? '');
        fd.append('Uniquekey', formData.Uniquekey ?? '');
        fd.append('ProjectId', String(projectId));
        fd.append('BookingId', String(bookingId));
        fd.append('FileName', formData.FileName ?? '');
        fd.append('FileType', "BANK DOCUMENT");
        fd.append('IsMaster', String(formData.IsMaster ?? 0));

        documentFiles.forEach(file => {
            if (file instanceof File) {
                fd.append('PayTrackBookingFilesURL', file);
            }
        });

        fd.append('RemovePayTrackBookingFilesURL', removedDocumentURLs.join(','));
        return fd;
    };

    const handleAddUpdateBankDocumentPayTrackBookingFiles = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateAddBankDocumentPayTrackBookingFiles();

        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushBankDocumentPayTrackBookingFiles();

                const response = await bankDocumentPayTrackBookingFilesService.apiCallAddUpdateBankDocumentsPayTrackBookingFiles(payload);
                if (E.isRight(response)) {

                    setIsAddUpdateModalOpen(false);

                    const parentId = expandedParentId;

                    await fetchBankLoanDetails();

                    if (dtRef.current) {
                        dtRef.current.collapseAll?.();
                    }

                    setTimeout(() => {
                        if (parentId) {
                            dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                        }
                    }, 50);

                    setEditingBankDocumentPayTrackBookingFilesData(null);

                    dtRef.current?.collapseAll?.();

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
            `Add Bank Loan Document`
        )
    };
    // #endregion

    const handleDeleteDialogClose = useCallback(() => {
        setIsConfirmationDialogBoxOpen(false);
        setDeleteBankDocumentPayTrackDetailsData(null);
    }, [setIsConfirmationDialogBoxOpen, setDeleteBankDocumentPayTrackDetailsData]);

    //#region DELETE BANK DOCUMENT PAY TRACK BOOKING FILES
    const handleDeleteBankDocumentPayTrackDetails = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteBankDocumentPayTrackDetailsData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: DeleteBankDocumentsPayTrackBookingFilesRequest = {

                    PayTrackBookingFilesId: deleteBankDocumentPayTrackDetailsData?.PayTrackBookingFilesId || 0,

                    Uniquekey: deleteBankDocumentPayTrackDetailsData?.Uniquekey || '',

                    ProjectId: deleteBankDocumentPayTrackDetailsData?.ProjectId || 0,

                    BookingId: deleteBankDocumentPayTrackDetailsData.BookingId || 0
                };

                const response = await bankDocumentPayTrackBookingFilesService.apiCallDeleteBankDocumentsPayTrackBookingFiles(params);

                if (E.isRight(response)) {

                    const parentId = expandedParentId;

                    await fetchBankLoanDetails();

                    if (dtRef.current) {
                        dtRef.current.collapseAll?.();
                    }

                    setTimeout(() => {
                        if (parentId) {
                            dtRef.current?.expandRow?.(String(parentId), expandedParentRow);
                        }
                    }, 50);

                    addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })
                    setIsConfirmationDialogBoxOpen(false);
                    setDeleteBankDocumentPayTrackDetailsData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    setIsConfirmationDialogBoxOpen(false);
                }
                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            `Deleting Bank Loan Document`
        );
    };
    //#endregion

    return (
        <div className="pt-5">

            {/* LOADER */}

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>


            <DataTableExpandable
                ref={dtRef}
                data={bookingLoanDetailsList}
                columns={bankLoanDetailsColumns}
                emptyMessage="No Payment Ledger Found"
                loading={isLoading}
                fixedHeight
                recordsPerPage={20}
                expandable={{
                    keyField: "BookingLoanDetailsId",
                    alwaysFetchOnOpen: true,

                    fetchRow: async (row) => {
                        setExpandedParentRow(row);
                        setExpandedParentId(row.BookingLoanDetailsId);


                        setIsLoading(true);

                        setLoadingMessage("Loading Bank Document");

                        const params: FilterWithPaginationBankDocumentsPayTrackBookingFiles = {
                            PageNumber: 1,
                            PageSize: 100,
                            ProjectId: Number(projectId),
                            BookingLoanDetailsId: row.BookingLoanDetailsId,
                            BookingId: bookingId,
                            FileType: "BANK DOCUMENT"

                        };

                        const response = await bankDocumentPayTrackBookingFilesService.apiCallPullBankDocumentsPayTrackBookingFiles(params);

                        setIsLoading(false);

                        if (E.isRight(response)) {
                            return response.right.Data ?? [];
                        }
                        return [];
                    },


                    renderRow: (fetchedData) => {
                        const details: BookingLoanDetailsData[] = Array.isArray(fetchedData) ? fetchedData : fetchedData ? [fetchedData] : [];
                        if (!details || details.length === 0) {
                            return <div className="p-1 text-xs text-gray-600 text-center"><NoDataView /></div>;
                        }

                        return (
                            <DataTableWithOutBorder
                                data={details}
                                columns={bankDocumentColumns}
                                emptyMessage="No Document Found"
                                fixedHeight={true}
                                recordsPerPage={20}
                                className="flex-1"
                                loading={isLoading}
                            />
                        );
                    },

                    expandButton: { openText: "Hide", closeText: "Show" },
                }}
            />


            <Modal
                title={editingBankDocumentPayTrackBookingFilesData ? `Update Bank Loan Document` : `Add Bank Loan Document`}
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL('');
                    setRemovedDocumentURLs([]);
                    setEditingBankDocumentPayTrackBookingFilesData(null);
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setFormData(initialFormState());
                    setErrors({});
                    setDocumentFiles([]);
                    setDocumentURL('');
                    setRemovedDocumentURLs([]);
                    setEditingBankDocumentPayTrackBookingFilesData(null);
                }}
                onSubmit={handleAddUpdateBankDocumentPayTrackBookingFiles}
                saveText={editingBankDocumentPayTrackBookingFilesData ? 'Update' : 'Add'}
                loading={isLoading}
                size='xl'
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >
                        <div>
                            <Input
                                label="File Name"
                                placeholder="Enter File Name"
                                type="text"
                                value={formData.FileName ?? ''}
                                onChange={(e) => handleFieldChange('FileName', e.target.value)}
                                error={errors.FileName}
                                required
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Upload File"
                                placeholder='Files'
                                required
                                value={documentFiles}
                                onChange={(files) => {
                                    setDocumentFiles(files);
                                    if (errors.documentFiles) {
                                        setErrors((prev) => ({ ...prev, documentFiles: "" }));
                                    }
                                }}
                                availableFilesURL={documentURL ?? ""}
                                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                                onRemoveExisting={(url) => {
                                    setRemovedDocumentURLs((prev) => [...prev, url])
                                }}
                                error={errors.documentFiles}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* DELETE CONFIRMATION MODAL */}

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpen}
                onClose={handleDeleteDialogClose}
                onConfirm={handleDeleteBankDocumentPayTrackDetails}
                loading={isLoading}
                pageName={"Bank Loan Document"}
            />
        </div>
    )
}

export default BankLoanDocuments