import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterWithPaginationProjectRedevelopmentRequest, ProjectRedevelopmentData } from "@/features/projectLead/models/ProjectRedevelopmentModel";
import useToast from "@/core/hooks/useToast";
import * as E from "fp-ts/Either";
import { useProjectRedevelopmentListState } from "@/features/projectLead/context/ProjectRedevelopmentListStateContext";
import { runApiWithLoader } from "@/core/utils";
import { projectRedevelopmentService } from "@/features/projectLead/services/ProjectRedevelopmentService";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { ContactRound, History, MapPin, MessageSquareText, Ruler, Warehouse } from "lucide-react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import ImageCarousel from "@/ui/components/ImageViewer/ImageCarousel";

export const ViewProjectRedevelopment: React.FC = () => {
    const [ProjectRedevelopmentData, setProjectRedevelopmentData] = useState<ProjectRedevelopmentData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions('/projectLead');
    const { ProjectRedevelopmentId } = useParams<{ ProjectRedevelopmentId?: string }>();
    const { listState } = useProjectRedevelopmentListState();
    const currentProjectRedevelopmentId = ProjectRedevelopmentId ? Number(ProjectRedevelopmentId) : listState.ProjectRedevelopmentId;

    useEffect(() => {
        LoadProjectRedevelopmentData()
    }, []);

    const LoadProjectRedevelopmentData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectRedevelopmentRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ProjectRedevelopmentId: currentProjectRedevelopmentId
                }

                const response = await projectRedevelopmentService.apiCallPullProjectRedevelopment(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setProjectRedevelopmentData((Array.isArray(data) ? (data[0] ?? null) : data));

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
            "Loading Project Redevelopment",
        );
    };

    const handleEditProjectRedevelopmentData = (row: ProjectRedevelopmentData) => {
        if (!row?.ProjectRedevelopmentId) return;
        navigate(`/projectLead/addProjectRedevelopment/${row.ProjectRedevelopmentId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <div className="px-5 py-5">
                <HeaderActionBar
                    titleText="Redevelopment : Building Name : "
                    subTitleText={ProjectRedevelopmentData?.BuildingName ?? ""}

                    cancelText="Cancel"
                    canAction={canAction}
                    EditText="Edit"
                    onEdit={() => {
                        if (ProjectRedevelopmentData) {
                            handleEditProjectRedevelopmentData(
                                ProjectRedevelopmentData
                            );
                        }
                    }}
                    onCancel={() =>
                        navigate("/projectLead", {
                            state: {
                                activeTab: "Redevelopment",
                            },
                        })
                    }
                    isLoading={false}
                />

                {/* ================= OVERVIEW ================= */}
                <div className="grid grid-cols-1 gap-6 pt-5">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-start gap-5">

                            <div className="w-full lg:w-[240px] shrink-0">
                                <div className="relative w-full lg:w-[220px] h-[200px] lg:h-[150px] rounded-xl overflow-hidden">
                                    <ImageCarousel
                                        images={ProjectRedevelopmentData?.PhotoURL ?? ""}
                                        thumbHeight="h-full"
                                    />

                                    <div className="absolute top-2 right-2 z-20">
                                        <FieldItem
                                            label=""
                                            urls={ProjectRedevelopmentData?.PhotoURL}
                                            isIcon
                                            isSetValue={false}
                                        />
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF4FF] text-[#464554] font-medium text-xs  mt-2">
                                    <MapPin className="text-[#4648D4]" size={18} />
                                    {ProjectRedevelopmentData?.CityName}, {ProjectRedevelopmentData?.StateName}
                                </div>
                            </div>


                            <div className="flex-1 min-w-0 py-2">

                                <h2 className="text-xl font-semibold text-slate-800 truncate">
                                    {ProjectRedevelopmentData?.BuildingName || "-"}
                                </h2>


                                <div className="pt-2">
                                    <FieldItem label="Plot / CTS / Survey / Subdivision Number" value={ProjectRedevelopmentData?.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber} isRow />

                                </div>

                                <div className="mt-2">
                                    <FieldItem label="Address" value={ProjectRedevelopmentData?.BuildingAddress} isRow />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= LOCATION DETAILS ================= */}
                <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 pt-5">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                </div>

                                <h2 className="text-[16px] font-semibold text-slate-800">
                                    Location Details
                                </h2>
                            </div>

                            {ProjectRedevelopmentData?.IdentificationLocation && (
                                <span
                                    className="text-blue-600 text-sm underline cursor-pointer"
                                    onClick={() => window.open(ProjectRedevelopmentData.IdentificationLocation ?? "", "_blank")}
                                >
                                    Google Location
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-7 text-sm font-semibold text-gray-500 pb-2">
                            <span>Country</span>
                            <span>State</span>
                            <span>District</span>
                            <span>City</span>
                            <span>Pin Code</span>
                            <span>Ward Number</span>
                            <span>Latitude Longitude</span>
                        </div>

                        <div className="border-t border-gray-300"></div>
                        <div className="grid grid-cols-7 pt-3 text-md font-medium text-slate-800">
                            <span>{ProjectRedevelopmentData?.CountryName || "-"}</span>
                            <span>{ProjectRedevelopmentData?.StateName || "-"}</span>
                            <span>{ProjectRedevelopmentData?.DistrictName || "-"}</span>
                            <span>{ProjectRedevelopmentData?.CityName || "-"}</span>
                            <span>{ProjectRedevelopmentData?.PinCode || "-"}</span>
                            <span>{ProjectRedevelopmentData?.WardNumberZone}</span>
                            <span>{ProjectRedevelopmentData?.LatitudeLongitude}</span>
                        </div>
                    </div>
                </div>

                {/* ================= EXISTING BUILDING DETAILS ================= */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Warehouse className="w-5 h-5 text-blue-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Existing Building Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        <FieldItem label="Type Of Land Tenure" value={ProjectRedevelopmentData?.TypeOfLandTenure} />
                        <FieldItem label="Existing Building Type" value={ProjectRedevelopmentData?.ExistingBuildingType} />
                        <FieldItem label="Construction Type" value={ProjectRedevelopmentData?.ConstructionType} />
                        <FieldItem label="Year Of Original Construction" value={ProjectRedevelopmentData?.YearOfOriginalConstruction} />
                        <FieldItem label="Total Plot Area (SqMt)" value={ProjectRedevelopmentData?.TotalPlotAreaSqM} />
                        <FieldItem label="Total Carpet Area (SqFt)" value={ProjectRedevelopmentData?.TotalCarpetArea} />
                        <FieldItem label="Total Build-Up Area (SqFt)" value={ProjectRedevelopmentData?.TotalBuildUpArea} />
                        <FieldItem label="Total Common Area (SqFt)" value={ProjectRedevelopmentData?.TotalCommonArea} />
                        <FieldItem label="Number of Existing Building / Wings" value={ProjectRedevelopmentData?.NumberOfExistingBuildingsWings} />
                        <FieldItem label="Number of Existing Floors" value={ProjectRedevelopmentData?.NumberOfExistingFloors} />
                        <FieldItem label="Number Of Floor Per Wings" value={ProjectRedevelopmentData?.NumberOfFloorsPerWing} />
                        <FieldItem label="Total Number of Existing Flats / Units" value={ProjectRedevelopmentData?.TotalNumberExistingFlatsUnits} />
                        <FieldItem label="Member In Favor (%)" value={ProjectRedevelopmentData?.PercentageMemberInFavor} />
                        <FieldItem label="Plot Under Litigation / Stay Order" value={ProjectRedevelopmentData?.IsPlotUnderLitigationStay === true ? "Yes" : "No"} />
                        <FieldItem label="Lift Available" value={ProjectRedevelopmentData?.IsLiftAvailable === true ? "Yes" : "No"} />
                        <FieldItem label="Fire Safety Provision Present" value={ProjectRedevelopmentData?.IsFireSafetyProvisionPresent === true ? "Yes" : "No"} />
                        <FieldItem label="Conveyance Deed" value={ProjectRedevelopmentData?.IsConveyanceDeed === true ? "Yes" : "No"} />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    {/* ================= PLOT CHARACTERISTICS ================= */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Ruler className="w-5 h-5 text-amber-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Plot Characteristics
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-6">
                            <FieldItem label="Plot Shape" value={ProjectRedevelopmentData?.PlotShape} />
                            <FieldItem label="Depth Of The Plot" value={ProjectRedevelopmentData?.PlotDepth} />
                            <FieldItem label="Road Width" value={ProjectRedevelopmentData?.RoadWidth} />
                        </div>
                    </div>

                    {/* CONTACT */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <ContactRound className="w-5 h-5 text-emerald-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Contact Information
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4">
                             <FieldItem label="Name" value={ProjectRedevelopmentData?.ContactPersonName ?? '-'} isRow />
                             <FieldItem label="Mobile No" value={`+91 ${ProjectRedevelopmentData?.ContactPersonMobile}`} isRow  />
                             <FieldItem label="E-Mail ID" value={`${ProjectRedevelopmentData?.ContactPersonEmail}`} isRow  />
                            
                        </div>
                    </div>

                </div>

                {/* ================= REMARKS ================= */}

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                            <MessageSquareText className="w-5 h-5 text-slate-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Additional Information
                        </h2>
                    </div>

                    <div className="p-2">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {ProjectRedevelopmentData?.Remarks || "-"}
                        </p>
                    </div>
                </div>

                {/* ================= ACTION DETAILS ================= */}

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                            <History className="w-5 h-5 text-slate-600" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Action Details
                        </h2>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                        <FieldItem label="Created By" value={ProjectRedevelopmentData?.CreatedBy} />
                        <FieldItem label="Created Date" value={ProjectRedevelopmentData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(ProjectRedevelopmentData?.CreatedDate) : ""} />
                        {ProjectRedevelopmentData?.ModifiedBy && (
                            <>
                                <FieldItem label="Modified By" value={ProjectRedevelopmentData?.ModifiedBy} />
                                <FieldItem label="Modified Date" value={ProjectRedevelopmentData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(ProjectRedevelopmentData?.ModifiedDate) : ""} />
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProjectRedevelopment;