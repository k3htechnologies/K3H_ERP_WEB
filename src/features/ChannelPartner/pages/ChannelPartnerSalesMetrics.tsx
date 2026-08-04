import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader } from "@/core/utils/loader";
import PaginationCard from "@/ui/components/Card/PaginationCard";
import type { ChannelPartnerAOPData, FilterWithPaginationChannelPartnerAOPRequest } from "@/features/ChannelPartner/models/ChannelPartnerAOPModel";
import { usePagination } from "@/core/hooks/usePagination";
import { useToast } from "@/core/hooks/useToast";
import type { PaginationInfo } from "@/ui/components/DataTable/DataTable";
import * as E from "fp-ts/Either";
import { runApiWithLoader } from "@/core/utils";
import { ChannelPartnerService } from "@/features/ChannelPartner/services/ChannelPartnerService";
import { useChannelPartnerListState } from "@/features/ChannelPartner/context/ChannelPartnerListStateContext";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/core/utils/comman";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { FieldItem } from "@/ui/components/forms/FieldItem";


const ChannelPartnerSalesMetrics: React.FC = () => {
    const [channelPartnerAOPList, setChannelPartnerAOPList] = useState<ChannelPartnerAOPData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const { pagination, setPagination } = usePagination(20);
    const { addToast } = useToast();
    const { listState } = useChannelPartnerListState();
    const { channelPartnerId, channelPartnerName } = listState;
    const navigate = useNavigate();

    const loadChannelPartnerAOPList = async (pageNum: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationChannelPartnerAOPRequest = {
                    PageNumber: pageNum,
                    PageSize: pagination.pageSize,
                    ProjectId: 0,
                    ChannelPartnerId: channelPartnerId,
                };

                const response = await ChannelPartnerService.apiCallPullChannelPartnerAOP(params);

                if (E.isRight(response)) {

                    setChannelPartnerAOPList(response.right.Data);

                    setPagination({
                        currentPage: pageNum,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });
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
            "Loading Pay Track Booking",
        );
    };

    useEffect(() => {
        loadChannelPartnerAOPList(1);

    }, []);

    const handlePageChange = useCallback(
        (newPage: number) => {
            loadChannelPartnerAOPList(newPage);
        },
        [pagination.pageSize]
    );

    const payTrackBookingPaginationInfo: PaginationInfo = useMemo(
        () => ({
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalRecords: pagination.totalRecords,
            pageSize: pagination.pageSize,
            onPageChange: handlePageChange,
        }),
        [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize],
    );


    return (
        <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}> {" "}<div></div>{" "}</Loader>

            <HeaderActionBar
                titleText="Channel Partner : "
                subTitleText={channelPartnerName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => navigate(-1)}
                canAction={false}

                isLoading={false}
            />
            <div className="pt-5">
                <PaginationCard
                    data={channelPartnerAOPList}
                    pagination={payTrackBookingPaginationInfo}
                    emptyMessage="No Data found"
                    className="flex-1"
                    selectedRowKey={0}
                    isUsedForOther={false}
                    header={(row) => (
                        <div className="rounded-xl border border-indigo-100 overflow-hidden">
                            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-[#F9F3FF] to-[#F8FAFF] border-b border-indigo-100">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-bold text-slate-800">
                                        {formatDate_dd_MonthName_yy(row.AOPFromDate)} - {formatDate_dd_MonthName_yy(row.AOPToDate)}
                                    </h2>

                                    <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                                        {row.AOPStatus}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-5 py-2 text-sm font-medium text-blue">

                                    <FieldItem label="" value="View" urls={row?.AOPDocumentURL} isIcon />
                                </div>
                            </div>

                            <div className="grid grid-cols-7 divide-x divide-gray-200 px-8 py-8 bg-white">
                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        Enquiry
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">{row.NoOfEnquiry}</p>
                                </div>

                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        Bookings
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">{row.NoOfBooking}</p>
                                </div>

                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        IBM
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">{row.NoOfIbm}</p>
                                </div>

                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        OBM
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">{row.NoOfObm}</p>
                                </div>

                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        Brokerage %
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">{row.BrokeragePercentage}</p>
                                </div>

                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        Accrued
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-blue-600">
                                        {formatCurrency(row.BrokerageAmount)}
                                    </p>
                                </div>

                                <div className="px-4">
                                    <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                        Paid
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-green-600">
                                        {formatCurrency(row.PaidBrokerageAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                />


            </div>
        </div>
    );
};
export default ChannelPartnerSalesMetrics;
