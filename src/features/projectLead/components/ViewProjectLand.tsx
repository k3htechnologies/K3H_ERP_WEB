import useToast from "@/core/hooks/useToast";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FilterWithPaginationProjectLandRequest, ProjectLandData } from "../models/ProjectLandModel";
import { runApiWithLoader } from "@/core/utils";
import { projectLandService } from "../services/ProjectLandService";
import * as E from "fp-ts/Either";
import { useProjectLandListState } from "../context/ProjectLandListStateContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

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
            "Loading Project Lead",
        );
    };

    const handleEditProjectLandData = (row: ProjectLandData) => {
        if (!row?.ProjectLandId) return;
        navigate(`/projectLead/addProjectLand/${row.ProjectLandId}`);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <HeaderActionBar
                titleText={ProjectLandData?.LandOwnerName ?? ""}
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
                        state: { activeTab: "Land" }
                    })}
                isLoading={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 pt-5">

                <FieldItem label="Land Owner" value={ProjectLandData?.LandOwnerName} />
                <FieldItem label="Land Address" value={ProjectLandData?.LandAddress} />
                <FieldItem label="Country" value={ProjectLandData?.CountryName} />
                <FieldItem label="State" value={ProjectLandData?.StateName} />
                <FieldItem label="District" value={ProjectLandData?.DistrictName} />
                <FieldItem label="City" value={ProjectLandData?.CityName} />
                <FieldItem label="Pin Code" value={ProjectLandData?.PinCode} />
                <FieldItem label="Plot Number" value={ProjectLandData?.PlotNumber_CTSNumber_SurveyNumber_SubdivisionNumber} />
                <FieldItem label="Ward Number / Zone" value={ProjectLandData?.WardNumberZone} />
                <FieldItem label="Total Plot Area" value={ProjectLandData?.TotalPlotAreaSqM} />
                <FieldItem label="Identification And Location" value={ProjectLandData?.IdentificationLocation} />
                <FieldItem label="Latitude And Longitude" value={ProjectLandData?.LatitudeLongitude} />
                <FieldItem label="Contact Person Land Name" value={ProjectLandData?.ContactPersonName} />
                <FieldItem label="Contact Person Land Mobile Number" value={ProjectLandData?.ContactPersonMobile} />
                <FieldItem label="Contact Person Land Email" value={ProjectLandData?.ContactPersonEmail} />
                <FieldItem label="Any Power Of Attorney" value={ProjectLandData?.IsAnyPowerofAttorneyInvolved} />
                <FieldItem label="Fencing Boundary Wall Present" value={ProjectLandData?.IsFencingBoundaryWallPresent} />
                <FieldItem label="Plot Shape" value={ProjectLandData?.PlotShape} />
                <FieldItem label="Frontage" value={ProjectLandData?.Frontage} />
                <FieldItem label="Depth Of The Plot" value={ProjectLandData?.PlotDepth} />
                <FieldItem label="Road Width In Front Of Plot" value={ProjectLandData?.RoadWidth} />
                <FieldItem label="Soil Type" value={ProjectLandData?.SoilType} />
                <FieldItem label="Existing Ground Conditions" value={ProjectLandData?.ExistingGroundCondition} />
                <FieldItem label="Is Land Converted To Non-Agricultural" value={ProjectLandData?.IsLandConvertedToNonAgricultural} />
                <FieldItem label="Availability Of Access Road" value={ProjectLandData?.IsAccessRoadAvailable} />
                <FieldItem label="Electricity Connection Nearby" value={ProjectLandData?.IsElectricityConnectionNearby} />
                <FieldItem label="Is Plot Under Litigation Or Stay Orders" value={ProjectLandData?.IsUnderLitigationOrStayOrder} />
                <FieldItem label="Is 7 / 12" value={ProjectLandData?.Is712Available} />
                <FieldItem label="FSI Permissible" value={ProjectLandData?.FSIPermissible} />
                <FieldItem label="Water Supply Available" value={ProjectLandData?.WaterSupplyAvailable} />
                <FieldItem label="Surrounding Land Use" value={ProjectLandData?.SurroundingLandUse} />
                <FieldItem label="Type Of Land Tenure" value={ProjectLandData?.TypeOfLandTenureType} />
                <FieldItem label="Land Ownership Type" value={ProjectLandData?.LandOwnershipType} />
                <FieldItem label="Distance From Nearest Town" value={ProjectLandData?.DistanceFromNearestTownKM} />
                <FieldItem label="Distance From Highway" value={ProjectLandData?.DistanceFromHighwayKM} />
                <FieldItem label="Distance From Railway Station" value={ProjectLandData?.DistanceFromRailwayStationKM} />
                <FieldItem label="Distance From Airport" value={ProjectLandData?.DistanceFromAirportKM} />
                <FieldItem label="Total Number Of Trees On Site" value={ProjectLandData?.TotalNumberOfTreesonSite} />
                <FieldItem label="Remarks" value={ProjectLandData?.Remark} />

            </div>

        </div >
    )

}