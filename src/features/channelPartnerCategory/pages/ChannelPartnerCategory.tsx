import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AddUpdatechannelPartnerCategoryRequest, ChannelPartnerCategoryData, FilterWithPaginationchannelPartnerCategoryRequest } from "@/features/channelPartnerCategory/models/ChannelPartnerCategoryModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { channelPartnerCategoryService } from "@/features/channelPartnerCategory/services/ChannelPartnerCategoryService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { Button, Input } from "@/ui/components/forms";
import { DataTableEditable, type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable";
import { filterNumbers, filterNumbersWithDecimal } from "@/core/utils/fileValidation";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

export const ChannelPartnerCategory: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { projectId } = useProject();
    const { addToast } = useToast();
    const [channelPartnerCategoryData, setChannelPartnerCategoryData] = useState<ChannelPartnerCategoryData[]>([]);
    const [editchannelPartnerCategoryData, setEditchannelPartnerCategoryData] = useState<ChannelPartnerCategoryData[]>([])
    const { canAction } = useMenuPermissions();

    useEffect(() => {
        if (!projectId) return
        loadChannelPartnerCategoryData()
    }, [projectId])

    const loadChannelPartnerCategoryData = useCallback(async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationchannelPartnerCategoryRequest = {
                    ProjectId: Number(projectId),
                }

                const response = await channelPartnerCategoryService.apiCallpullChannelPartnerCategoryData(params);

                if (E.isRight(response)) {

                    setChannelPartnerCategoryData(response.right.Data);

                    setEditchannelPartnerCategoryData(response.right.Data)

                } else {
                    addToast({ type: 'error', title: response.left.message });
                }
            },
            undefined,
            (error: any) =>
                addToast({ type: 'error', title: error.message }),
            undefined,
            'Loading Channel Partner Category'
        );
    }, [projectId])

    const PushChannelPartnerCategoryFormData = (): AddUpdatechannelPartnerCategoryRequest => {

        const Data = editchannelPartnerCategoryData.length > 0
            ? editchannelPartnerCategoryData
            : channelPartnerCategoryData;

        return {
            ProjectId: Number(projectId),
            ChannelPartnerCategoryJSON: JSON.stringify(
                Data.map((item) => ({
                    ChannelPartnerCategoryId: item.ChannelPartnerCategoryId,
                    CategoryName: item.CategoryName,
                    BookingRevenue: item.BookingRevenue,
                    NoOfEnquirys: item.NoOfEnquirys,
                }))
            )
        };
    };

    const handleAddUpdateChannelPartnerCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushChannelPartnerCategoryFormData();

                const response = await channelPartnerCategoryService.apiCallAddUpdatechannelPartnerCategoryRequest(payload);

                if (E.isRight(response)) {

                    setChannelPartnerCategoryData(response.right.Data)

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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
            'Add Update Channel Partner Category'
        )
    };

    const columns: EditableTableColumn[] = useMemo(() => [
        {
            key: 'CategoryName',
            label: 'Category Name',
            width: '20',
            sortable: false,
            fixed: 'left',
            align: 'left',
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: (value) => (
                <TooltipText
                    text={value || '-'}
                    maxWidth="250px"
                    tooltipThreshold={25}
                />
            ),
        },
        {
            key: 'BookingRevenue',
            label: 'Booking Revenue (₹)',
            width: '20',
            sortable: false,
            align: 'left',
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: value => value || '-',
            renderEditor: (value?: string, onChange?: any) => (
                <Input
                    className="w-full border rounded px-2 py-1"
                    value={value ?? ""}
                    onChange={(e) => onChange(filterNumbersWithDecimal(e.target.value))}
                />
            )
        },
        {
            key: 'NoOfEnquirys',
            label: 'No Of Enquiries',
            width: '20',
            sortable: false,
            align: 'left',
            headerClassName: "bg-[#E4F0FF] text-sm font-medium leading-[1.4] tracking-normal border-b border-r border-gray-300",
            render: value => value || '-',
            renderEditor: (value?: string, onChange?: any) => (
                <Input
                    className="w-full border rounded px-2 py-1"
                    value={value ?? ""}
                    maxLength={9}
                    onChange={(e) => onChange(Number(filterNumbers(e.target.value) || 0))}
                />
            )
        },
    ], [])

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="space-y-4 bg-white rounded-xll shadow-sm border border-gray-200">
                <DataTableEditable
                    columns={columns}
                    data={channelPartnerCategoryData}
                    onChange={(rows) => setEditchannelPartnerCategoryData(rows)}
                    className="flex-1"
                />
            </div>

            {canAction && (
                <div className="flex justify-end pt-5">
                    <Button onClick={handleAddUpdateChannelPartnerCategory}>
                        Save
                    </Button>
                </div>
            )}

        </div>
    )
}

export default ChannelPartnerCategory;