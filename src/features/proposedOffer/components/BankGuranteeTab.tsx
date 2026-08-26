import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
    ProposedOfferBankGuaranteeDetailsData,
    FilterWithPaginationProposedOfferBankGuaranteeDetailsRequest,
    AddUpdateProposedOfferBankGuaranteeDetailsRequest,
    ProposedOfferBankGuaranteeDetailsWithPaymentStageData,
    DeleteProposedOfferBankGuaranteeDetailsRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';
import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { filterNumbersWithDecimal } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Modal } from '@/ui/components/Modal/Modal';
import { Edit, Plus, Trash2 } from 'lucide-react';
import {
    initialFormStateBankGuaranteeDetails,
    initialFormStateBankGuaranteePaymentStage,
} from '../utils/initialStates';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { TextArea } from '@/ui/components/forms/Textarea';
import { getInputValue, isEmpty } from '@/core/utils/comman';
import Checkbox from '@/ui/components/forms/Checkbox';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

interface BankGuaranteeTabProps {
    projectId: number | null;
    buildingId: number;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;
}

export const BankGuaranteeTab: React.FC<BankGuaranteeTabProps> = ({
    projectId,
    buildingId,
    isLoading,
    setIsLoading,
    setLoadingMessage,
}) => {
    const [bankGuaranteeDetailsData, setBankGuaranteeDetailsData] = useState<ProposedOfferBankGuaranteeDetailsData | null>(null);
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions();
    const [errorsBankGuaranteeDetails, setErrorsBankGuaranteeDetails] = useState<{ [k: string]: string }>({});
    const [errorsBankGuaranteePaymentStage, setErrorsBankGuaranteePaymentStage] = useState<{ [k: string]: string }>({});
    const [formDataBankGuaranteeDetails, setFormDataBankGuaranteeDetails] = useState<AddUpdateProposedOfferBankGuaranteeDetailsRequest>(() => initialFormStateBankGuaranteeDetails());
    const [bankGuaranteePaymentStageList, setBankGuaranteePaymentStageList] = useState<ProposedOfferBankGuaranteeDetailsWithPaymentStageData[]>([]);
    const [editingBankGuaranteePaymentStageData, setEditingBankGuaranteePaymentStageData] = useState<{ row: ProposedOfferBankGuaranteeDetailsWithPaymentStageData; index: number } | null>(null);
    const [isAddUpdateBankGuaranteePaymentStageModalOpen, setIsAddUpdateBankGuaranteePaymentStageModalOpen] = useState(false);
    const [formDataBankGuaranteePaymentStage, setFormDataBankGuaranteePaymentStage] = useState<ProposedOfferBankGuaranteeDetailsWithPaymentStageData>(() => initialFormStateBankGuaranteePaymentStage());
    const [isConfirmationDialogBoxOpenBankGuaranteePaymentStage, setIsConfirmationDialogBoxOpenBankGuaranteePaymentStage] = useState(false);
    const [deleteBankGuaranteePaymentStageData, setDeleteBankGuaranteePaymentStageData] = useState<{ row: ProposedOfferBankGuaranteeDetailsWithPaymentStageData; index: number } | null>(null);
    const [isConfirmationDialogBoxOpenDeleteAllBankGuaranteeDetails, setIsConfirmationDialogBoxOpenDeleteAllBankGuaranteeDetails] = useState(false);

    useEffect(() => {
        if (!projectId || !buildingId) return;
        setErrorsBankGuaranteeDetails({});
        setErrorsBankGuaranteePaymentStage({});
        fetchBankGuaranteeDetailsData();
    }, [projectId, buildingId]);

    const handleFieldChangeBankGuaranteeDetails = (field: keyof AddUpdateProposedOfferBankGuaranteeDetailsRequest, value: any) => {
        setFormDataBankGuaranteeDetails((prev) => ({ ...prev, [field]: value }));
        if (errorsBankGuaranteeDetails[field]) {
            setErrorsBankGuaranteeDetails((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleFieldChangeBankGuaranteePaymentStage = (field: keyof ProposedOfferBankGuaranteeDetailsWithPaymentStageData, value: any) => {
        setFormDataBankGuaranteePaymentStage((prev) => ({ ...prev, [field]: value }));
        if (errorsBankGuaranteePaymentStage[field]) {
            setErrorsBankGuaranteePaymentStage((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const fetchBankGuaranteeDetailsData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProposedOfferBankGuaranteeDetailsRequest = {
                    ProjectId: projectId ?? undefined,
                    BuildingId: buildingId
                };

                const response = await proposedOfferService.apiCallPullBankGuaranteeDetails(params);

                if (E.isRight(response)) {
                    const data = response.right.Data?.[0] || null;
                    setBankGuaranteeDetailsData(data);

                    if (data) {
                        setFormDataBankGuaranteeDetails({
                            ProposedOfferBankGuaranteeDetailsId: data.ProposedOfferBankGuaranteeDetailsId || 0,
                            Uniquekey: data.Uniquekey || initialFormStateBankGuaranteeDetails().Uniquekey,
                            BuildingId: buildingId,
                            ProjectId: Number(projectId),
                            BankGuaranteeAmount: data.BankGuaranteeAmount ?? 0,
                            AccountHolderName: data.AccountHolderName ?? '',
                            Remark: data.Remark ?? "",
                            BankGuaranteePaymentStageJSON: ''
                        });

                        if (data.ProposedOfferBankGuaranteeDetailsWithPaymentStageData && data.ProposedOfferBankGuaranteeDetailsWithPaymentStageData.length > 0) {
                            setBankGuaranteePaymentStageList(data.ProposedOfferBankGuaranteeDetailsWithPaymentStageData);
                        } else {
                            setBankGuaranteePaymentStageList([]);
                        }
                    } else {
                        setFormDataBankGuaranteeDetails({
                            ...initialFormStateBankGuaranteeDetails(),
                            ProjectId: Number(projectId)
                        });
                        setBankGuaranteePaymentStageList([]);
                    }
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Bank Guarantee Details'
        );
    };

    const validateBankGuaranteeDetailsForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (isEmpty(formDataBankGuaranteeDetails.BankGuaranteeAmount)) {
            newErrors.BankGuaranteeToSocietyAmount = 'Bank Guarantee Amount is required'
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleSaveBankGuaranteeDetails = async () => {
        if (buildingId === 0) {
            addToast({ type: "error", title: "Please select proper building first" });
            return
        }

        else if (bankGuaranteePaymentStageList.length === 0) {
            addToast({ type: "error", title: "Please add atleast one Bank Guarantee List" });
            return
        }

        const releaseAmount = bankGuaranteePaymentStageList.filter(x => Boolean(x.IsRelease) === true).reduce((sum, x) => sum + Number(x.Amount || 0), 0);

        const nonReleaseAmount = bankGuaranteePaymentStageList.filter(x => Boolean(x.IsRelease) === false).reduce((sum, x) => sum + Number(x.Amount || 0), 0);

        const actualAmount = Number(formDataBankGuaranteeDetails.BankGuaranteeAmount || 0);

        if (releaseAmount !== actualAmount) {
            addToast({ type: "error", title: `Release Amount (₹${releaseAmount}) must match Bank Guarantee Amount (₹${actualAmount}).` });
            return;
        }

        if (nonReleaseAmount !== actualAmount) {
            addToast({ type: "error", title: `Non-Release Amount (₹${nonReleaseAmount}) must match Bank Guarantee Amount (₹${actualAmount}).` });
            return;
        }

        setErrorsBankGuaranteeDetails({})

        const validation = validateBankGuaranteeDetailsForm()

        if (!validation.isValid) {
            setErrorsBankGuaranteeDetails(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const paymentStageJSON = JSON.stringify(bankGuaranteePaymentStageList.map(item => ({
                    ProposedOfferBankGuaranteeDetailsWithPaymentStageId: item.ProposedOfferBankGuaranteeDetailsWithPaymentStageId ?? 0,
                    IsRelease: item.IsRelease ?? false,
                    Stage: item.Stage || '',
                    Amount: item.Amount ?? 0
                })));

                const payload: AddUpdateProposedOfferBankGuaranteeDetailsRequest = {
                    ProposedOfferBankGuaranteeDetailsId: formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId,
                    Uniquekey: formDataBankGuaranteeDetails.Uniquekey,
                    BuildingId: buildingId,
                    ProjectId: Number(projectId),
                    BankGuaranteeAmount: formDataBankGuaranteeDetails.BankGuaranteeAmount ?? 0,
                    AccountHolderName: formDataBankGuaranteeDetails.AccountHolderName ?? '',
                    Remark: formDataBankGuaranteeDetails.Remark ?? "",
                    BankGuaranteePaymentStageJSON: paymentStageJSON
                };

                const response = await proposedOfferService.apiCallAddUpdateBankGuaranteeDetails(payload);

                if (E.isRight(response)) {

                    const isAdd = formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId === 0;

                    if (isAdd) {
                        const newRecord = response.right.Data[0] as ProposedOfferBankGuaranteeDetailsData;
                        setBankGuaranteeDetailsData(newRecord);
                        setFormDataBankGuaranteeDetails({
                            ...formDataBankGuaranteeDetails,
                            ProposedOfferBankGuaranteeDetailsId: newRecord.ProposedOfferBankGuaranteeDetailsId || 0,
                            Uniquekey: newRecord.Uniquekey || formDataBankGuaranteeDetails.Uniquekey
                        });
                        if (newRecord.ProposedOfferBankGuaranteeDetailsWithPaymentStageData) {
                            setBankGuaranteePaymentStageList(newRecord.ProposedOfferBankGuaranteeDetailsWithPaymentStageData);
                        }
                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    } else {
                        const updatedRecord = response.right.Data[0] as ProposedOfferBankGuaranteeDetailsData;
                        setBankGuaranteeDetailsData(updatedRecord);
                        if (updatedRecord.ProposedOfferBankGuaranteeDetailsWithPaymentStageData) {
                            setBankGuaranteePaymentStageList(updatedRecord.ProposedOfferBankGuaranteeDetailsWithPaymentStageData);
                        }
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
            Number(formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId) === 0 ? 'Add Bank Guarantee Details' : 'Update Bank Guarantee Details'
        )
    };

    const validateBankGuaranteePaymentStageForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formDataBankGuaranteePaymentStage.Stage?.trim()) {
            newErrors.Stage = "Stage is required"
        }

        if (!formDataBankGuaranteePaymentStage.Amount) {
            newErrors.Amount = "Amount is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddBankGuaranteePaymentStageModal = () => {
        setEditingBankGuaranteePaymentStageData(null);
        setFormDataBankGuaranteePaymentStage({
            ...initialFormStateBankGuaranteePaymentStage(),
            ProjectId: Number(projectId),
            BuildingId: formDataBankGuaranteeDetails.BuildingId || 0
        });
        setErrorsBankGuaranteePaymentStage({});
        setIsAddUpdateBankGuaranteePaymentStageModalOpen(true);
    };

    const handleEditBankGuaranteePaymentStage = useCallback((row: ProposedOfferBankGuaranteeDetailsWithPaymentStageData, index: number) => {
        setEditingBankGuaranteePaymentStageData({ row, index });
        setFormDataBankGuaranteePaymentStage({
            ...row,
            IsRelease: row.IsRelease ?? false,
            Stage: row.Stage || '',
            Amount: row.Amount || 0
        });
        setErrorsBankGuaranteePaymentStage({});
        setIsAddUpdateBankGuaranteePaymentStageModalOpen(true);
    }, []);

    const handleAddUpdateBankGuaranteePaymentStage = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorsBankGuaranteePaymentStage({});

        const validation = validateBankGuaranteePaymentStageForm();

        if (!validation.isValid) {
            setErrorsBankGuaranteePaymentStage(validation.errors);
            return;
        }

        const paymentStageToSave: ProposedOfferBankGuaranteeDetailsWithPaymentStageData = {
            ...formDataBankGuaranteePaymentStage,
            ProposedOfferBankGuaranteeDetailsWithPaymentStageId: editingBankGuaranteePaymentStageData?.row.ProposedOfferBankGuaranteeDetailsWithPaymentStageId ?? 0,
            ProjectId: Number(projectId),
            BuildingId: buildingId
        };

        setBankGuaranteePaymentStageList(prev => {
            if (editingBankGuaranteePaymentStageData) {
                const updated = [...prev];
                updated[editingBankGuaranteePaymentStageData.index] = paymentStageToSave;
                return updated;
            }

            return [...prev, paymentStageToSave];
        });

        setIsAddUpdateBankGuaranteePaymentStageModalOpen(false);
        setEditingBankGuaranteePaymentStageData(null);
        setFormDataBankGuaranteePaymentStage(initialFormStateBankGuaranteePaymentStage());
        setErrorsBankGuaranteePaymentStage({});
    };

    const handleConfirmationDialogBoxOpenBankGuaranteePaymentStage = useCallback((row: ProposedOfferBankGuaranteeDetailsWithPaymentStageData, index: number) => {
        setDeleteBankGuaranteePaymentStageData({ row, index });
        setIsConfirmationDialogBoxOpenBankGuaranteePaymentStage(true);
    }, []);

    const handleDeleteBankGuaranteePaymentStage = () => {

        if (!deleteBankGuaranteePaymentStageData) return;

        const removeIndex = deleteBankGuaranteePaymentStageData.index;

        if (removeIndex < 0) {
            setIsConfirmationDialogBoxOpenBankGuaranteePaymentStage(false);
            setDeleteBankGuaranteePaymentStageData(null);
            addToast({ type: 'error', title: 'Unable to find the selected record to delete' });
            return;
        }

        setBankGuaranteePaymentStageList(prev => prev.filter((_, i) => i !== removeIndex));

        setIsConfirmationDialogBoxOpenBankGuaranteePaymentStage(false);
        setDeleteBankGuaranteePaymentStageData(null);
        addToast({ type: 'success', title: 'Bank Guarantee Payment Stage Removed' });
    };

    const bankGuaranteePaymentStageColumns = useMemo<TableColumn[]>(
        () => [

            {
                key: 'Stage',
                label: 'Stage',
                width: '25',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'Amount',
                label: 'Amount (₹)',
                width: '25',
                sortable: false,
                align: 'right',
                render: (value) => value ? `₹${value}` : '-'
            },
            {
                key: 'IsRelease',
                label: 'Is Release',
                width: '20',
                sortable: false,
                align: 'center',
                render: (value) => value ? 'Yes' : 'No'
            },
            {
                key: 'Action',
                label: 'Action',
                width: '25',
                sortable: false,
                align: 'center',
                render: (_value, row, index) => (
                    <div className="flex items-center justify-center gap-2">
                        {canAction && (
                            <>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditBankGuaranteePaymentStage(row, index);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    size="sm"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmationDialogBoxOpenBankGuaranteePaymentStage(row, index);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    size="sm"
                                    style={{ color: 'red' }}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                )
            }
        ],
        [canAction, handleEditBankGuaranteePaymentStage, handleConfirmationDialogBoxOpenBankGuaranteePaymentStage]
    );

    const handleConfirmationDialogBoxOpenBankGuaranteeDetails = useCallback(() => {
        setIsConfirmationDialogBoxOpenDeleteAllBankGuaranteeDetails(true);
    }, []);

    const handleDeleteAllBankGuaranteeDetails = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: DeleteProposedOfferBankGuaranteeDetailsRequest = {
                    BuildingId: buildingId,
                    ProjectId: Number(projectId)
                };

                const response = await proposedOfferService.apiCallDeleteBankGuaranteeDetails(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setIsConfirmationDialogBoxOpenDeleteAllBankGuaranteeDetails(false);

                    fetchBankGuaranteeDetailsData();

                } else {

                    addToast({ type: "error", title: response.left?.message });

                }
                return response;
            },
            undefined,

            (error: any) => {

                addToast({ type: 'error', title: error.message });

            },
            undefined,

            'Delete All Bank Guarantee Details'
        )
    };

    const isBuildingSelected = buildingId > 0;

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-4">


                    <div className="flex items-center justify-between border-b border-gray-500 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Bank Guarantee Amount Details
                        </h3>

                        {canAction && buildingId > 0 && formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId > 0 && (
                            <Button
                                onClick={handleConfirmationDialogBoxOpenBankGuaranteeDetails}
                                color="red"
                                variant="solid"
                                colorMode="extraLight"
                                style={{ width: '35px', height: '35px' }}
                                centerIcon={<Trash2 className="h-4 w-4" />}
                                title="Delete"
                            >
                            </Button>
                        )}

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <Input
                                label="Bank Guarantee Amount (₹)"
                                required
                                type="text"
                                value={getInputValue(formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId, formDataBankGuaranteeDetails.BankGuaranteeAmount)}
                                onChange={(e) => handleFieldChangeBankGuaranteeDetails('BankGuaranteeAmount', filterNumbersWithDecimal(e.target.value))}
                                error={errorsBankGuaranteeDetails.BankGuaranteeToSocietyAmount}
                                placeholder="Enter Bank Guarantee Amount"
                                rightIcon="₹"
                                disabled={!isBuildingSelected || bankGuaranteePaymentStageList.length > 0 ? true : false}
                            />
                        </div>
                        <div>
                            <Input
                                label="Account Holder Name"
                                value={formDataBankGuaranteeDetails.AccountHolderName || ''}
                                onChange={(e) => handleFieldChangeBankGuaranteeDetails('AccountHolderName', e.target.value)}
                                error={errorsBankGuaranteeDetails.AccountHolderName}
                                placeholder="Enter Account Holder Name"
                                maxLength={50}
                                disabled={!isBuildingSelected}
                            />

                        </div>
                    </div>
                    <div>
                        <TextArea
                            label="Remarks"
                            className='thin-scroll'
                            value={formDataBankGuaranteeDetails.Remark ?? ""}
                            placeholder="Enter Remarks"
                            onChange={(e) => handleFieldChangeBankGuaranteeDetails("Remark", e.target.value)}
                            disabled={!isBuildingSelected}
                        />
                    </div>
                </div>

                <div className="space-y-4 pb-5">
                    <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Bank Guarantee List
                        </h3>
                        {canAction && buildingId > 0 && Number(formDataBankGuaranteeDetails.BankGuaranteeAmount) > 0 && (
                            <Button
                                onClick={handleAddBankGuaranteePaymentStageModal}
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                style={{ width: '35px', height: '35px' }}
                                centerIcon={<Plus className="h-4 w-4" />}>
                            </Button>
                        )}
                    </div>
                    <DataTable
                        data={bankGuaranteePaymentStageList}
                        columns={bankGuaranteePaymentStageColumns}
                        emptyMessage="No Bank Guarantee Details Found"
                        fixedHeight={false}
                        recordsPerPage={20}
                        className="min-w-full"
                    />

                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                        <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#333333]">
                                Action Details
                            </h4>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Created By" value={bankGuaranteeDetailsData?.CreatedBy ?? '-'} />
                                <FieldItem
                                    label="Created Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(bankGuaranteeDetailsData?.CreatedDate ?? '-')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                                <FieldItem label="Modified By" value={bankGuaranteeDetailsData?.ModifiedBy ?? '-'} />
                                <FieldItem
                                    label="Modified Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(bankGuaranteeDetailsData?.ModifiedDate ?? '-')}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <BottomActionBar
                saveText={(formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId && formDataBankGuaranteeDetails.ProposedOfferBankGuaranteeDetailsId > 0) ? 'Update' : 'Add'}
                canAction={canAction && buildingId > 0}
                onSave={handleSaveBankGuaranteeDetails}
                isLoading={isLoading}
            />

            <Modal
                isOpen={isAddUpdateBankGuaranteePaymentStageModalOpen}
                onClose={() => {
                    setIsAddUpdateBankGuaranteePaymentStageModalOpen(false);
                    setEditingBankGuaranteePaymentStageData(null);
                    setFormDataBankGuaranteePaymentStage(initialFormStateBankGuaranteePaymentStage());
                    setErrorsBankGuaranteePaymentStage({});
                }}
                onCancel={() => {
                    setIsAddUpdateBankGuaranteePaymentStageModalOpen(false);
                    setEditingBankGuaranteePaymentStageData(null);
                    setFormDataBankGuaranteePaymentStage(initialFormStateBankGuaranteePaymentStage());
                    setErrorsBankGuaranteePaymentStage({});
                }}
                title={editingBankGuaranteePaymentStageData ? 'Update Bank Guarantee Payment Stage' : 'Add Bank Guarantee Payment Stage'}
                onSubmit={handleAddUpdateBankGuaranteePaymentStage}
                saveText={editingBankGuaranteePaymentStageData ? 'Update' : 'Save'}
                loading={isLoading}
                size='lg'
            >
                <div className="space-y-6 p-6 bg-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">

                        <div>
                            <Input
                                label="Stage"
                                required
                                type="text"
                                value={formDataBankGuaranteePaymentStage.Stage || ''}
                                onChange={(e) => handleFieldChangeBankGuaranteePaymentStage('Stage', e.target.value)}
                                error={errorsBankGuaranteePaymentStage.Stage}
                                placeholder="Enter Stage"
                                maxLength={100}
                            />
                        </div>
                        <div>
                            <Input
                                label="Amount (₹)"
                                required
                                type="text"
                                value={formDataBankGuaranteePaymentStage.Amount}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    handleFieldChangeBankGuaranteePaymentStage('Amount', val);
                                }}
                                error={errorsBankGuaranteePaymentStage.Amount}
                                placeholder="Enter Amount"
                                rightIcon="₹"
                            />
                        </div>
                        <div className="flex items-center">
                            <Checkbox
                                label="Is Release"
                                checked={formDataBankGuaranteePaymentStage.IsRelease ?? false}
                                onChange={(e) => handleFieldChangeBankGuaranteePaymentStage('IsRelease', e.target.checked)}
                            />
                        </div>

                    </div>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenBankGuaranteePaymentStage}
                onClose={() => {
                    setIsConfirmationDialogBoxOpenBankGuaranteePaymentStage(false);
                    setDeleteBankGuaranteePaymentStageData(null);
                }}
                onConfirm={handleDeleteBankGuaranteePaymentStage}
                loading={isLoading}
                pageName='Bank Guarantee payment stage'
            />

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenDeleteAllBankGuaranteeDetails}
                onClose={() => { setIsConfirmationDialogBoxOpenDeleteAllBankGuaranteeDetails(false); }}
                onConfirm={handleDeleteAllBankGuaranteeDetails}
                loading={isLoading}
                pageName='Bank Guarantee'
                title='Are sure you want delete Bank Guarantee Amount?'
                confirmText='Delete All'
            />
        </>
    );
};

