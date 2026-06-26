import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMemo } from "react";
import type { Table4 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";
import { Button } from "@/ui/components/forms";
import { copyToClipboard } from "@/core/utils/comman";
import { Copy } from "lucide-react";
import useToast from "@/core/hooks/useToast";

interface Props {
    NewAddedChannelPartnerData: Table4[];
}

const NewAddedChannelPartner: React.FC<Props> = ({ NewAddedChannelPartnerData }) => {

    const { addToast } = useToast();

    const NewAddedChannelPartnerColumns = useMemo<any[]>(
        () => [
            {
                key: "SystemGeneratedCode",
                label: "CP Code",
                align: "left",
                render: (value?:string) => {
                    return (
                        <div className="flex items-center gap-2">

                            <TooltipText
                                text={value || '-'}
                                maxWidth="150px"
                                tooltipThreshold={20}
                                tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
                            />

                            {value && (
                                <Button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const success = await copyToClipboard(value);
                                        if (success) {
                                            addToast({ type: 'success', title: `${value} Copied!` });
                                        }
                                    }}
                                    color="transparent"
                                    size="sm"
                                    style={{
                                        padding: '2px 6px',
                                        color: '#6B7280',
                                        cursor: 'pointer'
                                    }}
                                    title="Copy"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    );
                }
            },

            {
                key: "Name",
                label: "CP Name",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: "Type",
                label: "Type",
                align: "left",
                render: (value: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            {
                key: "CompanyName",
                label: "Company",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "CreatedDate",
                label: "Date",
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
        ], []
    );
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">Recently Added Channel Partner <span className="text-sm">(Last 7 Days)</span></h2>

            <div className="bg-white rounded-lg border border-gray-100  space-y-4 p-4 h-[300px] " style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

                <DataTableWithOutBorder
                    columns={NewAddedChannelPartnerColumns}
                    data={NewAddedChannelPartnerData}
                    emptyMessage="No New Added Channel Partner Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div>
        </div>
    )
}
export default NewAddedChannelPartner;