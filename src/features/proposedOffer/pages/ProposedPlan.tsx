import React, { useEffect, useState } from 'react';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {

    ProposedOfferProposedPlanData,
    FilterWithPaginationProposedOfferProposedPlanRequest,
    AddUpdateProposedOfferProposedPlanRequest
} from '@/features/proposedOffer/models/ProposedOfferModel';

import { proposedOfferService } from '@/features/proposedOffer/services/ProposedOfferService';
import { Loader } from '@/core/utils/loader';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { filterNumbers } from '@/core/utils/fileValidation';
import BottomActionBar from '@/ui/components/forms/BottomActionBar';
import { AMENITIES_BY_CATEGORY } from '@/core/constants';
import MultiFilePicker from '@/ui/components/ImagePicker/MultiFilePicker';
import MultiSelectCheckBoxWithCategory from '@/ui/components/forms/MultiSelectCheckBoxWithCategory';

//#region INITIAL FORM STATE - PROPOSED PLAN
const initialFormStateProposedPlan = (): AddUpdateProposedOfferProposedPlanRequest => ({
    ProposedOfferProposedPlanId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
    TotalNumberOfFloors: 0,
    TotalUnits: 0,
    PlanDocumentURL: null,
    RemovePlanDocumentURL: '',
    TotalParking: 0,
    Amenities: ''
});
//#endregion


