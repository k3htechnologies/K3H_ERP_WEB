import { useCallback, useEffect, useMemo, useState } from "react"
import { useProject } from "@/features/projectMaster/context/ProjectContext";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import { usePayTrackBookingListState } from "@/features/crmPayTrack/context/PayTrackBookingListStateContext";
import * as E from "fp-ts/Either";
import { Loader } from "@/core/utils/loader";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import Checkbox from "@/ui/components/forms/Checkbox";
import { snagChecklistService } from "@/features/crmPayTrack/services/SnagCheckListService";
import type { AddUpdateSnagChecklistRequest, FilterWithPaginationSnagChecklistRequset, SnagChecklistData } from "@/features/crmPayTrack/models/SnagCheckListModel";
import Tabs from "@/ui/components/Tab/Tab";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { Button } from "@/ui/components/forms";
import { DataTableEditable, type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

export const SnagChecklist: React.FC = () => {

    const [snagCheckListData, setSnagCheckListData] = useState<SnagChecklistData[]>([])
    const [editSnagCheckListData, setEditSnagCheckListData] = useState<SnagChecklistData[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { projectId } = useProject();
    const { addToast } = useToast();

    const { listState } = usePayTrackBookingListState();
    const { bookingId, bookingApprovalStatus } = listState;
    const { canAction } = useMenuPermissions('/snagChecklist');

    const SnagChecklistTabList = [
        { id: "Civil", label: "Civil" },
        { id: "Electrical", label: "Electrical" },
        { id: "Plumbing", label: "Plumbing" }
    ];

    const [activeTab, setActiveTab] = useState<string>(SnagChecklistTabList[0].id)

    useEffect(() => {

        if (!projectId || !bookingId) return;
        loadSnagChecklistData()
    }, [projectId, bookingId])

    const loadSnagChecklistData = useCallback(async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationSnagChecklistRequset = {
                    ProjectId: Number(projectId),
                    BookingId: Number(bookingId),
                }

                const response = await snagChecklistService.apiCallSnagChecklist(params)

                if (E.isRight(response)) {

                    setSnagCheckListData(response.right.Data);

                    setEditSnagCheckListData(response.right.Data);

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
            "Loading Snag Check List"
        )
    }, [projectId, bookingId])


    const PushSnagChecklistFormData = (): AddUpdateSnagChecklistRequest => {

        const Data = editSnagCheckListData.length > 0
            ? editSnagCheckListData
            : snagCheckListData;

        return {
            ProjectId: Number(projectId),
            BookingId: bookingId,
            SnagCheckListJSON: JSON.stringify(
                Data.map((item) => ({
                    SnagCheckListId: item.SnagCheckListId,
                    IsCheck: item.IsCheck
                }))
            )
        }
    }

    const handleAddUpdateSnagChecklist = async (e: React.FormEvent) => {
        e.preventDefault();

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const payload = PushSnagChecklistFormData();

                const response = await snagChecklistService.apiCallAddUpdateSnagChecklist(payload);

                if (E.isRight(response)) {

                    setSnagCheckListData(response.right.Data);

                    setEditSnagCheckListData(response.right.Data);

                    addToast({ type: 'success', title: response.right.SuccessMessage[0] });

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
            'Add Update Snag Check List'
        )
    };

    const SnagChecklistcolumns: EditableTableColumn[] = useMemo(() => [
        {
            key: 'CheckFor',
            label: 'Check For',
            width: '50%',
            sortable: false,
            align: 'left',
            headerClassName: `bg-[#F3F4F6] text-[#374151] text-sm font-semibold py-4`,
            cellClassName: `py-5 text-[14px] text-gray-800 border-r-0 `,
            render: value => (
                <div className="pl-1">
                    {value || ""}
                </div>
            )
        },
        {
            key: 'ModifiedBy',
            label: 'Last Modified By',
            width: '33',
            sortable: false,
            align: 'left',
            headerClassName: `bg-[#F3F4F6] text-[#374151] text-sm font-semibold `,
            cellClassName: ` border-r-0`,
            render: (value, row) => (
                <TooltipText
                    text={value || row.CreatedBy || '-'}
                    maxWidth="180px"
                    tooltipThreshold={18}
                />
            )
        },
        {
            key: 'ModifiedDate',
            label: 'Last Modified Date',
            width: '33',
            sortable: false,
            align: 'left',
            headerClassName: `bg-[#F3F4F6] text-[#374151] text-sm font-semibold `,
            cellClassName: ` border-r-0`,
            render: (value, row) =>
                value
                    ? formatDate_dd_MonthName_yy_hh_mm(value)
                    : row.CreatedDate
                        ? formatDate_dd_MonthName_yy_hh_mm(row.CreatedDate)
                        : '-'
        },

        {
            key: 'IsCheck',
            label: 'Action',
            width: '90px',
            sortable: false,
            align: 'center',
            headerClassName: `bg-[#F3F4F6] text-[#374151] text-sm font-semibold `,
            cellClassName: ` border-r-0 text-center`,
            render: (_value, row) => {

                return (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={row.IsCheck === true}
                            disabled={!canAction}
                            onChange={(e) => {
                                const checked = e.target.checked;

                                setEditSnagCheckListData((prev) =>
                                    prev.map((item) =>
                                        item.SnagCheckListId === row.SnagCheckListId
                                            ? { ...item, IsCheck: checked }
                                            : item
                                    )
                                );
                            }}
                        />
                    </div>
                );
            }
        }
    ], [canAction]);

    const groupedSnagData = useMemo(() => {

        const filteredData = editSnagCheckListData.filter(
            (item) => item.CategoryName === activeTab
        );

        return Object.values(
            filteredData.reduce((data: any, item) => {

                const key = `${item.CategoryName}_${item.SubCategoryName}_${item.Title}`;

                if (!data[key]) {
                    data[key] = {
                        CategoryName: item.CategoryName,
                        SubCategoryName: item.SubCategoryName,
                        Title: item.Title,
                        Tags: item.Tags || "",
                        rows: []
                    };
                } else if (
                    item.Tags &&
                    !data[key].Tags.includes(item.Tags)
                ) {
                    data[key].Tags += `, ${item.Tags}`;
                }

                data[key].rows.push(item);

                return data;

            }, {})
        );

    }, [editSnagCheckListData, activeTab]);

    return (
        <div>
            <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

            <div className="pt-5 pb-5">
                <Tabs
                    tabs={SnagChecklistTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);
                    }}
                />
            </div>

            <div>
                {groupedSnagData?.map((item: any, index) => {

                    const savedRows = snagCheckListData.filter(
                        (data) =>
                            data.CategoryName === item.CategoryName &&
                            data.SubCategoryName === item.SubCategoryName &&
                            data.Title === item.Title
                    );

                    const checkedCount = savedRows.filter(
                        (row) => row.IsCheck === true
                    ).length;

                    const totalCount = savedRows.length;
                    const pendingCount = totalCount - checkedCount;

                    return (
                        <div key={index} className="gap-x-4 bg-[#EFF6FF] rounded-lg shadow-sm border border-gray-300 p-4 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-5 pb-4">
                                <FieldItem label="Sub Category" value={item.SubCategoryName} />
                                <FieldItem label="Checklist Title" value={item.Title} />
                                <FieldItem label="Tags" value={item.Tags} />
                                <FieldItem label="Pending" value={pendingCount} />
                            </div>

                            <DataTableEditable
                                columns={SnagChecklistcolumns}
                                data={item.rows}
                                className="rounded-2xl border border-gray-300 overflow-hidden"
                                tableClassName="border-separate border-spacing-0"
                                rowClassName="bg-white hover:bg-gray-50"
                                cellClassName="border-b border-gray-200"
                            />
                        </div>
                    )
                })}
            </div>

            {canAction && bookingApprovalStatus?.toUpperCase() === 'APPROVED' && (
                <div className="flex justify-end pt-2">
                    <Button onClick={handleAddUpdateSnagChecklist}>
                        Save
                    </Button>
                </div>
            )}
        </div>
    )
}

export default SnagChecklist