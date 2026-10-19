import { useEffect, useState } from "react";
import type { AddUpdateCostToCompanyData, FilterWithPaginationCostToCompanyRequest } from "../models/CostToCompanyModel";
import useToast from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { useNavigate, useParams } from "react-router-dom";
import { runApiWithLoader } from "@/core/utils";
import { CostToCompanyService } from "../services/CostToCompanyService";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { Input } from "@/ui/components/forms";
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy } from "@/core/utils/dateFormat";

const initialFormStateForCostToCompany = (): AddUpdateCostToCompanyData => ({
    CostToCompanyId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    EmployeeId: 0,
    EffectiveFromDate: "",
    EffectiveToDate: "",
    AnnualCTC: 0,
    MonthlyCTC: 0,
    IsProvidentFund: false,
    EmployeesStateInsuranceCorporation: false,
})

export const AddUpdateCostToCompany: React.FC = () => {

    const [formData, setFormData] = useState<AddUpdateCostToCompanyData>(() => initialFormStateForCostToCompany());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions();
    const navigate = useNavigate();

    const { CostToCompanyId } = useParams<{ CostToCompanyId?: string }>();
    const costToCompanyId = CostToCompanyId ? Number(CostToCompanyId) : 0;

    const isAddMode = costToCompanyId === 0;

    const [dropdownLabels, setDropdownLabels] = useState<{
        employee?: string;
    }>({});

    useEffect(() => {
        if (!isAddMode) {
            fetchCostToCompany();
        }
    }, [costToCompanyId]);

    const fetchCostToCompany = async () => {

        await runApiWithLoader(

            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationCostToCompanyRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    CostToCompanyId: Number(CostToCompanyId),
                };

                const response = await CostToCompanyService.apiCallPullCostToCompany(params);

                if (E.isRight(response)) {

                    const e = response.right.Data?.[0];

                    if (e) {
                        setFormData(prev => ({
                            ...prev,
                            CostToCompanyId: e.CostToCompanyId ?? prev.CostToCompanyId,
                            Uniquekey: e.Uniquekey ?? prev.Uniquekey,
                            MonthlyCTC: e.MonthlyCTC ?? prev.MonthlyCTC,
                            EmployeeId: e.EmployeeId ?? prev.EmployeeId,
                            EffectiveFromDate: e.EffectiveFromDate ?? prev.EffectiveFromDate,
                            EffectiveToDate: e.EffectiveToDate ?? prev.EffectiveToDate,
                            IsProvidentFund: e.IsProvidentFund ?? prev.IsProvidentFund,
                            AnnualCTC: e.AnnualCTC ?? prev.AnnualCTC,
                            EmployeesStateInsuranceCorporation: e.EmployeesStateInsuranceCorporation ?? prev.EmployeesStateInsuranceCorporation
                        }));
                        setDropdownLabels({
                            employee: e.EmployeeName || ""
                        })
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
            'Loading Cost To Company'
        );
    };

    const PushCostToCompanyData = (): AddUpdateCostToCompanyData => {

        return {
            CostToCompanyId: formData.CostToCompanyId,
            Uniquekey: formData.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            AnnualCTC: formData.AnnualCTC,
            MonthlyCTC: formData.MonthlyCTC,
            EmployeesStateInsuranceCorporation: formData.EmployeesStateInsuranceCorporation,
            IsProvidentFund: formData.IsProvidentFund,
            EmployeeId: formData.EmployeeId,
            EffectiveFromDate: formData.EffectiveToDate,
            EffectiveToDate: formData.EffectiveToDate
        };
    };

    const validationAddUpdateCostToCompanyData = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.AnnualCTC) {
            newErrors.AnnualCTC = "Annual CTC is required";
        }

        if (!formData.MonthlyCTC) {
            newErrors.MonthlyCTC = "Monthly CTC is required";
        }

        if (!formData.EmployeeId) {
            newErrors.EmployeeId = "Employee Name is required";
        }

        if (!formData.EffectiveFromDate) {
            newErrors.EffectiveFromDate = "Effective From Date is required";

        } if (!formData.EffectiveToDate) {
            newErrors.EffectiveToDate = "Effective To Date is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleAddUpdateCostToCompany = async () => {
        setErrors({})

        const validation = validationAddUpdateCostToCompanyData();

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushCostToCompanyData();

                const response = await CostToCompanyService.apiCallAddUpdateCostToCompany(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/costToCompany");

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
            isAddMode ? 'Add Cost To Company' : 'Update Cost To Company'
        );
    };

    const handleFieldChange = (field: keyof AddUpdateCostToCompanyData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="space-y-4 pb-3">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Cost To Company Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <SingleSelectDropdownWithPagination
                            label="Employee Name"
                            required
                            title="Select Employee"
                            size="lg"
                            dataFetchCallBack={fetchEmployeeMasterDropdown}
                            onSelected={(item) => {
                                if (!item) {

                                    handleFieldChange("EmployeeId", null);
                                    return;
                                }

                                handleFieldChange("EmployeeId", Number(item.value));
                            }}
                            initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employee)}
                            error={errors.EmployeeId}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Annual CTC'
                            value={formData.AnnualCTC || ''}
                            onChange={e => handleFieldChange("AnnualCTC", e.target.value)}
                            placeholder="Enter Annual CTC"
                            maxLength={70}
                            required
                            error={errors.AnnualCTC}
                        />
                    </div>

                    <div>
                        <Input
                            type="text"
                            label='Monthly CTC'
                            value={formData.MonthlyCTC || ''}
                            onChange={e => handleFieldChange("MonthlyCTC", e.target.value)}
                            placeholder="Enter Monthly CTC"
                            maxLength={70}
                            required
                            error={errors.MonthlyCTC}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Effective From Date"
                            required
                            value={formatDate_dd_mm_yyyy(formData.EffectiveFromDate)}
                            onChange={(val) => handleFieldChange('EffectiveFromDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            error={errors.EffectiveFromDate}
                        />
                    </div>

                    <div>
                        <DatePickerInput
                            label="Effective To Date"
                            required
                            value={formatDate_dd_mm_yyyy(formData.EffectiveToDate)}
                            onChange={(val) => handleFieldChange('EffectiveToDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            error={errors.EffectiveToDate}
                        />
                    </div>
                </div>

            </div>

            <BottomActionBar
                saveText={formData.CostToCompanyId ? "Update" : " Add"}
                cancelText="Cancel"
                onCancel={() => navigate(-1)}
                canAction={canAction}
                onSave={() => {
                    handleAddUpdateCostToCompany();
                }}
                isLoading={isLoading}
            />

        </div>
    )
}
export default AddUpdateCostToCompany;