export const ProposedPlan: React.FC = () => {

    //#region STATE
    const [, setProposedPlanData] = useState<ProposedOfferProposedPlanData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const [planDocumentFiles, setPlanDocumentFiles] = useState<(File | string)[]>([]);
    const [removedPlanDocumentUrls, setRemovedPlanDocumentUrls] = useState<string[]>([]);
    const [planDocumentURL, setPlanDocumentURL] = useState<string>();

    // TOAST
    const { addToast } = useToast();

    //ERROR SET UP
    const [errorsProposedPlan, setErrorsProposedPlan] = useState<{ [k: string]: string }>({});

    // ADD UPDATE PROPOSED PLAN
    const [formDataProposedPlan, setFormDataProposedPlan] = useState<AddUpdateProposedOfferProposedPlanRequest>(() => initialFormStateProposedPlan());

    //#endregion

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions();
    //#endregion

    //#region PROJECT SELECTION GET ID
    const { projectId } = useProject();
    //#endregion

    //#region INIT

    useEffect(() => {
        if (!projectId) return;

        setPlanDocumentFiles([]);
        setPlanDocumentURL("")
        setRemovedPlanDocumentUrls([]);

        fetchProposedPlanData();
    }, [projectId]);


    //#endregion

    //#region HANDLE FIELD CHANGE EVENT - PROPOSED PLAN
    const handleFieldChangeProposedPlan = (field: keyof AddUpdateProposedOfferProposedPlanRequest, value: any) => {
        setFormDataProposedPlan((prev) => ({ ...prev, [field]: value }));

        if (errorsProposedPlan[field]) {
            setErrorsProposedPlan((prev) => ({ ...prev, [field]: "" }));
        }
    };
    //#endregion

    //#region PROPOSED PLAN

    const fetchProposedPlanData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProposedOfferProposedPlanRequest = {
                    ProjectId: projectId ?? undefined,
                };

                const response = await proposedOfferService.apiCallPullProposedPlan(params);

                if (E.isRight(response)) {
                    const data = response.right.Data?.[0] || null;
                    setProposedPlanData(data);

                    if (data) {
                        setFormDataProposedPlan({
                            ProposedOfferProposedPlanId: data.ProposedOfferProposedPlanId || 0,
                            Uniquekey: data.Uniquekey || initialFormStateProposedPlan().Uniquekey,
                            ProjectId: Number(projectId),
                            TotalNumberOfFloors: data.TotalNumberOfFloors ?? 0,
                            TotalUnits: data.TotalUnits ?? 0,
                            PlanDocumentURL: null,
                            RemovePlanDocumentURL: '',
                            TotalParking: data.TotalParking ?? 0,
                            Amenities: data.Amenities || ''
                        });
                        setPlanDocumentFiles([]);
                        setPlanDocumentURL(data.PlanDocumentURL)
                        setRemovedPlanDocumentUrls([]);
                    } else {
                        setFormDataProposedPlan({
                            ...initialFormStateProposedPlan(),
                            ProjectId: Number(projectId)
                        });
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
            'Loading Proposed Plan'
        );
    };

    const validateProposedPlanForm = (): {
        isValid: boolean
        errors: { [key: string]: string }
    } => {
        const newErrors: { [key: string]: string } = {}

        if (!formDataProposedPlan.TotalNumberOfFloors) {
            newErrors.TotalNumberOfFloors = "Total Number of Floors is required"
        }

        if (!formDataProposedPlan.TotalUnits) {
            newErrors.TotalUnits = "Total Units is required"
        }

        if (!formDataProposedPlan.TotalParking) {
            newErrors.TotalParking = "Total Parking is required"
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors
        }
    }

    const handleSaveProposedPlan = async () => {
        setErrorsProposedPlan({})

        const validation = validateProposedPlanForm()

        if (!validation.isValid) {
            setErrorsProposedPlan(validation.errors)
            return
        }

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const formDataPayload = new FormData();
                formDataPayload.append('ProposedOfferProposedPlanId', String(formDataProposedPlan.ProposedOfferProposedPlanId ?? 0));
                formDataPayload.append('Uniquekey', formDataProposedPlan.Uniquekey || '');
                formDataPayload.append('ProjectId', String(projectId));
                formDataPayload.append('TotalNumberOfFloors', String(formDataProposedPlan.TotalNumberOfFloors ?? 0));
                formDataPayload.append('TotalUnits', String(formDataProposedPlan.TotalUnits ?? 0));
                formDataPayload.append('TotalParking', String(formDataProposedPlan.TotalParking ?? 0));
                formDataPayload.append('Amenities', Array.isArray(formDataProposedPlan.Amenities)
                    ? formDataProposedPlan.Amenities.join(",")
                    : formDataProposedPlan.Amenities || '');

                planDocumentFiles.forEach(file => {
                    if (file instanceof File) {
                        formDataPayload.append('PlanDocumentURL', file);
                    }
                });
                formDataPayload.append('RemovePlanDocumentURL', removedPlanDocumentUrls.join(','));

                const response = await proposedOfferService.apiCallAddUpdateProposedPlan(formDataPayload);

                if (E.isRight(response)) {

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

                    await fetchProposedPlanData();
                    
                    setPlanDocumentFiles([]);
                    setRemovedPlanDocumentUrls([]);

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
            Number(formDataProposedPlan.ProposedOfferProposedPlanId) === 0 ? 'Add Proposed Plan' : 'Update Proposed Plan'
        )
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="space-y-6 pb-5">
                {/* Proposed Plan Details Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-500 pb-2">
                        Proposed Plan Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <Input
                                label="Total Number of Floors"
                                required
                                type="text"
                                value={formDataProposedPlan.TotalNumberOfFloors || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalNumberOfFloors', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                error={errorsProposedPlan.TotalNumberOfFloors}
                                placeholder="Enter Total Number of Floors"
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Units"
                                required
                                type="text"
                                value={formDataProposedPlan.TotalUnits || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalUnits', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                error={errorsProposedPlan.TotalUnits}
                                placeholder="Enter Total Units"
                            />
                        </div>
                        <div>
                            <Input
                                label="Total Parking"
                                required
                                type="text"
                                value={formDataProposedPlan.TotalParking || ''}
                                onChange={(e) => handleFieldChangeProposedPlan('TotalParking', filterNumbers(e.target.value) ? Number(filterNumbers(e.target.value)) : 0)}
                                error={errorsProposedPlan.TotalParking}
                                placeholder="Enter Total Parking"
                            />
                        </div>
                        <div>
                            <MultiFilePicker
                                label="Plan"
                                placeholder="Select Plan"
                                required
                                error={errorsProposedPlan.PlanDocumentURL}
                                value={planDocumentFiles}
                                onChange={setPlanDocumentFiles}
                                availableFilesURL={planDocumentURL ?? ""}
                                allowedTypes={["image/jpeg", "image/png", "image/jpg"]}
                                onRemoveExisting={(url) => {
                                    setRemovedPlanDocumentUrls((prev) => [...prev, url])
                                }}
                            />
                        </div>
                    </div>
                    <div>

                        <MultiSelectCheckBoxWithCategory
                            label="Select Amenities"
                            placeholder="Search Amenities"
                            options={AMENITIES_BY_CATEGORY}
                            value={
                                Array.isArray(formDataProposedPlan.Amenities)
                                    ? formDataProposedPlan.Amenities
                                    : formDataProposedPlan.Amenities
                                        ? formDataProposedPlan.Amenities.split(",")
                                        : []
                            }
                            onChange={(values) =>
                                handleFieldChangeProposedPlan("Amenities", values)
                            }
                        />
                    </div>
                </div>
            </div>

            <BottomActionBar
                saveText={(formDataProposedPlan.ProposedOfferProposedPlanId && formDataProposedPlan.ProposedOfferProposedPlanId > 0) ? 'Update' : 'Add'}
                canAction={canAction}
                onSave={handleSaveProposedPlan}
                isLoading={isLoading}
            />

        </div>
    );
};

export default ProposedPlan;
