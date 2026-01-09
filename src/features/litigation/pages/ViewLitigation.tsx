
import { useLocation, useNavigate } from "react-router-dom";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import type { AddUpdateLitigationClosureRequest, AddUpdateLitigationHearingRequest, DeleteLitigationHearingRequest, FilterWithPaginationLitigationClosureRequest, FilterWithPaginationLitigationHearingRequest, LitigationClosureData, LitigationData, LitigationHearingData } from "../models/LitigationModel";
import { useEffect, useState } from "react";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { Modal } from "@/ui/components/Modal/Modal";
import { Button, Input } from "@/ui/components/forms";
import DatePickerInput from "@/ui/components/forms/Datepicker";
import MultiFilePicker from "@/ui/components/ImagePicker/MultiFilePicker";
import { litigationService } from "@/features/litigation/services/LitigationServices";
import useToast from "@/core/hooks/useToast";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from "@/core/utils";
import { Loader } from "@/core/utils/loader";
import { Edit, Trash2 } from "lucide-react";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";


const ViewLitigation: React.FC = () => {

    //#region STATE MANAGEMENT
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [editClosureData, setEditClosureData] = useState<LitigationClosureData[]>([]);
    const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
    const [, setIsEditClosureMode] = useState(false);

    const [editHearingData, setEditHearingData] = useState<LitigationHearingData[]>([]);
    const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
    const [, setIsEditHearingMode] = useState(false);

    // Delete confirmation states
    const [isDeleteHearingDialogOpen, setIsDeleteHearingDialogOpen] = useState(false);
    const [selectedHearingItem, setSelectedHearingItem] = useState<LitigationHearingData | null>(null);

    // NAVIGATE
    const navigate = useNavigate();
    const location = useLocation();

    // HEARING ATTACHMENT URL FILES
    const [hearingURLFile, setHearingURLFiles] = useState<(File | string)[]>([]);

    // REMOVE HEARING ATTACHMENT URL
    const [removeHearingAttachementURL, SetRemoveHearingAttachementURL] = useState<string[]>([]);

    // CLOSURE ATTACHMENT URL FILES
    const [closureURLFile, setClosureURLFiles] = useState<(File | string)[]>([]);

    // REMOVE CLOSURE ATTACHMENT URL
    const [removeClosureAttachementURL, SetRemoveClosureAttachementURL] = useState<string[]>([]);

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/litigation');
    //#endregion

    // TOAST
    const { addToast } = useToast();

    // PROJECT CONTEXT
    const projectContext = useProject();
    const projectId = projectContext?.projectId;
    const closureDetails = editClosureData?.[0];

    // EDIT LITIGATION DATA FROM STATE
    const editLitigationData = location.state?.editLitigationData as LitigationData;
    const isEditable = canAction && editLitigationData?.Status === 'Open';

    // MESSAGE IF DATA NOT FOUND
    if (!editLitigationData) return <div>No Litigation Data Found</div>;

    //#region ERROR STATE MANAGEMENT
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    //#region HANDLE FIELD CHANGE EVENT
    const handleFieldChange = (field: keyof AddUpdateLitigationClosureRequest, value: any) => {
        setClosureFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    //#region USE EFFECT TO FETCH CLOSURE DETAILS
    useEffect(() => {
        if (!projectId) return;
        fetchClouserDetails();
        fetchHearingDetails();

    }, [projectId, addToast]);
    //#endregion

    //#region CLOSURE MODAL MANAGEMENT
    const [closureFormData, setClosureFormData] = useState<AddUpdateLitigationClosureRequest>({
        LitigationClosureId: 0,
        Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        LitigationId: editLitigationData.LitigationId,
        ProjectId: Number(projectId) || 0,
        ClosureDate: '',
        Conclusion: '',
        Remark: '',
        ClosureAttachementURL: '',
        RemoveClosureAttachementURL: '',
    });

    const handleopenClosureModal = (item?: LitigationClosureData) => {

        const status = editLitigationData?.Status;
        if (status !== 'Open' && status !== 'Reopen') {
            return;
        }
        if (item) {
            setClosureFormData({
                LitigationClosureId: item.LitigationClosureId,
                Uniquekey: item.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                LitigationId: item.LitigationId,
                ProjectId: projectId || 0,
                ClosureDate: item.ClosureDate || '',
                Conclusion: item.Conclusion || '',
                Remark: item.Remark || '',
                ClosureAttachementURL: item.ClosureAttachementURL || null,
                RemoveClosureAttachementURL: '',
            });
            setIsEditClosureMode(true);
        } else {

            setClosureFormData({
                LitigationClosureId: 0,
                Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                LitigationId: editLitigationData.LitigationId!,
                ProjectId: Number(projectId),
                ClosureDate: '',
                Conclusion: '',
                Remark: '',
                ClosureAttachementURL: null,
                RemoveClosureAttachementURL: '',
            });
            setIsEditClosureMode(false);
            setClosureURLFiles([])
            SetRemoveClosureAttachementURL([]);
        }
        setErrors({});
        setIsClosureModalOpen(true);
    };
    //#endregion

    //#region CLOSE CLOSURE MODAL
    const handleClosureModal = () => {
        setIsClosureModalOpen(false);
        setIsEditClosureMode(false);
        setClosureFormData({
            LitigationClosureId: 0,
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            LitigationId: editLitigationData.LitigationId!,
            ProjectId: Number(projectId),
            ClosureDate: '',
            Conclusion: '',
            Remark: '',
            ClosureAttachementURL: '',
            RemoveClosureAttachementURL: '',
        });
        setErrors({});
    };
    //endregion

    //#region FETCH CLOSURE DETAILS
    const fetchClouserDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationLitigationClosureRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    LitigationClosureId: 0,
                    ProjectId: Number(projectId),
                    LitigationId: editLitigationData.LitigationId

                };

                const response = await litigationService.apiCallPullLitigationClosure(params);

                if (E.isRight(response)) {

                    setEditClosureData(response.right.Data);

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
            'Loading Closure Details'
        );
    };
    //#endregion

    //Validation Function
    const validateAddClosureForm = (): {

        isValid: boolean
        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!closureFormData.ClosureDate?.trim()) {
            newErrors.ClosureDate = 'Closure Date is required.';
        }
        if (!closureFormData.Conclusion?.trim()) {
            newErrors.Conclusion = 'Conclusion is required.';
        }
        if (!closureFormData.Remark?.trim()) {
            newErrors.Remark = 'Remark is required.';
        }
        const hasFile = closureFormData.ClosureAttachementURL || closureURLFile.length > 0 || closureFormData.ClosureAttachementURL;
        if (!hasFile) {
            newErrors.ClosureAttachementURL = "Closure Attachment is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH  DATA
    const PushClosureFormData = (): FormData => {
        const fd = new FormData();

        fd.append('LitigationClosureId', closureFormData.LitigationClosureId.toString());
        fd.append('Uniquekey', closureFormData.Uniquekey ?? '');
        fd.append('LitigationId', editLitigationData.LitigationId!.toString());
        fd.append('ProjectId', projectId!.toString());
        fd.append('ClosureDate', closureFormData.ClosureDate ?? '');
        fd.append('Conclusion', closureFormData.Conclusion ?? '');
        fd.append('Remark', closureFormData.Remark ?? '');

        closureURLFile.forEach(file => {
            if (file instanceof File) {
                fd.append('ClosureAttachementURL', file);
            }
        });

        fd.append('RemoveClosureAttachementURL', removeClosureAttachementURL.join(','));
        return fd;
    };
    //#endregion

    //#region ADD AND UPDATE CLOSURE 
    const handleUpdateClosure = async (e: React.FormEvent) => {

        e.preventDefault();

        setErrors({});

        const validation = validateAddClosureForm();

        if (!validation.isValid) {

            setErrors(validation.errors);

            return;
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,

            async () => {
                const payload = PushClosureFormData();

                const response = await litigationService.apiCallAddUpdateLitigationClosure(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    setIsClosureModalOpen(false);
                    editLitigationData.Status = "Closed";
                    fetchClouserDetails();

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
            closureFormData.LitigationClosureId ? 'Updating Closure' : 'Adding Closure'
        );
    };
    //#endregion

    //#region HEARING MODAL MANAGEMENT
    const [hearingFormData, setHearingFormData] = useState<AddUpdateLitigationHearingRequest>({
        LitigationHearingId: 0,
        Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        LitigationId: editLitigationData.LitigationId!,
        ProjectId: Number(projectId) || 0,
        HearingDate: '',
        Remark: '',
        HearingAttachementURL: '',
        RemoveHearingAttachementURL: '',
    });

    const handleopenHearingModal = (item?: Partial<LitigationHearingData>) => {
        if (item?.LitigationHearingId) {
            setHearingFormData({
                LitigationHearingId: item.LitigationHearingId,
                Uniquekey: item.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                LitigationId: editLitigationData.LitigationId!,
                ProjectId: projectId || 0,
                HearingDate: item.HearingDate || '',
                Remark: item.Remark || '',
                HearingAttachementURL: item.HearingAttachementURL || null,
                RemoveHearingAttachementURL: '',
            });
            setIsEditHearingMode(true);
        } else {
            setHearingFormData({
                LitigationHearingId: 0,
                Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                LitigationId: editLitigationData.LitigationId!,
                ProjectId: Number(projectId),
                HearingDate: '',
                Remark: '',
                HearingAttachementURL: null,
                RemoveHearingAttachementURL: '',
            });
            setIsEditHearingMode(false);
            setHearingURLFiles([]);
            SetRemoveHearingAttachementURL([]);
        }
        setErrors({});
        setIsHearingModalOpen(true);
    };
    //#endregion

    //#region HEARING  MODAL
    const handleHearingModal = () => {
        setIsHearingModalOpen(false);
        setIsEditHearingMode(false);
        setHearingFormData({
            LitigationHearingId: 0,
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            LitigationId: editLitigationData.LitigationId!,
            ProjectId: Number(projectId),
            HearingDate: '',
            Remark: '',
            HearingAttachementURL: '',
            RemoveHearingAttachementURL: '',
        });
        setErrors({});
    };
    //endregion

    //HEARING HANDLE CHANGE 
    const handleHearingFieldChange = (
        field: keyof AddUpdateLitigationHearingRequest,
        value: any
    ) => {
        setHearingFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    //#region FETCH HEARING DETAILS
    const fetchHearingDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationLitigationHearingRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ProjectId: Number(projectId),
                    LitigationId: editLitigationData.LitigationId,
                };

                const response = await litigationService.apiCallPullLitigationHearing(params);

                if (E.isRight(response)) {
                    const sorted = [...response.right.Data].sort(
                        (a, b) =>
                            new Date(b.HearingDate).getTime() -
                            new Date(a.HearingDate).getTime()
                    );
                    setEditHearingData(sorted);
                } else {
                    addToast({ type: 'error', title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Hearing Details'
        );
    };

    //#endregion

    //Validation Function
    const validateAddHearingForm = (): {

        isValid: boolean
        errors: { [key: string]: string }

    } => {
        const newErrors: { [key: string]: string } = {};

        if (!hearingFormData.HearingDate?.trim()) {
            newErrors.HearingDate = 'Hearing Date is required.';
        }
        if (!hearingFormData.Remark?.trim()) {
            newErrors.Remark = 'Remark is required.';
        }
        const hasFile = hearingFormData.HearingAttachementURL || hearingURLFile.length > 0 || hearingFormData.HearingAttachementURL;
        if (!hasFile) {
            newErrors.HearingAttachementURL = "Hearing Attachment is required.";
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        };
    };
    //#endregion

    //#region PUSH HEARING DATA
    const PushHearingFormData = (): FormData => {
        const fd = new FormData();
        fd.append(
            'LitigationHearingId',
            String(hearingFormData.LitigationHearingId ?? 0)
        );
        fd.append('Uniquekey', hearingFormData.Uniquekey ?? '');
        fd.append(
            'LitigationId',
            String(hearingFormData.LitigationId ?? 0)
        );
        fd.append('ProjectId', projectId!.toString());
        fd.append('HearingDate', hearingFormData.HearingDate ?? '');
        fd.append('Remark', hearingFormData.Remark ?? '');

        hearingURLFile.forEach(file => {
            if (file instanceof File) {
                fd.append('HearingAttachementURL', file);
            }
        });
        fd.append(
            'RemoveHearingAttachementURL',
            removeHearingAttachementURL.join(',')
        );
        return fd;
    };
    //#endregion

    //#region  AND UPDATE HEARING 
    const handleUpdateHearing = async (e: React.FormEvent) => {

        e.preventDefault();

        setErrors({});

        const validation = validateAddHearingForm();

        if (!validation.isValid) {

            setErrors(validation.errors);
            return;
        }

        await runApiWithLoader(

            setIsLoading,

            setLoadingMessage,
            async () => {
                const payload = PushHearingFormData();

                const response = await litigationService.apiCallAddUpdateLitigationHearing(payload);

                if (E.isRight(response)) {
                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    setIsHearingModalOpen(false);

                    fetchHearingDetails();

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
            hearingFormData.LitigationHearingId ? 'Updating Hearing' : 'Adding Hearing'
        );
    };

    //#region HEARING DELETE HANDLER
    const handleDeleteHearing = (item: LitigationHearingData) => {
        setSelectedHearingItem(item);
        setIsDeleteHearingDialogOpen(true);
    };
    const handleConfirmDeleteHearing = async () => {
        if (!selectedHearingItem) return;

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: DeleteLitigationHearingRequest = {
                    LitigationHearingId: selectedHearingItem.LitigationHearingId || 0,
                    Uniquekey: selectedHearingItem.Uniquekey || '',
                    LitigationId: editLitigationData.LitigationId,
                    ProjectId: Number(projectId)
                };

                const response = await litigationService.apiCallDeleteLitigationHearing(params);

                if (E.isRight(response)) {
                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    setIsDeleteHearingDialogOpen(false);

                    fetchHearingDetails();

                    setSelectedHearingItem(null);


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
            'Deleting Hearing Details'
        );
    };

    //#region EDIT LITIGATION 
    const handleEditLitigation = (row: LitigationData) => {
        if (!row?.LitigationId) return;
        navigate(`/litigation/add/${row.LitigationId}`);
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListLitigation = () => {
        navigate('/litigation');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            {/* Loader */}

            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>

            </Loader>
            {/* Header Details*/}

            <div className="flex justify-between">
                <HeaderActionBar
                    titleText={editLitigationData.Title ?? ""}
                    subTitleText={editLitigationData.Status ?? ""}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToListLitigation()}
                    canAction={isEditable}
                    onEdit={() => {
                        if (editLitigationData) handleEditLitigation(editLitigationData!);
                    }}
                    isLoading={false}
                />
                {(editLitigationData?.Status === 'Open' || editLitigationData?.Status === 'Reopen') && (
                    <Button
                        className=" w-full "
                        size="sm"
                        onClick={() => handleopenClosureModal()}
                    >
                        Close Case
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-12 gap-4 pt-5">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-7">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">


                        {/* <div className="flex items-center gap-28">

                                <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-medium text-md ml-4">Case Details</span>
                                </div>
                        </div> */}

                        {/* <div className="grid grid-cols-3 gap-x-10 gap-y-6 p-4">
                            <FieldItem label="Case Type" value={editLitigationData.Title} />
                            <FieldItem label="Case Type" value={editLitigationData.CaseType} />
                            <FieldItem label="Date Of Filling" value={editLitigationData.DateOfFilling ? formatDate_dd_MonthName_yy(editLitigationData.DateOfFilling) : ""} />
                            <FieldItem label="Case Type" value={editLitigationData.CaseType} />
                            <FieldItem label="Court Location" value={editLitigationData.CourtLocation} />
                            <FieldItem label="Court Name" value={editLitigationData.CourtName} />
                            <FieldItem label="Plantiff" value={editLitigationData.Plantiff} />
                            <FieldItem label="Created By" value={editLitigationData.CreatedBy} />
                            <FieldItem label="Created Date" value={editLitigationData.CreatedDate ? formatDate_dd_MonthName_yy(editLitigationData.CreatedDate) : ""} />
                            <FieldItem label="Modified By" value={editLitigationData.ModifiedBy} />
                            <FieldItem label="Modified Date" value={editLitigationData.ModifiedDate ? formatDate_dd_MonthName_yy(editLitigationData.ModifiedDate) : ""} />
                        </div> */}
                        <section className="bg-white rounded-md p-4">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Case Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Case Title" value={editLitigationData.Title} />
                                        <FieldItem label="Project Name" value={editLitigationData.ProjectName} />
                                        <FieldItem label="Date Of Filling" value={editLitigationData.DateOfFilling ? formatDate_dd_MonthName_yy(editLitigationData.DateOfFilling) : ""} />
                                        <FieldItem label="Case Type" value={editLitigationData.CaseType} />
                                        <FieldItem label="Case Number" value={editLitigationData.CaseNumber} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pb-3 pt-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Case Brief" value={editLitigationData.CaseBrief} />
                                        <FieldItem label="Remark" value={editLitigationData.Remark} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-sm p-4">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Court Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 pb-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Court Type" value={editLitigationData.CourtType} />
                                        <FieldItem label="Court Name" value={editLitigationData.CourtName} />
                                        <FieldItem label="Court Location" value={editLitigationData.CourtLocation} />
                                    </div>
                                </div>
                            </div>

                        </section>

                        <section className="bg-white rounded-sm p-4">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Parties Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <FieldItem label="Plantiff" value={editLitigationData.Plantiff} />
                                        <FieldItem label="Defendant" value={editLitigationData.Defendant} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pb-3 pt-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <FieldItem label="Assigned Representative" value={editLitigationData.AssignedRepresentative} />
                                        <FieldItem label="Opposing Representative" value={editLitigationData.OpposingRepresentative} />
                                    </div>
                                </div>

                            </div>
                        </section>

                        <section className="bg-white rounded-sm p-4">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <FieldItem label="Created By" value={editLitigationData.CreatedBy} />
                                        <FieldItem label="Created Date" value={editLitigationData.CreatedDate ? formatDate_dd_MonthName_yy(editLitigationData.CreatedDate) : ""} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pb-3 pt-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        <FieldItem label="Modified By" value={editLitigationData.ModifiedBy} />
                                        <FieldItem label="Modified Date" value={editLitigationData.ModifiedDate ? formatDate_dd_MonthName_yy(editLitigationData.ModifiedDate) : ""} />
                                    </div>
                                </div>

                            </div>
                        </section>
                    </div>


                    {/* LEFT SIDE PROFILE CARD */}
                    {((editLitigationData?.Status === "Closed" || editLitigationData?.Status === "Reopen") && closureDetails

                    ) && (
                            <div className="col-span-7">

                                <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-2 mt-2">
                                    <section className="bg-white rounded-sm p-4">

                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                Closure Details
                                            </h4>

                                            {editLitigationData?.Status === "Reopen" && (
                                                <Button
                                                    color="transparent"
                                                    isborderRadius
                                                    size="sm"
                                                    style={{ color: 'blue', padding: '4px 8px' }}
                                                    title="Edit"
                                                    onClick={() => handleopenClosureModal(closureDetails)}
                                                    disabled={isLoading}
                                                    leftIcon={<Edit className="h-4 w-4" />}
                                                />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                            <div className="lg:col-span-3 pb-1">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <FieldItem label="Closure Date" value={formatDate_dd_MonthName_yy(closureDetails.ClosureDate)} />
                                                    <FieldItem label="Remark" value={closureDetails.Remark} />
                                                    <FieldItem label="Conclusion" value={closureDetails.Conclusion} />
                                                    <FieldItem label="Closure Attachment"
                                                        urls={closureDetails.ClosureAttachementURL ?? []} isIcon isRow />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-5">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        <div className="border-b pb-2 mt-1">
                            <div className="flex items-center justify-between">
                                <h1 className="text-lg font-semibold text-black">
                                    Hearing History</h1>

                                {(editLitigationData?.Status === 'Open' ||
                                    editLitigationData?.Status === 'Reopen') && (
                                        <Button
                                            className="w-full"
                                            size="sm"
                                            onClick={() =>
                                                handleopenHearingModal({
                                                    LitigationId: editLitigationData.LitigationId
                                                })
                                            }
                                        >
                                            Add Hearing
                                        </Button>
                                    )}
                            </div>
                        </div>

                        <div className="mt-4 space-y-4">
                            {editHearingData.length === 0 ? (
                                <p className="text-gray-500 text-sm">No hearing history found.</p>
                            ) : (
                                editHearingData.map((item, index) => {
                                    const isLatest = index === 0;
                                    const isCaseOpenOrReopen =
                                        editLitigationData?.Status === 'Open' ||
                                        editLitigationData?.Status === 'Reopen';

                                    return (
                                        <div
                                            key={item.LitigationHearingId}
                                            className="pb-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">
                                                    {formatDate_dd_MonthName_yy_hh_mm(item.HearingDate)}
                                                </span>


                                                {isLatest && isCaseOpenOrReopen && (
                                                    <div className="flex">
                                                        <Button
                                                            color="transparent"
                                                            isborderRadius
                                                            size="sm"
                                                            style={{ color: 'blue' }}
                                                            title="Edit Hearing"
                                                            onClick={() => handleopenHearingModal(item)}
                                                            disabled={isLoading}
                                                            leftIcon={<Edit className="h-4 w-4" />}
                                                        />

                                                        <Button
                                                            color="transparent"
                                                            isborderRadius
                                                            size="sm"
                                                            style={{ color: 'red' }}
                                                            title="Delete Hearing"
                                                            onClick={() => handleDeleteHearing(item)}
                                                            disabled={isLoading}
                                                            leftIcon={<Trash2 className="h-4 w-4" />}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="mt-2 text-sm text-gray-700">
                                                {item.Remark || "-"}
                                            </p>
                                            <FieldItem label="Attachement" urls={item.HearingAttachementURL} isIcon isRow={true} />

                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* CLOSURE MODAL */}
                <Modal
                    isOpen={isClosureModalOpen}
                    title={"Close Case"}
                    onClose={handleClosureModal}
                    onSubmit={handleUpdateClosure}
                    cancelText="Cancel"
                    saveText={isEditable ? "close" : "Save"}
                    onCancel={handleClosureModal}
                    loading={isLoading}
                    size="lg"
                >
                    <div className="space-y-4">

                        <DatePickerInput
                            label="Closure Date"
                            value={formatDate_dd_mm_yyyy(closureFormData.ClosureDate ?? "")}
                            onChange={(val) => handleFieldChange('ClosureDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required
                            error={errors.ClosureDate}
                        />

                        <MultiFilePicker
                            label='Attachement'
                            required
                            error={errors.ClosureAttachementURL}
                            value={closureURLFile}
                            onChange={setClosureURLFiles}
                            availableFilesURL={closureFormData.ClosureAttachementURL ?? ""}
                            allowedTypes={[
                                "image/jpeg",
                                "image/png",
                                "image/jpg"]}
                            maxFiles={5}
                            maxSizeMB={50}
                        />
                        <Input
                            type="text"
                            required
                            label='Remark'
                            value={closureFormData.Remark ?? ""}
                            onChange={(e) => handleFieldChange("Remark", e.target.value)}
                            placeholder="Enter Remark"
                            maxLength={250}
                            error={errors.Remark}
                        />
                        <Input
                            type="text"
                            required
                            label='Conclusion'
                            value={closureFormData.Conclusion ?? ""}
                            onChange={(e) => handleFieldChange("Conclusion", e.target.value)}
                            placeholder="Enter Conclusion"
                            maxLength={250}
                            error={errors.Conclusion}
                        />
                    </div>
                </Modal>

                {/* HEARING MODAL */}
                <Modal
                    isOpen={isHearingModalOpen}
                    title={"Hearing"}
                    onClose={handleHearingModal}
                    onSubmit={handleUpdateHearing}
                    cancelText="Cancel"
                    saveText="Save"
                    onCancel={handleHearingModal}
                    loading={isLoading}
                    size="lg"
                >
                    <div className="space-y-4">
                        <DatePickerInput
                            label="Hearing Date"
                            value={formatDate_dd_mm_yyyy(hearingFormData.HearingDate ?? "")}
                            onChange={(val) => handleHearingFieldChange('HearingDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                            required
                            error={errors.HearingDate}
                        />

                        <MultiFilePicker
                            label='Attachement'
                            required
                            error={errors.HearingAttachementURL}
                            value={hearingURLFile}
                            onChange={setHearingURLFiles}
                            availableFilesURL={hearingFormData.HearingAttachementURL ?? ""}
                            allowedTypes={[
                                "image/jpeg",
                                "image/png",
                                "image/jpg"]}
                            maxFiles={5}
                            maxSizeMB={50}
                        />
                        <Input
                            type="text"
                            required
                            label="Remark"
                            value={hearingFormData.Remark ?? ""}
                            onChange={(e) => handleHearingFieldChange("Remark", e.target.value)}
                            maxLength={250}
                            error={errors.Remark}
                        />
                    </div>
                </Modal>

                {/* ConfirmationDialogBox*/}
                <ConfirmationDialogBox
                    isOpen={isDeleteHearingDialogOpen}
                    onClose={() => {
                        setIsDeleteHearingDialogOpen(false);
                        setSelectedHearingItem(null);
                    }}
                    onConfirm={handleConfirmDeleteHearing}
                    title="Delete Hearing Details"
                    message={`Are you sure you want to delete this Hearing This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />
            </div>
        </div>
    );

};

export default ViewLitigation;
