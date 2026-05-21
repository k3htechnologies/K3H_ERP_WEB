import { useState, useEffect } from "react";
import type { FilterWithPaginationTicket, TicketData } from "@/features/ticket/models/TicketModel";
import { runApiWithLoader } from "@/core/utils";
import { ticketService } from '@/features/ticket/services/TicketService';
import * as E from 'fp-ts/Either';
import { useToast } from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useTicketListState } from "@/features/ticket/context/TicketListStateContext";
import { useNavigate } from "react-router";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import { getTicketStatusColor } from "@/features/ticket/pages/TicketStatus";

export const ViewTicket: React.FC = () => {

    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { listState } = useTicketListState();
    const { SystemGeneratedCode, Platform, TicketId } = listState;
    const { addToast } = useToast();
    const navigate = useNavigate();

    const currentTicketMasterId = TicketId;

    useEffect(() => {

        if (!currentTicketMasterId) return;

        loadTicketMasterList();
    }, [currentTicketMasterId]);

    const loadTicketMasterList = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTicket = {
                    PageNumber: 1,
                    PageSize: 1,
                    TicketId: Number(currentTicketMasterId) || 0,
                }

                const response = await ticketService.apiCallPullTicket(params);

                if (E.isRight(response)) {

                    setTicketData(response.right.Data?.[0] ?? null);


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
            'Loading Single Ticket'
        );
    };

    const defaultHistory = {
        CreatedDate: ticketData?.CreatedDate,
        AssignedStatus: "Open",
        AssignedRemark: ticketData?.TicketRemark
    };

    const trackingHistory = [
        defaultHistory,
        ...(ticketData?.AssignTicketHistory || [])
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <div className="flex-1">
                <HeaderActionBar
                    subTitleText={SystemGeneratedCode}
                    subSubTitleText={Platform ?? "-"}
                    onCancel={() => {
                        navigate('/ticket');
                    }}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-4 rounded-lg mt-5">
                    <section className="bg-white rounded-xl shadow-sm  p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Ticketing Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  pt-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Platform" value={ticketData?.Platform} />
                            <FieldItem label="Module" value={ticketData?.Module} />
                            <FieldItem className="cursor-pointer text-blue-500" label="Attachment" value={ticketData?.AttachmentURL ? "View" : "-"} urls={ticketData?.AttachmentURL} isIcon />

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4  pt-4 pb-4" >
                            <FieldItem label="Description" value={ticketData?.TicketDescription} isIcon />
                        </div>
                    </section>
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 ">
                            Request Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Raised By" value={ticketData?.CreatedBy} />
                            <FieldItem label="Department" value={ticketData?.DepartmentName} />
                            <FieldItem label="Date" value={formatDate_dd_MonthName_yy_hh_mm(ticketData?.CreatedDate ?? '')} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  pt-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem
                                label="Priority"
                                value={ticketData?.Priority}
                                className={
                                    ticketData?.Priority === 'High' ? 'text-red-600' :
                                        ticketData?.Priority === 'Medium' ? 'text-orange-400' :
                                            ticketData?.Priority === 'Low' ? 'text-green-600' : ''
                                }
                            />

                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4  pt-4 pb-4 ">
                            <FieldItem label="Remark" value={ticketData?.TicketRemark} />
                        </div>

                    </section>

                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Action Details
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                            <FieldItem label="Created By" value={ticketData?.CreatedBy} />
                            <FieldItem label="Created Date" value={formatDate_dd_MonthName_yy_hh_mm(ticketData?.CreatedDate ?? '')} />
                            <FieldItem label="Modified By" value={ticketData?.ModifiedBy} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  pt-4 pb-4">
                            <FieldItem label="Modified Date" value={formatDate_dd_MonthName_yy_hh_mm(ticketData?.ModifiedDate ?? '')} />
                        </div>
                    </section>

                    {ticketData?.EmployeeName && (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Assignee Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Assigned By" value={ticketData?.AssignedBy} />
                                <FieldItem label="Primary Assignee" value={ticketData?.EmployeeName} />

                                <div>
                                    <p className="text-sm font-medium text-[#1D1D1D80] truncate">Collaborators</p>
                                    <div className="flex flex-col items-start gap-1 text-sm font-medium mt-1 text-gray-900">
                                        {ticketData.CollaboratorsName ? (
                                            ticketData.CollaboratorsName.split(',').map((name, index) => (
                                                <p key={index}>{name}</p>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 font-normal">-</p>
                                        )}
                                    </div>
                                </div>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  pt-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Assigned Date" value={formatDate_dd_MonthName_yy_hh_mm(ticketData?.CreatedDate ?? '')} />
                                <FieldItem label="Estimated Completion Date" value={formatDate_dd_MonthName_yy_hh_mm(ticketData?.ResolvedTillDate ?? '')} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4  pt-4 pb-4 ">
                                <FieldItem label="Remark" value={ticketData?.AssignedRemark || '-'} />
                            </div>
                        </section>
                    )}
                </div>

                <div className="col-span-1 mt-5">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">
                        <div className="border-b pb-2 mt-1">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-lg font-semibold text-black">
                                    Tracking History
                                </h1>
                            </div>
                        </div>

                        <div className="mt-3 overflow-y-auto h-[500px] thin-scroll pr-2">
                            {trackingHistory && trackingHistory.length > 0 && (
                                trackingHistory.map((item, index) => (
                                    <div key={index} className="grid grid-cols-[24px_1fr] gap-3">

                                        <div className="flex flex-col items-center">
                                            <div className="h-4 w-4 rounded-full bg-blue-600 z-10"></div>

                                            {index !== trackingHistory.length - 1 && (
                                                <div className="w-[3px] bg-blue-600 flex-1 min-h-[45px]"></div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 pb-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <span className="font-medium text-gray-900 text-sm">
                                                    {formatDate_dd_MonthName_yy(item.CreatedDate ?? "")}
                                                </span>

                                                <span className="text-xs text-gray-500">
                                                    {(() => {
                                                        const { bg, text } = getTicketStatusColor(item.AssignedStatus || '');

                                                        return (
                                                            <span
                                                                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                                                                style={{ backgroundColor: bg, color: text }}
                                                            >
                                                                {item.AssignedStatus || "-"}
                                                            </span>
                                                        );
                                                    })()}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {item.AssignedRemark || "-"}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewTicket;