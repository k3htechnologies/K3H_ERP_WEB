import { runApiWithLoader } from "@/core/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChannelPartnerCategoryData, FilterWithPaginationchannelPartnerCategoryRequest } from "../models/ChannelPartnerCategoryModel";
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import { ChannelPartnerCategoryService } from "../services/ChannelPartnerCategoryService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import DataTableEditable, { type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable";


export const ChannelPartnerCategory: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { projectId } = useProject();
    const [channelPartnerCategoryData, setChannelPartnerCategoryData] = useState<ChannelPartnerCategoryData[]>([]);
    const { addToast } = useToast();

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

                const response = await ChannelPartnerCategoryService.apiCallpullChannelPartnerCategoryData(params);

                if (E.isRight(response)) {

                    setChannelPartnerCategoryData(response.right.Data)

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

    const ChannelPartnerCategoryColumns: EditableTableColumn[] = useMemo(() => [
        {
            key: 'CategoryName',
            label: 'Category Name',
            width: '20',
            sortable: true,
            fixed: 'left',
            align: 'left',
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
            label: 'Booking Revenue',
            width: '20',
            sortable: true,
            align: 'left',
            render: value => value || '-'
        },
        {
            key: 'NoOfEnquirys',
            label: 'No Of Enquirys',
            width: '20',
            sortable: true,
            align: 'left',
            render: value => value || '-'
        },
    ], [])

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="space-y-4 bg-white rounded-xll shadow-sm border border-gray-200">
                <DataTableEditable
                    columns={ChannelPartnerCategoryColumns}
                    data={channelPartnerCategoryData}

                />
            </div>
        </div>
    )
}

export default ChannelPartnerCategory;