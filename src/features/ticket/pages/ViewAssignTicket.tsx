import { useEffect, useState } from "react";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useTicketListState } from "@/features/ticket/context/TicketListStateContext";
import { useNavigate } from "react-router";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import type { FilterWithPaginationTicket } from "@/features/ticket/models/TicketModel";
import { ticketService } from '@/features/ticket/services/TicketService';
import * as E from 'fp-ts/Either';
import { useToast } from "@/core/hooks/useToast";
import type { TicketData } from "@/features/ticket/models/TicketModel";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import SingleSelectDropdownWithPagination from "@/ui/components/DropDown/SingleSelectDropdownWithPagination";
import { createDropdownInitialValue } from "@/core/utils/createDropdownInitialValue";
import type { AddUpdateAssignedTicketsRequest } from "@/features/ticket/models/TicketModel";
import MultiSelectPagination from "@/ui/components/DropDown/Multiselectpagination";
import { useMultiSelectDropdown } from "@/core/hooks/useMultiSelectDropdown";
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { ASSIGN_STATUS_TYPE_OPTIONS } from "@/core/constants";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import BottomActionBar from "@/ui/components/forms/BottomActionBar";
import { fetchCollaboratorWithTicketsDropdown } from '@/features/employeeMaster/employeeMasterDropDown'
import { formatDate_dd_mm_yyyy, convert_date_yy_mm_dd_To_dd_mm_yyyy } from "@/core/utils/dateFormat";
import { TextArea } from "@/ui/components/forms/Textarea";
import { isToDateGreaterOrEqualFromDate } from "@/core/utils/comman";

const initialFormState = (): AddUpdateAssignedTicketsRequest => ({
    TicketId: 0,
    AssignToEmployeeId: 0,
    CollaboratorsEmployeeId: '',
    ResolvedTillDate: '',
    AssignedStatus: 'Open',
    TicketRemark: '',
})

export const ViewAssignTicket = () => {

    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedCollaboratorNames, setSelectedCollaboratorNames] = useState<string | number | null>(null);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});
    const [formData, setFormData] = useState<AddUpdateAssignedTicketsRequest>(() => initialFormState());
    const { listState } = useTicketListState();
    const { SystemGeneratedCode, Platform, TicketId } = listState;
    const { addToast } = useToast();
    const navigate = useNavigate();
    const currentTicketMasterId = TicketId;
    const priority = ticketData?.Priority;

    const [dropdownLabels, setDropdownLabels] = useState<{
        employeeName?: string;
        collaboratorName?: string;
    }>({});

    const collaboratorsDropDown = useMultiSelectDropdown({
        value: selectedCollaboratorNames,
        fetchCallback: fetchCollaboratorWithTicketsDropdown,
        autoFetchOptions: true,
    });

    useEffect(() => {

        if (!currentTicketMasterId) return;

        loadTicketMasterList();
    }, [currentTicketMasterId]);

    const loadTicketMasterList = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTicket = {
                    PageNumber: 1,
                    PageSize: 1,
                    TicketId: Number(currentTicketMasterId) || 0,
                }

                const response = await ticketService.apiCallPullTicket(params);

                if (E.isRight(response)) {

                    setTicketData(response.right.Data?.[0] ?? null);

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
            'Loading Single Ticket'
        );
    };

    useEffect(() => {
        if (ticketData) {

            setFormData({
                TicketId: ticketData.TicketId || 0,
                AssignToEmployeeId: ticketData.EmployeeId || 0,
                CollaboratorsEmployeeId: ticketData.CollaboratorsEmployeeId || '',
                ResolvedTillDate: ticketData.ResolvedTillDate ? formatDate_dd_mm_yyyy(ticketData.ResolvedTillDate) : '',
                AssignedStatus: ticketData.AssignedStatus || 'Open',
                TicketRemark: ticketData.AssignedRemark || '',
            });

            setDropdownLabels({
                employeeName: ticketData.EmployeeName || "",
                collaboratorName: ticketData.CollaboratorsName || ""
            });

            if (ticketData.CollaboratorsEmployeeId) {
                setSelectedCollaboratorNames(ticketData.CollaboratorsEmployeeId);
            }
        }
    }, [ticketData]);

    const handleFieldChange = (field: keyof AddUpdateAssignedTicketsRequest, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const PushAssignTicketData = (): FormData => {

        const fd = new FormData();
        fd.append("TicketId", String(currentTicketMasterId));
        fd.append("AssignToEmployeeId", String(formData.AssignToEmployeeId));
        fd.append("CollaboratorsEmployeeId", String(formData.CollaboratorsEmployeeId));
        fd.append("AssignedStatus", String(formData.AssignedStatus));
        fd.append("TicketRemark", String(formData.TicketRemark));
        fd.append("ResolvedTillDate", String(formData.ResolvedTillDate));

        return fd;

    }

    const validateAddAssignTicketForm = (): {

        isValid: boolean

        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.AssignToEmployeeId) {
            newErrors.AssignToEmployeeId = 'Primary Assignee is required';
        }

        if (!formData.ResolvedTillDate) {

            newErrors.ResolvedTillDate = "Estimated Completion Date is required";

        } else {

            const today = convert_date_yy_mm_dd_To_dd_mm_yyyy(new Date());

            if (!isToDateGreaterOrEqualFromDate(today, formData.ResolvedTillDate)) {

                newErrors.ResolvedTillDate = "Estimated Completion Date cannot be less than today";
            }
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };

    const handleAddUpdateAssignTicket = async () => {

        setErrors({});

        const validation = validateAddAssignTicketForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {
                const payload = PushAssignTicketData();

                const response = await ticketService.apiCallAddUpdateAssignedTickets(payload);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/ticket");

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
            "Ticket Assigned Successfully"
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="flex justify-between">
                <HeaderActionBar
                    subTitleText={SystemGeneratedCode}
                    subSubTitleText={Platform ?? "-"}
                    onCancel={() => {
                        navigate('/ticket');
                    }}
                />
                <p>
                    Priority : {" "}
                    {priority === "High" || priority === "Medium" || priority === "Low" ? (
                        <span
                            className={
                                priority === "High"
                                    ? "text-red-500 font-semibold"
                                    : priority === "Medium"
                                        ? "text-orange-500 font-semibold"
                                        : "text-green-500 font-semibold"
                            }
                        >
                            {priority}
                        </span>
                    ) : (
                        <span>-</span>
                    )}
                </p>
            </div>

            <div className="mt-5">
                <section className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                        <FieldItem label="Platform" value={ticketData?.Platform} />
                        <FieldItem label="Module" value={ticketData?.Module} />
                        <FieldItem label="Raised By" value={ticketData?.CreatedBy} />
                    </div>
                    <div className="mt-3">
                        <FieldItem label="Description" value={ticketData?.TicketDescription} />
                    </div>
                </section>
            </div>

            <div className="space-y-4 pb-3 mt-5" >
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">Assign Ticket</h3>
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        <div>
                            <SingleSelectDropdownWithPagination
                                required
                                label="Primary Assignee"
                                title="Select Primary Assignee"
                                size="lg"
                                dataFetchCallBack={fetchCollaboratorWithTicketsDropdown}
                                onSelected={(item) => {
                                    handleFieldChange(
                                        "AssignToEmployeeId",
                                        Number(item?.value)
                                    );

                                    setDropdownLabels((prev) => ({
                                        ...prev,
                                        employeeName: item?.label || "",
                                    }));
                                }}
                                initialValue={createDropdownInitialValue(
                                    formData.AssignToEmployeeId,
                                    dropdownLabels.employeeName
                                )}
                                error={errors.AssignToEmployeeId}
                            />
                        </div>
                        <div>
                            <MultiSelectPagination
                                label="Collaborators"
                                dataFetchCallBack={fetchCollaboratorWithTicketsDropdown}
                                selectedValues={collaboratorsDropDown.selectedValues}
                                options={collaboratorsDropDown.initialOptions}
                                onChange={(values) => {
                                    const { idsString } = collaboratorsDropDown.handleChange(values);
                                    setSelectedCollaboratorNames(idsString || null);
                                    handleFieldChange(
                                        "CollaboratorsEmployeeId",
                                        idsString
                                    );
                                }}
                            />
                        </div>
                        <div>
                            <DatePickerInput
                                required
                                label="Estimated Completion Date"
                                value={formData.ResolvedTillDate}
                                placeholder="Enter Estimated Completion Date"
                                onChange={(date) =>
                                    handleFieldChange("ResolvedTillDate", date)
                                }
                                error={errors.ResolvedTillDate}
                                disabled={isLoading}
                            />
                        </div>
                        <div >
                            <SinglePageSelection
                                label="Assigned Status"
                                placeholder="Assigned Status"
                                value={formData.AssignedStatus}
                                onChange={(e) => handleFieldChange("AssignedStatus", String(e))}
                                options={ASSIGN_STATUS_TYPE_OPTIONS.map((opt) => ({
                                    label: opt.name,
                                    value: opt.id,
                                }))}
                            />
                        </div>

                    </div>
                    <div>
                        <TextArea
                            label="Remark"
                            placeholder="Remark"
                            value={formData.TicketRemark || ""}
                            onChange={(e) => handleFieldChange("TicketRemark", e.target.value)}
                        />
                    </div>
                </section>

                <BottomActionBar
                    saveText={"Assign"}
                    cancelText="Cancel"
                    canAction={true}
                    onSave={() => {
                        handleAddUpdateAssignTicket();
                    }}
                    onCancel={() => {
                        navigate('/ticket');
                    }}
                />
            </div>
        </div>
    )
}

export default ViewAssignTicket;