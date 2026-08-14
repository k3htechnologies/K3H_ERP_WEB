import { useEffect, useState } from "react"
import type { BuildingData, FilterWithPaginationBuildingRequest } from "@/features/building/models/BuildingModel"
import { buildingService } from "@/features/building/services/BuildingService"
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from '@/core/utils';
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { formatCurrency } from "@/core/utils/comman";

interface BuidlingOverviewTabProps {
    projectId: number | null
    buildingId?: number
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    setLoadingMessage: (message: string) => void
}

export const BuildingOverviewTab: React.FC<BuidlingOverviewTabProps> = ({
    projectId,
    buildingId,
    setIsLoading,
    setLoadingMessage
}) => {
    const { addToast } = useToast();
    const [buildingData, setBuildingData] = useState<BuildingData | null>(null);

    useEffect(() => {
        if (!projectId || !buildingId) return;
        loadBuildingFromServer();

    }, [projectId, buildingId]);

    const loadBuildingFromServer = async () => {
        if (!buildingId) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BuildingId: buildingId,
                    IsCheckPermission: false,
                    ProjectId: Number(projectId)
                };

                const response = await buildingService.apiCallPullBuilding(params);

                if (E.isRight(response)) {

                    setBuildingData(response.right.Data?.[0] ?? null);

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
            'Loading Building Data'
        );
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-3">

            {/* ================= LEFT SIDE (2/3) ================= */}
            <div className="lg:col-span-3 space-y-6">

                {/* ================= HEADER / BASIC DETAILS ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#1D4ED8]">
                            Building Details
                        </h4>
                    </div>
                    <div className="p-4 bg-white">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Building Name" value={buildingData?.BuildingName ?? '-'} />
                            <FieldItem label="CTS Number" value={buildingData?.CTSNumber ?? '-'} />
                            <FieldItem label="Road Width" value={buildingData?.RoadWidth ?? '-'} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                            <FieldItem label="Land Ownership" value={buildingData?.LandOwnershipType ?? '-'} />
                            <FieldItem label="Category" value={buildingData?.Category ?? '-'} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pt-4 ">
                            <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                Google Location
                            </div>
                            {buildingData?.GoogleLocation !== "" ?
                                <span className="text-blue-600 text-sm underline cursor-pointer break-all whitespace-normal"
                                    onClick={() => window.open(buildingData?.GoogleLocation, "_blank")}>
                                    {buildingData?.GoogleLocation}
                                </span> : "-"}
                        </div>
                    </div>
                </section>
                {buildingData?.Category == "Tender" && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FCF1FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#561F64]">
                                    Tender Amount Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Amount" value={formatCurrency(buildingData?.TenderAmount ?? "-")} />
                                    <FieldItem label="Payment Mode" value={buildingData?.TenderAmountPaymentMode} />

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                    <FieldItem label="Purchase Start Date" value={formatDate_dd_MonthName_yy(buildingData?.TenderPurchaseStartDate ?? '-')} />
                                    <FieldItem label="Purchase End Date" value={formatDate_dd_MonthName_yy(buildingData?.TenderPurchaseEndDate ?? '-')} />


                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                    <FieldItem label="Transaction / Cheque / DD No" value={buildingData?.TenderAmountChequeNumber} urls={buildingData.TenderAmountChequeNumberURL} isIcon />


                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-4">
                                    <FieldItem label="Payorder Remark" value={buildingData?.TenderAmountPayorderRemark} />

                                </div>
                            </div>
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FFECEC] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#E92C2C]">
                                    Tender EMD Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="EMD Amount" value={formatCurrency(buildingData?.TenderEMDAmount ?? "-")} />
                                    <FieldItem label="Submission Date" value={formatDate_dd_MonthName_yy(buildingData?.TenderSubmissionDate ?? "-")} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                    <FieldItem label="Payment Mode" value={buildingData?.TenderEMDPaymentMode} />

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                    <FieldItem label="Transaction / Cheque / DD No" value={buildingData?.TenderEMDChequeNumber} urls={buildingData.TenderEMDChequeNumberURL} isIcon />

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 pt-4">
                                    <FieldItem label="Payorder Remark" value={buildingData?.TenderEMDPayorderRemark} />
                                </div>
                            </div>
                        </section>
                    </div>

                )}
                {/* ================= PROPERTY INFORMATION ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#C2410C]">
                            Property Information
                        </h4>
                    </div>
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Total Plot Area (SqMt)" value={buildingData?.TotalPlotAreaSqMt ?? '-'} />
                            <FieldItem label="Total Plot Area (SqFt)" value={buildingData?.TotalPlotAreaSqFt ?? '-'} />
                            <FieldItem label="Utilized Units Area (SqFt)" value={buildingData?.TotalUnitsAreaUtilizedSqFt ?? '-'} />


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            <FieldItem label="Total Units" value={buildingData?.TotalNumberOfUnits ?? '-'} />
                            <FieldItem label="Number Of Floors" value={buildingData?.NumberOfFloors ?? '-'} />
                            <FieldItem label="Number Of Wings" value={buildingData?.NumberOfWings ?? '-'} />

                        </div>
                    </div>
                </section>

                {/* ================= LOCATION DETAILS ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#13367A]">
                            Location Details
                        </h4>
                    </div>
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Country" value={buildingData?.CountryName ?? '-'} />
                            <FieldItem label="State" value={buildingData?.StateName ?? '-'} />
                            <FieldItem label="District" value={buildingData?.DistrictName ?? '-'} />

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            <FieldItem label="City" value={buildingData?.CityName ?? '-'} />
                            <FieldItem label="Village" value={buildingData?.VillageName ?? '-'} />
                            <FieldItem label="Ward" value={buildingData?.WardName ?? '-'} />

                        </div>
                    </div>
                </section>


            </div>

            {/* ================= RIGHT SIDE (1/3) ================= */}
            <div className="lg:col-span-2 space-y-6">

                {/* ================= FSI / TDR INFORMATION ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#7B6B28]">
                            FSI / TDR Information
                        </h4>
                    </div>
                    <div className="p-4 bg-white">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            <FieldItem label="FSI / TDR Utilization (SqFt)" value={buildingData?.FSI_TDR_UtilizationSqFt ?? '-'} />
                            <FieldItem label="Property Age (Years)" value={buildingData?.PropertyAgeYears ?? '-'} />

                        </div>
                    </div>

                </section>
                {/* ================= GARDERN INFORMATION ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#13367A]">
                            Garden Information
                        </h4>
                    </div>
                    <div className="p-4 bg-white">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            <FieldItem label="Garden" value={buildingData?.IsGarden ? 'Yes' : 'No'} />
                            <FieldItem label="Garden Area (SqFt)" value={buildingData?.TotalGardenAreaSqFt ?? '-'} />

                        </div>
                    </div>

                </section>

                {/* ================= GARDERN INFORMATION ================= */}

                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#EAFCFF] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#12A3DD]">
                            Religious Information
                        </h4>
                    </div>
                    <div className="p-4 bg-white">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            <FieldItem label="Religious Structure" value={buildingData?.IsReligiousStructure ? 'Yes' : 'No'} />
                            <FieldItem label="Structure Area (SqFt)" value={buildingData?.TotalReligiousStructureAreaSqFt ?? '-'} />

                        </div>
                    </div>

                </section>



                {/* ================= GARDERN INFORMATION ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                    <div className="bg-[#E6FFE6] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#00A800]">
                            Litigation
                        </h4>
                    </div>
                    <div className="p-4 bg-white">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            <FieldItem label="Litigation" value={buildingData?.IsLitigation ? 'Yes' : 'No'} />
                            <FieldItem label="Litigation Remarks" value={buildingData?.LitigationRemarks ?? '-'} />

                        </div>
                    </div>

                </section>
                {/* ================= QUICK ACTIONS ================= */}
                <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                    <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                        <h4 className="text-sm font-semibold text-[#333333]">
                            Action Details
                        </h4>
                    </div>
                    <div className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Created By" value={buildingData?.CreatedBy ?? '-'} />
                            <FieldItem
                                label="Created Date"
                                value={formatDate_dd_MonthName_yy_hh_mm(buildingData?.CreatedDate ?? '-')}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                            <FieldItem label="Modified By" value={buildingData?.ModifiedBy ?? '-'} />
                            <FieldItem
                                label="Modified Date"
                                value={formatDate_dd_MonthName_yy_hh_mm(buildingData?.ModifiedDate ?? '-')}
                            />
                        </div>
                    </div>
                </section>

            </div>

        </div>
    )
}