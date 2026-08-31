import useToast from "@/core/hooks/useToast";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterWithPaginationProjectLandRequest, ProjectLandData } from "@/features/projectLead/models/ProjectLandModel";
import { runApiWithLoader } from "@/core/utils";
import { projectLandService } from "@/features/projectLead/services/ProjectLandService";
import * as E from "fp-ts/Either";
import { useProjectLandListState } from "@/features/projectLead/context/ProjectLandListStateContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import { BadgeCheck, ContactRound, History, MapPin, MessageSquareText, Route, Ruler } from "lucide-react";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import ImageCarousel from "@/ui/components/ImageViewer/ImageCarousel";

export const ViewProjectLand: React.FC = () => {
    const [ProjectLandData, setProjectLandData] = useState<ProjectLandData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { canAction } = useMenuPermissions('/projectLead');

    const { ProjectLandId } = useParams<{ ProjectLandId?: string }>();
    const { listState } = useProjectLandListState();
    const currentProjectLandId = ProjectLandId ? Number(ProjectLandId) : listState.ProjectLandId;

    useEffect(() => {
        LoadProjectLandData()
    }, []);

    const LoadProjectLandData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectLandRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    ProjectLandId: currentProjectLandId
                }

                const response = await projectLandService.apiCallPullProjectLand(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setProjectLandData((Array.isArray(data) ? (data[0] ?? null) : data));

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
            "Loading Project Land",
        );
    };

    const handleEditProjectLandData = (row: ProjectLandData) => {
        if (!row?.ProjectLandId) return;
        navigate(`/projectLead/addProjectLand/${row.ProjectLandId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <Loader loading={isLoading} title={loadingMessage}><div></div></Loader>

            <div className="px-5 py-5">
                <HeaderActionBar
                    titleText="Land Details : "
                    subTitleText={ProjectLandData?.LandOwnerName ?? ""}

                    cancelText="Cancel"
                    canAction={canAction}
                    EditText="Edit"
                    onEdit={() => {
                        if (ProjectLandData) {
                            handleEditProjectLandData(ProjectLandData);
                        }
                    }}
                    onCancel={() =>
                        navigate("/projectLead", {
                            state: { activeTab: "Land" },
                        })}
                    isLoading={false}
                />

                {/* ================= LAND OVERVIEW ================= */}
                <div className="grid grid-cols-1 gap-6 pt-5">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-start gap-5">

                            <div className="w-full lg:w-[240px] shrink-0">
                                <div className="relative w-full lg:w-[220px] h-[200px] lg:h-[150px] rounded-xl overflow-hidden">
                                    <ImageCarousel
                                        images={ProjectLandData?.PhotoURL ?? ""}
                                        thumbHeight="h-full"
                                    />

                                    <div className="absolute top-2 right-2 z-20">
                                        <FieldItem
                                            label=""
                                            urls={ProjectLandData?.PhotoURL}
                                            isIcon
                                            isSetValue={false}
                                        />
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EFF4FF] text-[#464554] font-medium text-xs  mt-2">
                                    <MapPin className="text-[#4648D4]" size={18} />
                                    {ProjectLandData?.CityName}, {ProjectLandData?.StateName}
                                </div>
                            </div>


                            <div className="flex-1 min-w-0 py-2">

                                <h2 className="text-xl font-semibold text-slate-800 truncate">
                                    {ProjectLandData?.LandOwnerName || "-"}
                                </h2>


                                <div className="pt-2">
                                    <FieldItem label="Plot / CTS / Survey / Subdivision Number" value={ProjectLandData?.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber} isRow />

                                </div>

                                <div className="mt-2">
                                    <FieldItem label="Address" value={ProjectLandData?.LandAddress} isRow />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= LOCATION DETAILS ================= */}
                <div className="grid grid-cols-1 gap-6 pt-5">
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

                            {ProjectLandData?.IdentificationLocation && (
                                <span
                                    className="text-blue-600 text-sm underline cursor-pointer"
                                    onClick={() => window.open(ProjectLandData.IdentificationLocation ?? "", "_blank")}
                                >
                                    Google Location
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-6 text-sm font-semibold text-gray-500 pb-3">
                            <span>Country</span>
                            <span>State</span>
                            <span>District</span>
                            <span>City</span>
                            <span>Pin Code</span>
                            <span>Ward Number</span>
                        </div>

                        <div className="border-t border-gray-300" />

                        <div className="grid grid-cols-6 pt-4 text-sm font-medium text-slate-800">
                            <span>{ProjectLandData?.CountryName || "-"}</span>
                            <span>{ProjectLandData?.StateName || "-"}  </span>
                            <span> {ProjectLandData?.DistrictName || "-"} </span>
                            <span> {ProjectLandData?.CityName || "-"}  </span>
                            <span>{ProjectLandData?.PinCode || "-"}  </span>
                            <span>{ProjectLandData?.WardNumberZone}</span>
                        </div>
                    </div>
                </div>

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

                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        <FieldItem label="Total Plot Area (SqMt)" value={ProjectLandData?.TotalPlotAreaSqM} />
                        <FieldItem label="Plot Shape" value={ProjectLandData?.PlotShape} />
                        <FieldItem label="Depth Of The Plot" value={ProjectLandData?.PlotDepth} />
                        <FieldItem label="Road Width" value={ProjectLandData?.RoadWidth} />
                        <FieldItem label="Soil Type" value={ProjectLandData?.SoilType} />
                        <FieldItem label="Existing Ground Conditions" value={ProjectLandData?.ExistingGroundCondition} />
                        <FieldItem label="Surrounding Land Use" value={ProjectLandData?.SurroundingLandUse} />
                        <FieldItem label="Total Number Of Trees on Site" value={ProjectLandData?.TotalNumberOfTreesonSite} />
                        <FieldItem label="Available of Access Road" value={ProjectLandData?.IsAccessRoadAvailable === true ? "Yes" : "No"} />
                        <FieldItem label="Electricity Connection Nearby" value={ProjectLandData?.IsElectricityConnectionNearby === true ? "Yes" : "No"} />
                        <FieldItem label="FSI Permissible" value={ProjectLandData?.FSIPermissible} />
                        <FieldItem label="Type of Water Supply Available" value={ProjectLandData?.WaterSupplyAvailable} />
                    </div>
                </div>

                {/* ================= LEGAL DETAILS ================= */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-5">

                    {/* LEFT COLUMN - 1. LEGAL & OWNERSHIP */}
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <BadgeCheck className="w-5 h-5 text-indigo-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Legal & Ownership Details
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <FieldItem
                                label="Type Of Land Tenure"
                                value={ProjectLandData?.TypeOfLandTenureType}
                            />

                            <FieldItem
                                label="Land Ownership Type"
                                value={ProjectLandData?.LandOwnershipType}
                            />

                            <FieldItem
                                label="Any Power Of Attorney Involved"
                                value={
                                    ProjectLandData?.IsAnyPowerofAttorneyInvolved === true
                                        ? "Yes"
                                        : "No"
                                }
                            />

                            <FieldItem
                                label="Fencing / Boundary Wall Present"
                                value={
                                    ProjectLandData?.IsFencingBoundaryWallPresent === true
                                        ? "Yes"
                                        : "No"
                                }
                            />

                            <FieldItem
                                label="Land Converted To Non-Agricultural"
                                value={
                                    ProjectLandData?.IsLandConvertedToNonAgricultural === true
                                        ? "Yes"
                                        : "No"
                                }
                            />

                            <FieldItem
                                label="Plot Under Litigation / Stay Order"
                                value={
                                    ProjectLandData?.IsUnderLitigationOrStayOrder === true
                                        ? "Yes"
                                        : "No"
                                }
                            />

                            <FieldItem
                                label="7 / 12"
                                value={
                                    ProjectLandData?.Is712Available === true
                                        ? "Yes"
                                        : "No"
                                }
                            />
                        </div>
                    </div>


                    {/* RIGHT COLUMN */}
                    <div className="flex flex-col gap-6">

                        {/* 2. DISTANCE */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <Route className="w-5 h-5 text-violet-600" />
                                </div>

                                <h2 className="text-[16px] font-semibold text-slate-800">
                                    Distance From Key Landmarks
                                </h2>
                            </div>

                            <div className="grid grid-cols-4 gap-6">
                                <FieldItem
                                    label="Town (KM)"
                                    value={ProjectLandData?.DistanceFromNearestTownKM}
                                />

                                <FieldItem
                                    label="Highway (KM)"
                                    value={ProjectLandData?.DistanceFromHighwayKM}
                                />

                                <FieldItem
                                    label="Railway Station (KM)"
                                    value={ProjectLandData?.DistanceFromRailwayStationKM}
                                />

                                <FieldItem
                                    label="Airport (KM)"
                                    value={ProjectLandData?.DistanceFromAirportKM}
                                />
                            </div>

                        </div>


                        {/* 3. CONTACT */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <ContactRound className="w-5 h-5 text-emerald-600" />
                                </div>

                                <h2 className="text-[16px] font-semibold text-slate-800">
                                    Land Contact Information
                                </h2>
                            </div>

                            <div className="flex flex-col gap-4">
                                <FieldItem
                                    label="Name"
                                    value={ProjectLandData?.ContactPersonName ?? '-'}
                                    isRow
                                />

                                <FieldItem
                                    label="Mobile No"
                                    value={
                                        ProjectLandData?.ContactPersonMobile
                                            ? `+91 ${ProjectLandData.ContactPersonMobile}`
                                            : '-'
                                    }
                                    isRow
                                />

                                <FieldItem
                                    label="E-Mail ID"
                                    value={ProjectLandData?.ContactPersonEmail ?? '-'}
                                    isRow
                                />
                            </div>

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
                            {ProjectLandData?.Remark || "-"}
                        </p>
                    </div>
                </div>

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
                        <FieldItem label="Created By" value={ProjectLandData?.CreatedBy} />
                        <FieldItem label="Created Date" value={ProjectLandData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(ProjectLandData?.CreatedDate) : ""} />
                        {ProjectLandData?.ModifiedBy && (
                            <>
                                <FieldItem label="Modified By" value={ProjectLandData?.ModifiedBy} />
                                <FieldItem label="Modified Date" value={ProjectLandData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(ProjectLandData?.ModifiedDate) : ""} />
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );

}