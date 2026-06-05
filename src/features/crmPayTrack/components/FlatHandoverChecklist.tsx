import { useCallback, useEffect, useMemo, useState } from "react"
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { runApiWithLoader } from "@/core/utils";
import * as E from "fp-ts/Either";
import { SinglePageSelection } from "@/ui/components/DropDown/SinglePageSelection";
import { HANDOVER_STATUS } from "@/core/constants";
import { Button } from "@/ui/components/forms";
import { Loader } from "@/core/utils/loader";
import type { AddUpdateFlatHandoverChecklistRequest, FilterWithPaginationFlatHandoverChecklist, FlatHandoverChecklistData } from "@/features/crmPayTrack/models/FlatHandoverCheckListModel";
import { flatHandoverChecklistService } from "@/features/crmPayTrack/services/FlatHandoverCheckListService";
import { TextArea } from "@/ui/components/forms/Textarea";
import Tabs from "@/ui/components/Tab/Tab";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Modal } from "@/ui/components/Modal/Modal";
import { Edit } from "lucide-react";

export const FlatHandoverChecklist: React.FC = () => {

    const [flatHandoverCheckListData, setFlatHandoverCheckListData] = useState<FlatHandoverChecklistData[]>([]);
    const [editFlatHandoverCheckListData, setEditFlatHandoverCheckListData] = useState<FlatHandoverChecklistData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { listState } = usePayTrackBookingListState();
    const { bookingId } = listState;
    const { canAction } = useMenuPermissions();
    const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
    const [formData, setFormData] = useState<FlatHandoverChecklistData | null>(null);
    const [errors, setErrors] = useState<{ [k: string]: string }>({});

    const sectionList = [
        "Additional & Project - Specific Charges",
        "Compliance & Statutory",
        "Customer Agreement & Documentation",
        "Final Approval for Possession",
        "Handover to CRM",
        "Internal Finance Documentation",
        "Payment & Ledger"
    ];

    const FlatHandoverChecklistTabList = useMemo(() => {

        return sectionList.map((section) => {
            const pendingCount = flatHandoverCheckListData.filter(
                (item) =>
                    item.Section === section &&
                    item.Status === "Pending"
            ).length;

            return {
                id: section,
                label: `${section} (${pendingCount})`
            };
        });

    }, [flatHandoverCheckListData]);

    const [activeTab, setActiveTab] = useState<string>(FlatHandoverChecklistTabList[0].id)

    useEffect(() => {

        if (!projectId) return
        loadFlatHandoverChecklistData()
    }, [projectId, bookingId])

    const loadFlatHandoverChecklistData = useCallback(async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationFlatHandoverChecklist = {
                    ProjectId: Number(projectId),
                    BookingId: bookingId
                }

                const response = await flatHandoverChecklistService.apiCallFlatHandoverChecklist(params);

                if (E.isRight(response)) {

                    setFlatHandoverCheckListData(response.right.Data);

                } else {
                    addToast({ type: "error", title: response.left.message });
                }
                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: "error", title: error.message });
            },
            undefined,
            "Loading Flat Handover Checklist"
        )
    }, [projectId, bookingId])

    useEffect(() => {
        if (isAddUpdateModalOpen) {
            if (editFlatHandoverCheckListData) {
                setFormData({
                    ...editFlatHandoverCheckListData
                });
            }
            setErrors({});
        }
    }, [isAddUpdateModalOpen, editFlatHandoverCheckListData, projectId]);

    const validateFlatHandoverChecklist = (): {
        isValid: boolean;
        errors: { [key: string]: string };
    } => {
        const newErrors: { [key: string]: string } = {};

        if (!formData?.Status || !formData.Status.trim()) {
            newErrors.Status = "Status is required";
        }

        if (formData?.Status === "Pending" && !formData?.Remark?.trim()) {
            newErrors.Remark = "Remark is required";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const PushFlatHandoverChecklistFormData = (): AddUpdateFlatHandoverChecklistRequest => {
        return {
            ProjectId: Number(projectId),
            BookingId: bookingId,
            FlatHandoverCheckListJSON: JSON.stringify([
                {
                    FlatHandOverCheckListId: formData?.FlatHandOverCheckListId || 0,
                    Status: formData?.Status || null,
                    Remark: formData?.Remark || null,
                }
            ])
        };
    };

    const handleAddUpdateFlatHandoverChecklist = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({})
        const validation = validateFlatHandoverChecklist()

        if (!validation.isValid) {
            setErrors(validation.errors)
            return
        }
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushFlatHandoverChecklistFormData();

                const response = await flatHandoverChecklistService.apiCallAddUpdateFlatHandoverChecklist(payload);

                if (E.isRight(response)) {

                    setFlatHandoverCheckListData(response.right.Data);

                    setIsAddUpdateModalOpen(false);

                    loadFlatHandoverChecklistData();

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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
            'Add Update Flat Handover Checklist '
        )
    };

    const handleFieldChange = (field: keyof FlatHandoverChecklistData, value: any) => {
        setFormData((prev) => {
            if (!prev) return prev;
            return { ...prev, [field]: value, };
        });

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "", }));
        }
    };

    const filteredFlatHandoverChecklistData = useMemo(() => {
        return flatHandoverCheckListData.filter(
            (item) => item.Section === activeTab
        );
    }, [flatHandoverCheckListData, activeTab]);

    const handleEditFlatHandoverCheckListData = useCallback((row: FlatHandoverChecklistData) => {
        setEditFlatHandoverCheckListData(row);
        setFormData({
            ...row
        });
        setErrors({});
        setIsAddUpdateModalOpen(true);
    }, []);

    return (
        <div className="pt-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="mb-5">
                <Tabs
                    tabs={FlatHandoverChecklistTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                    }}
                />
            </div>

            {filteredFlatHandoverChecklistData.map((item, index) => {
                return (
                    <div key={index} className="gap-x-4 rounded-lg shadow-sm border border-gray-300 p-4 mb-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FieldItem label="Checklist items" value={item.Items} />
                            <FieldItem label="Status" value={item.Status} />

                            <div className="flex justify-between gap-2">
                                <FieldItem label="Remark" value={item.Remark} />

                                {canAction && (
                                    <Button
                                        style={{
                                            color: 'blue',
                                            padding: '0px 8px'

                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleEditFlatHandoverCheckListData(item)
                                        }}
                                        color="transparent"
                                        isborderRadius
                                        size="sm"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}

                            </div>
                        </div>
                    </div>
                )
            })}

            <Modal
                isOpen={isAddUpdateModalOpen}
                onClose={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditFlatHandoverCheckListData(null)
                    setErrors({});
                }}
                onCancel={() => {
                    setIsAddUpdateModalOpen(false);
                    setEditFlatHandoverCheckListData(null)
                    setErrors({});
                }}
                title={'Update'}
                saveText="Update"
                onSubmit={handleAddUpdateFlatHandoverChecklist}
                loading={isLoading}
                size="xl"
            >
                <div className="space-y-10 p-6 bg-blue-100">
                    <div className="space-y-4" >

                        <div>
                            <div >
                                <SinglePageSelection
                                    label="Status"
                                    placeholder="Select Status"
                                    value={formData?.Status ?? ""}
                                    onChange={(e) => handleFieldChange("Status", String(e))}
                                    options={HANDOVER_STATUS.map((opt) => ({ label: opt.name, value: opt.id, }))}
                                    error={errors.Status}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <TextArea
                                label="Remark"
                                className='thin-scroll'
                                value={formData?.Remark ?? ""}
                                placeholder="Enter Remark"
                                onChange={(e) => handleFieldChange("Remark", e.target.value)}
                                error={errors.Remark}
                                rows={5}
                                autoResize={false}
                            />

                        </div>

                    </div>
                </div>
            </Modal>

        </div>
    )
}

export default FlatHandoverChecklist