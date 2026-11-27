import { useEffect, useState } from "react";
import type { FilterWithPaginationVerifyAssetMasterRequest, VerifyAssetMasterData } from "../models/AssetMasterModel";
import { runApiWithLoader } from "@/core/utils";
import { assetMasterService } from "../services/AssetMasterService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Loader } from "@/core/utils/loader";
import { Box, Check, Info, MessageCircleMore, User, Users } from "lucide-react";
import ImageCarousel from "@/ui/components/ImageViewer/ImageCarousel";
import { useParams } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

export const VerifyAssetMaster: React.FC = () => {
    const [VerifyAssetMasterData, setVerifyAssetMasterData] = useState<VerifyAssetMasterData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { addToast } = useToast();
    const { assetMasterId, uniqueKey } = useParams();

    useEffect(() => {
        loadVerifyAssetMaster();
    }, []);

    const loadVerifyAssetMaster = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationVerifyAssetMasterRequest = {
                    AssetMasterId: Number(assetMasterId) || 0,
                    Uniquekey: uniqueKey ?? ""
                };

                const response = await assetMasterService.apiCallPullVerifyAssetMaster(params);

                if (E.isRight(response)) {

                    const data = response.right.Data;

                    setVerifyAssetMasterData(Array.isArray(data) ? (data[0] ?? null) : data);

                } else {
                    addToast({ type: "error", title: response.left.message })
                }
            }, undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Verify Asset '
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-4">
            <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

            <div className="flex items-center gap-3 mb-4 pt-2">

                <div className="flex items-center justify-center">
                    <Box className="w-5 h-5 text-blue-500" />
                </div>

                <h2 className="text-[16px] font-semibold text-slate-800">
                    Asset Details
                </h2>
            </div>

            {/* ASSET DETAILS */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-3">

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

                    <div className="w-full lg:w-[220px] shrink-0">
                        <div className="relative w-full lg:w-[220px] h-[160px] lg:h-[150px] rounded-lg overflow-hidden bg-gray-100">
                            <ImageCarousel
                                images={VerifyAssetMasterData?.AssetImageURL ?? ""}
                                thumbHeight="h-full"
                            />

                            <div className="absolute top-2 right-2 z-20">
                                <FieldItem label="" urls={VerifyAssetMasterData?.AssetImageURL} isIcon isSetValue={false} />
                            </div>

                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">

                            <div className="flex-1 min-w-0 space-y-2">

                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-lg font-semibold text-gray-800">
                                        {VerifyAssetMasterData?.AssetBrand ?? "-"} {VerifyAssetMasterData?.AssetModel ?? "-"}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-[#EEF3FA] px-2 py-1 w-fit">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {VerifyAssetMasterData?.AssetCode || "-"}
                                    </span>
                                </div>

                                <span className="text-sm font-semibold text-slate-500">
                                    {VerifyAssetMasterData?.AssetName ?? "-"} . {VerifyAssetMasterData?.AssetBrand ?? "-"}
                                </span>

                            </div>

                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                    <div className="flex items-center gap-3 bg-[#F2F7FC] rounded-lg p-3 ">

                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-white" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Current Holder
                            </p>

                            <p className="text-sm font-medium text-slate-800">
                                {VerifyAssetMasterData?.EmployeeName ?? "-"}
                            </p>

                            <span className="text-xs text-slate-400">
                                {(VerifyAssetMasterData?.EmployeeCode) ?? "-"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[#F2F7FC] rounded-lg p-3 ">

                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                            <Check className="w-5 h-5 text-white" />
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Condition
                            </p>

                            <span className="text-sm font-medium text-slate-800">
                                {VerifyAssetMasterData?.HandoverCondition ?? "-"}
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* ASSET INFORMATION */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 pt-4">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-3">

                        <div className="rounded-full bg-blue-600 flex items-center justify-center">
                            <Info className="w-5 h-5 text-white" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Asset Information
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <FieldItem label="Brand" value={VerifyAssetMasterData?.AssetBrand ?? "-"} isRow />
                        <FieldItem label="Model" value={VerifyAssetMasterData?.AssetModel ?? "-"} isRow />
                        <FieldItem label="Code" value={VerifyAssetMasterData?.AssetCode ?? "-"} isRow />
                        <FieldItem label="Serial Number" value={VerifyAssetMasterData?.SerialNumber ?? "-"} isRow />
                        <FieldItem label="Purchase Date" value={formatDate_dd_MonthName_yy(VerifyAssetMasterData?.PurchaseDate ?? "-")} isRow />
                        <FieldItem label="Warranty Until" value={formatDate_dd_MonthName_yy(VerifyAssetMasterData?.WarrantyExpiryDate ?? "-")} isRow />
                        <FieldItem label="Location" value={VerifyAssetMasterData?.Branch ?? "-"} isRow />
                        <FieldItem label="Department" value={VerifyAssetMasterData?.Department ?? "-"} isRow />
                    </div>
                </div>
            </div>

            {/* RECENT REMARK */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 pt-4">
                <div className="bg-[#EDF4FF] rounded-3xl border border-blue-100 shadow-sm p-4 sm:p-5">

                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">

                        <div className="rounded-full bg-blue-600 flex items-center justify-center">
                            <MessageCircleMore className="w-5 h-5 text-white" />
                        </div>

                        <h2 className="text-[16px] font-semibold text-slate-800">
                            Recent Remark
                        </h2>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                        {VerifyAssetMasterData?.Remark ?? "-"}
                    </p>

                    <span className="block text-sm text-slate-500 mt-2">
                        Added By {VerifyAssetMasterData?.AssignedBy ?? "-"} · {formatDate_dd_MonthName_yy(VerifyAssetMasterData?.AssignedDate ?? "-")}
                    </span>

                </div>
            </div>

            {/* CURRENTLY ASSIGNED TO */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-4 pt-4">
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">

                    <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-3">

                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Currently Assigned To
                            </h2>
                        </div>

                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#D2F0DD] text-[#1B7E43] whitespace-nowrap">
                            Current Holder
                        </span>
                    </div>

                    <div className="pb-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-slate-800">
                            {VerifyAssetMasterData?.EmployeeName ?? "-"}
                        </p>

                        <span className="text-sm text-slate-500">
                            {VerifyAssetMasterData?.EmployeeCode ?? "-"} . {VerifyAssetMasterData?.Designation ?? "-"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 pt-3">
                        <FieldItem label="Assigned By" value={VerifyAssetMasterData?.AssignedBy ?? "-"} />
                        <FieldItem label="Assigned Date" value={formatDate_dd_MonthName_yy(VerifyAssetMasterData?.AssignedDate ?? "-")} />
                        <FieldItem label="Handover Condition" value={VerifyAssetMasterData?.HandoverCondition ?? "-"} />
                    </div>

                </div>
            </div>
        </div>
    )
}


export default VerifyAssetMaster;
