import { Button, Input } from "@/ui/components/forms";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { AddUpdateProposedOfferReadyReckonerRateRequest, DeleteProposedOfferReadyReckonerRateRequest, FilterWithPaginationProposedOfferReadyReckonerRateRequest, ProposedOfferReadyReckonerRateData } from "@/features/proposedOffer/models/ProposedOfferModel";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { proposedOfferService } from "@/features/proposedOffer/services/ProposedOfferService";
import * as E from "fp-ts/Either";
import { initialFormStateReadyReckonerRate } from "../utils/initialStates";
import { DataTable, type TableColumn } from "@/ui/components/DataTable/DataTable";
import { convert_date_yy_mm_dd_To_dd_mm_yyyy, convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/ui/components/Modal/Modal";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { DeleteDialog } from "@/ui/components/forms/DeleteDialog";
import { TextArea } from "@/ui/components/forms/Textarea";
import { getInputValue, isEmpty, isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { FINANCIAL_YEAR } from "@/core/constants";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

interface ReadyReckonerRateTabProps {
    projectId: number | null;
    buildingId: number;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    setLoadingMessage: (message: string) => void;
}

export const ReadyReckonerRateTab: React.FC<ReadyReckonerRateTabProps> = ({
    projectId,
    buildingId,
    isLoading,
    setIsLoading,
    setLoadingMessage,
}) => {
    const [readyReckonerRateList, setReadyReckonerRateList] = useState<ProposedOfferReadyReckonerRateData[]>([]);
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions();
    const [errorsReadyReckonerRate, setErrorsReadyReckonerRate] = useState<{ [k: string]: string }>({});
    const [editingReadyReckonerRateData, setEditingReadyReckonerRateData] = useState<ProposedOfferReadyReckonerRateData | null>(null);
    const [isAddUpdateReadyReckonerRateModalOpen, setIsAddUpdateReadyReckonerRateModalOpen] = useState(false);
    const [formDataReadyReckonerRate, setFormDataReadyReckonerRate] = useState<AddUpdateProposedOfferReadyReckonerRateRequest>(() => initialFormStateReadyReckonerRate());
    const [isConfirmationDialogBoxOpenReadyReckonerRate, setIsConfirmationDialogBoxOpenReadyReckonerRate] = useState(false);
    const [deleteReadyReckonerRateData, setDeleteReadyReckonerRateData] = useState<ProposedOfferReadyReckonerRateData | null>(null);

    useEffect(() => {
        if (!projectId || !buildingId) return;
        setErrorsReadyReckonerRate({});
        fetchReadyReckonerRateData();

    }, [projectId, buildingId]);

    const handleFieldChangeReadyReckonerRate = (field: keyof AddUpdateProposedOfferReadyReckonerRateRequest, value: any) => {
        setFormDataReadyReckonerRate((prev) => ({ ...prev, [field]: value }));
        if (errorsReadyReckonerRate[field]) {
            setErrorsReadyReckonerRate((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const fetchReadyReckonerRateData = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProposedOfferReadyReckonerRateRequest = {
                    ProjectId: Number(projectId),
                    BuildingId: buildingId
                };

                const response = await proposedOfferService.apiCallPullReadyReckonerRate(params);

                if (E.isRight(response)) {

                    const data = response.right.Data || [];

                    setReadyReckonerRateList(data);

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
            'Loading RRR Details'
        );
    };

    const handleAddReadyReckonerRateModal = () => {
        setEditingReadyReckonerRateData(null);
        setFormDataReadyReckonerRate({
            ...initialFormStateReadyReckonerRate(),
            ProjectId: Number(projectId),
            BuildingId: buildingId
        });
        setErrorsReadyReckonerRate({});
        setIsAddUpdateReadyReckonerRateModalOpen(true);
    };

    const handleEditReadyReckonerRate = useCallback((row: ProposedOfferReadyReckonerRateData) => {
        setEditingReadyReckonerRateData(row);
        setFormDataReadyReckonerRate({
            ProposedOfferReadyReckonerRateDetailsId: row.ProposedOfferReadyReckonerRateDetailsId || 0,
            Uniquekey: row.Uniquekey || initialFormStateReadyReckonerRate().Uniquekey,
            BuildingId: buildingId,
            ProjectId: Number(projectId),
            Zone: row.Zone || "",
            SubZone: row.SubZone || "",
            ResidentialRate: row.ResidentialRate ?? 0,
            CommercialRate: row.CommercialRate ?? 0,
            ShopRate: row.ShopRate ?? 0,
            IndustrialRate: row.IndustrialRate ?? 0,
            LandRate: row.LandRate ?? 0,
            EffectiveStartDate: row.EffectiveStartDate || '',
            EffectiveEndDate: row.EffectiveEndDate || '',
            FinancialYear: row.FinancialYear || '',
            Remark: row.Remark || '',
        });

        setErrorsReadyReckonerRate({});
        setIsAddUpdateReadyReckonerRateModalOpen(true);
    }, [projectId, buildingId]);

    const validateReadyReckonerRateForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formDataReadyReckonerRate.FinancialYear) {
            newErrors.FinancialYear = "Financial Year is required"
        }


        const hasEffectiveFromDate = !!formDataReadyReckonerRate.EffectiveStartDate;
        const hasEffectiveToDate = !!formDataReadyReckonerRate.EffectiveEndDate;

        const effectiveFromDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataReadyReckonerRate.EffectiveStartDate ? new Date(formDataReadyReckonerRate.EffectiveStartDate) : undefined);
        const effectiveToDate = convert_date_yy_mm_dd_To_dd_mm_yyyy(formDataReadyReckonerRate.EffectiveEndDate ? new Date(formDataReadyReckonerRate.EffectiveEndDate) : undefined);

        if (!formDataReadyReckonerRate.Zone) {
            newErrors.Zone = "zone is required"
        }
        if (!formDataReadyReckonerRate.SubZone) {
            newErrors.SubZone = "Sub Zone is required"
        }
        if (!formDataReadyReckonerRate.EffectiveStartDate || formDataReadyReckonerRate.EffectiveStartDate.trim() === "") {
            newErrors.EffectiveStartDate = "Effective Date is required"
        }

        if (!formDataReadyReckonerRate.EffectiveEndDate || formDataReadyReckonerRate.EffectiveEndDate.trim() === "") {
            newErrors.EffectiveEndDate = "Effective End Date is required"
        }

        if (hasEffectiveFromDate && hasEffectiveToDate) {
            if (!isToDateGreaterOrEqualFromDate(effectiveFromDate, effectiveToDate)) {
                newErrors.EffectiveEndDate = "Effective To Date must be greater than or equal to Effective From Date.";
            }
        }
        if (isEmpty(formDataReadyReckonerRate.ResidentialRate)) {
            newErrors.ResidentialRate = "Residential Rate is required"
        }

        if (isEmpty(formDataReadyReckonerRate.CommercialRate)) {
            newErrors.CommercialRate = "Commercial Rate is required"
        }

        if (isEmpty(formDataReadyReckonerRate.ShopRate)) {
            newErrors.ShopRate = "Shop Rate is required"
        }

        if (isEmpty(formDataReadyReckonerRate.IndustrialRate)) {
            newErrors.IndustrialRate = "Industrial Rate is required"
        }

        if (isEmpty(formDataReadyReckonerRate.LandRate)) {
            newErrors.LandRate = "Land Rate is required"
        }
        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddUpdateReadyReckonerRate = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorsReadyReckonerRate({});

        const validation = validateReadyReckonerRateForm();

        if (!validation.isValid) {
            setErrorsReadyReckonerRate(validation.errors);
            return;
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const payload: AddUpdateProposedOfferReadyReckonerRateRequest = {
                    ProposedOfferReadyReckonerRateDetailsId: formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId,
                    Uniquekey: formDataReadyReckonerRate.Uniquekey,
                    BuildingId: buildingId,
                    ProjectId: Number(projectId),
                    Zone: formDataReadyReckonerRate.Zone || '',
                    SubZone: formDataReadyReckonerRate.SubZone || '',
                    ResidentialRate: formDataReadyReckonerRate.ResidentialRate || 0,
                    CommercialRate: formDataReadyReckonerRate.CommercialRate || 0,
                    ShopRate: formDataReadyReckonerRate.ShopRate || 0,
                    IndustrialRate: formDataReadyReckonerRate.IndustrialRate || 0,
                    LandRate: formDataReadyReckonerRate.LandRate || 0,
                    EffectiveStartDate: formDataReadyReckonerRate.EffectiveStartDate || '',
                    EffectiveEndDate: formDataReadyReckonerRate.EffectiveEndDate || '',
                    FinancialYear: formDataReadyReckonerRate.FinancialYear || '',
                    Remark: formDataReadyReckonerRate.Remark || '',
                };

                const response = await proposedOfferService.apiCallAddUpdateReadyReckonerRate(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setIsAddUpdateReadyReckonerRateModalOpen(false);

                    setEditingReadyReckonerRateData(null);

                    setFormDataReadyReckonerRate(initialFormStateReadyReckonerRate());

                    setErrorsReadyReckonerRate({});

                    fetchReadyReckonerRateData();

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
            Number(formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId) === 0 ? 'Add RRR' : 'Update RRR'
        )
    };

    const handleConfirmationDialogBoxOpenReadyReckonerRate = useCallback((row: ProposedOfferReadyReckonerRateData) => {
        setDeleteReadyReckonerRateData(row);
        setIsConfirmationDialogBoxOpenReadyReckonerRate(true);
    }, []);

    const handleDeleteReadyReckonerRate = async () => {
        if (!deleteReadyReckonerRateData) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload: DeleteProposedOfferReadyReckonerRateRequest = {
                    ProposedOfferReadyReckonerRateDetailsId: deleteReadyReckonerRateData.ProposedOfferReadyReckonerRateDetailsId || 0,
                    Uniquekey: deleteReadyReckonerRateData.Uniquekey,
                    BuildingId: buildingId,
                    ProjectId: Number(projectId)
                };

                const response = await proposedOfferService.apiCallDeleteReadyReckonerRate(payload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setIsConfirmationDialogBoxOpenReadyReckonerRate(false);

                    setDeleteReadyReckonerRateData(null);

                    fetchReadyReckonerRateData();

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
            'Delete RRR Details'
        )
    };

    const readyReckonerRateDetailsColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'Zone',
                label: 'Zone',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'SubZone',
                label: 'Sub Zone',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'FinancialYear',
                label: 'Financial Year',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value || '-'
            },
            {
                key: 'EffectiveStartDate',
                label: 'Effective Start Date',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
            {
                key: 'EffectiveEndDate',
                label: 'Effective End Date',
                width: '15',
                sortable: false,
                align: 'left',
                render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },

            {
                key: 'ResidentialRate',
                label: 'Residential Rate (₹)',
                width: '15',
                sortable: false,
                align: 'right',
                render: (value) => value ? `₹${value}` : '-'
            },
            {
                key: 'CommercialRate',
                label: 'Commercial Rate (₹)',
                width: '15',
                sortable: false,
                align: 'right',
                render: (value) => value ? `₹${value}` : '-'
            },
            {
                key: 'ShopRate',
                label: 'Shop Rate (₹)',
                width: '15',
                sortable: false,
                align: 'right',
                render: (value) => value ? `₹${value}` : '-'
            },
            {
                key: 'IndustrialRate',
                label: 'Industrial Rate (₹)',
                width: '15',
                sortable: false,
                align: 'right',
                render: (value) => value ? `₹${value}` : '-'
            },
            {
                key: 'LandRate',
                label: 'Land Rate (₹)',
                width: '15',
                sortable: false,
                align: 'right',
                render: (value) => value ? `₹${value}` : '-'
            },
            {
                key: "Remark",
                label: "Remark",
                width: "33",
                sortable: false,
                align: "left",
                render: (value, row) => <TooltipText text={value || row.Remark || "-"} maxWidth="180px" tooltipThreshold={18} />,
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
                key: 'Action',
                label: 'Action',
                width: '15',
                sortable: false,
                align: 'center',
                fixed: 'right',
                render: (_value, row) => (
                    <div className="flex items-center justify-center gap-1 min-w-[100px]">



                        {/* Edit */}
                        {canAction && (
                            <>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleEditReadyReckonerRate(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    size="sm"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>

                                {/* Delete */}
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirmationDialogBoxOpenReadyReckonerRate(row);
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
        [canAction, handleEditReadyReckonerRate, handleConfirmationDialogBoxOpenReadyReckonerRate]
    );

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 border-b border-gray-500 pb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Ready Reckoner Rate Details List
                            </h3>
                        </div>
                        {canAction && buildingId > 0 && (
                            <Button
                                onClick={handleAddReadyReckonerRateModal}
                                color="blue"
                                variant="solid"
                                colorMode="extraLight"
                                style={{ width: '35px', height: '35px' }}
                                centerIcon={<Plus className="h-4 w-4" />}>
                            </Button>
                        )}
                    </div>

                    <DataTable
                        data={readyReckonerRateList}
                        columns={readyReckonerRateDetailsColumns}
                        emptyMessage="No Ready Reckoner Details Found"
                        fixedHeight={false}
                        recordsPerPage={20}
                        className="min-w-full"
                    />
                </div>
            </div>

            {/* ADD UPDATE READY RECKONER DETAILS MODAL */}
            <Modal
                isOpen={isAddUpdateReadyReckonerRateModalOpen}
                onClose={() => {
                    setIsAddUpdateReadyReckonerRateModalOpen(false);
                    setEditingReadyReckonerRateData(null);
                    setFormDataReadyReckonerRate(initialFormStateReadyReckonerRate());
                    setErrorsReadyReckonerRate({});
                }}
                onCancel={() => {
                    setIsAddUpdateReadyReckonerRateModalOpen(false);
                    setEditingReadyReckonerRateData(null);
                    setFormDataReadyReckonerRate(initialFormStateReadyReckonerRate());
                    setErrorsReadyReckonerRate({});
                }}
                title={editingReadyReckonerRateData ? 'Update Ready Reckoner Details' : 'Add Ready Reckoner Details'}
                onSubmit={handleAddUpdateReadyReckonerRate}
                saveText={editingReadyReckonerRateData ? 'Update' : 'Add'}
                loading={isLoading}
                size='lg'
            >
                <div className="space-y-6 p-6 bg-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <Input
                            label="Zone"
                            required
                            type="text"

                            value={formDataReadyReckonerRate.Zone || ''}
                            onChange={(e) => {
                                handleFieldChangeReadyReckonerRate('Zone', e.target.value);
                            }}
                            error={errorsReadyReckonerRate.Zone}
                            placeholder="Enter Zone"
                            maxLength={100}
                        />

                        <Input
                            label="Sub Zone"
                            required
                            type="text"
                            value={formDataReadyReckonerRate.SubZone || ''}
                            onChange={(e) => {
                                handleFieldChangeReadyReckonerRate('SubZone', e.target.value);
                            }}
                            error={errorsReadyReckonerRate.SubZone}
                            placeholder="Enter Sub Zone"
                            maxLength={100}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">


                        <SinglePageSelection
                            label="Financial Year"
                            placeholder="Select Financial Year"
                            required
                            error={errorsReadyReckonerRate.FinancialYear}
                            value={formDataReadyReckonerRate.FinancialYear}
                            onChange={(e) => {
                                handleFieldChangeReadyReckonerRate("FinancialYear", String(e));
                            }}
                            options={FINANCIAL_YEAR.map((opt) => ({
                                label: opt.name,
                                value: opt.id,
                            }))}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <DatePickerInput
                                label="Effective Start Date *"
                                value={formatDate_dd_mm_yyyy(formDataReadyReckonerRate.EffectiveStartDate)}
                                error={errorsReadyReckonerRate.EffectiveStartDate}
                                onChange={(val) => handleFieldChangeReadyReckonerRate('EffectiveStartDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}

                            />
                        </div>
                        <div>
                            <DatePickerInput
                                label="Effective End Date *"
                                value={formatDate_dd_mm_yyyy(formDataReadyReckonerRate.EffectiveEndDate)}
                                error={errorsReadyReckonerRate.EffectiveEndDate}
                                onChange={(val) => handleFieldChangeReadyReckonerRate('EffectiveEndDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            />
                        </div>
                        <div>
                            <Input
                                label="Residential Rate (₹)"
                                required
                                type="text"
                                rightIcon="₹"
                                value={getInputValue(formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId, formDataReadyReckonerRate.ResidentialRate)}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    handleFieldChangeReadyReckonerRate('ResidentialRate', val);
                                }}
                                error={errorsReadyReckonerRate.ResidentialRate}
                                placeholder="Enter Residential Rate"
                            />
                        </div>
                        <div>
                            <Input
                                label="Commercial Rate (₹)"
                                required
                                type="text"
                                rightIcon="₹"
                                value={getInputValue(formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId, formDataReadyReckonerRate.CommercialRate)}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    handleFieldChangeReadyReckonerRate('CommercialRate', val);
                                }}
                                error={errorsReadyReckonerRate.CommercialRate}
                                placeholder="Enter Commercial Rate"
                            />
                        </div>
                        <div>
                            <Input
                                label="Shop Rate (₹)"
                                required
                                type="text"
                                rightIcon="₹"
                                value={getInputValue(formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId, formDataReadyReckonerRate.ShopRate)}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    handleFieldChangeReadyReckonerRate('ShopRate', val);
                                }}
                                error={errorsReadyReckonerRate.ShopRate}
                                placeholder="Enter Shop Rate"
                            />
                        </div>
                        <div>
                            <Input
                                label="Industrial Rate (₹)"
                                required
                                type="text"
                                rightIcon="₹"
                                value={getInputValue(formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId, formDataReadyReckonerRate.IndustrialRate)}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    handleFieldChangeReadyReckonerRate('IndustrialRate', val);
                                }}
                                error={errorsReadyReckonerRate.IndustrialRate}
                                placeholder="Enter Industrial Rate"
                            />
                        </div>
                        <div>
                            <Input
                                label="Land Rate (₹)"
                                required
                                type="text"
                                rightIcon="₹"
                                value={getInputValue(formDataReadyReckonerRate.ProposedOfferReadyReckonerRateDetailsId, formDataReadyReckonerRate.LandRate)}
                                onChange={(e) => {
                                    const val = filterNumbersWithDecimal(e.target.value);
                                    handleFieldChangeReadyReckonerRate('LandRate', val);
                                }}
                                error={errorsReadyReckonerRate.LandRate}
                                placeholder="Enter Land Rate"
                            />
                        </div>



                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div>
                            <TextArea
                                label="Remark"
                                className='thin-scroll'
                                value={formDataReadyReckonerRate.Remark ?? ""}
                                placeholder="Enter Remark"
                                onChange={(e) => handleFieldChangeReadyReckonerRate("Remark", e.target.value)}
                            />
                        </div>
                    </div>

                </div>
            </Modal>

            <DeleteDialog
                isOpen={isConfirmationDialogBoxOpenReadyReckonerRate}
                onClose={() => {
                    setIsConfirmationDialogBoxOpenReadyReckonerRate(false);
                    setDeleteReadyReckonerRateData(null);
                }}
                onConfirm={handleDeleteReadyReckonerRate}
                loading={isLoading}
                pageName='ready reckoner'
            />


        </>
    );
};



