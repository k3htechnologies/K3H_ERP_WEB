import { useEffect, useState } from "react";
import type { FilterWithPaginationProjectProfessionalDetails, ProjectProfessionalDetailsData } from "@/features/projectProfessionalDetails/models/ProjectProfessionalDetailsModel";
import { runApiWithLoader } from "@/core/utils";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { projectProfessionalDetailsService } from "@/features/projectProfessionalDetails/services/ProjectProfessionalDetailsService";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectProfessionalDetailsListState } from "@/features/projectProfessionalDetails/context/ProjectProfessionalDetailsListStateContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const ViewProjectProfessionalDetails: React.FC = () => {

    const [projectProfessionalDetailsData, setProjectProfessionalDetailsData] = useState<ProjectProfessionalDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { projectId } = useProject();
    const { addToast } = useToast();
    const { ProjectProfessionalDetailsId } = useParams<{ ProjectProfessionalDetailsId?: string }>();
    const { listState } = useProjectProfessionalDetailsListState();
    const currentProjectProfessionalDetailsId = ProjectProfessionalDetailsId ? Number(ProjectProfessionalDetailsId) : listState.ProjectProfessionalDetailsId;
    const navigate = useNavigate();
    const { canAction } = useMenuPermissions("/projectProfessionalDetails");

    useEffect(() => {
        if (!projectId) return

        loadProjectProfessionalDetailsData();
    }, [projectId]);

    const loadProjectProfessionalDetailsData = async () => {
        runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectProfessionalDetails = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: Number(projectId),
                    ProjectProfessionalDetailsId: currentProjectProfessionalDetailsId,
                }

                const response = await projectProfessionalDetailsService.apiCallPullProjectProfessionalDetails(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setProjectProfessionalDetailsData(Array.isArray(data) ? (data[0] ?? null) : data);

                } else {
                    addToast({ type: "error", title: response.left.message });
                    return response
                }
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            'loading Project Professional Details'
        )
    };

    const handleBackToListProjectProfessionalDetails = () => {
        navigate("/projectProfessionalDetails");
    };

    const handleEditProjectProfessionalDetails = (row: ProjectProfessionalDetailsData) => {
        if (!row?.ProjectProfessionalDetailsId) return;
        navigate('/projectProfessionalDetails');
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>  {" "}<div></div>{" "} </Loader>

            <div className="pb-4">
                <HeaderActionBar
                    titleText={projectProfessionalDetailsData?.ProfessionalType ?? ""}
                    subSubTitleText={projectProfessionalDetailsData?.RegistrationNumber ?? ""}
                    cancelText="Cancel"
                    EditText="Edit"
                    onCancel={() => handleBackToListProjectProfessionalDetails()}
                    canAction={canAction}
                    onEdit={() => {
                        if (projectProfessionalDetailsData!) handleEditProjectProfessionalDetails(projectProfessionalDetailsData!!)
                    }}
                    isLoading={false}
                />
            </div>

            <div className="space-y-6">
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                    <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#1D4ED8]">
                            Personal Details
                        </h4>
                    </div>

                    <div className="p-4 bg-white">
                        <div className="rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
                                <FieldItem label="Professional Type" value={projectProfessionalDetailsData?.ProfessionalType} />
                                <FieldItem label="Registration Number" value={projectProfessionalDetailsData?.RegistrationNumber} />
                                <FieldItem label="Type" value={projectProfessionalDetailsData?.Type} />
                                <FieldItem label="First Name" value={projectProfessionalDetailsData?.FirstName} />
                                <FieldItem label="Middel Name" value={projectProfessionalDetailsData?.MiddleName} />
                                <FieldItem label="Last Name" value={projectProfessionalDetailsData?.LastName} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                    <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#C2410C]">
                            Communication  Address
                        </h4>
                    </div>

                    <div className="p-4 bg-white">
                        <div className="rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
                                <FieldItem label="Unit Number" value={projectProfessionalDetailsData?.UnitNumber} />
                                <FieldItem label="Bulding Name" value={projectProfessionalDetailsData?.BuldingName} />
                                <FieldItem label="Street Name" value={projectProfessionalDetailsData?.StreetName} />
                                <FieldItem label="Locality" value={projectProfessionalDetailsData?.Locality} />
                                <FieldItem label="Land Mark" value={projectProfessionalDetailsData?.LandMark} />
                                <FieldItem label="Country Name" value={projectProfessionalDetailsData?.CountryName} />
                                <FieldItem label="State Name" value={projectProfessionalDetailsData?.StateName} />
                                <FieldItem label="District Name" value={projectProfessionalDetailsData?.DistrictName} />
                                <FieldItem label="City Name" value={projectProfessionalDetailsData?.CityName} />
                                <FieldItem label="Village Name" value={projectProfessionalDetailsData?.VillageName} />
                                <FieldItem label="Pin Code" value={projectProfessionalDetailsData?.PinCode} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                    <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#13367A]">
                            Contact Details
                        </h4>
                    </div>

                    <div className="p-4 bg-white">
                        <div className="rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 gap-3">
                                <FieldItem label="Primary Contact Number" value={projectProfessionalDetailsData?.PrimaryContactNumber} />
                                <FieldItem label="Alternate Contact Number" value={projectProfessionalDetailsData?.AlternateContactNumber} />
                                <FieldItem label="Office Landline Number" value={projectProfessionalDetailsData?.OfficeLandlineNumber} />
                                <FieldItem label="Email Id" value={projectProfessionalDetailsData?.EmailId} />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
export default ViewProjectProfessionalDetails;