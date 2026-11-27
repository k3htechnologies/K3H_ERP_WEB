import { useEffect, useState } from "react";
import type { FilterWithPaginationModuleApprovalReport, ModuleApprovalReportData } from "../models/ModuleApprovalReportModel";
import { runApiWithLoader } from "@/core/utils";
import usePagination from "@/core/hooks/usePagination";
import type { FilterInfo } from "@/ui/components/DataTable/DataTable";
import { moduleApprovalReportService } from "../services/ModuleApprovalReportService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";

export const ModuleApprovalReport: React.FC = () => {

    const [moduleApprovalReportList, setModuleApprovalReportList] = useState<ModuleApprovalReportData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { pagination, setPagination } = usePagination();
    const { addToast } = useToast();

    useEffect(() => {
        loadModuleApprovalReport(1, {})
    }, []);

    const loadModuleApprovalReport = async (page: number = pagination.currentPage, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationModuleApprovalReport = {
                    PageSize: page,
                    PageNumber: pagination.pageSize,
                    ModuleApprovalReportId: filterParams.ModuleApprovalReportId ? Number(filterParams.ModuleApprovalReportId) : undefined,
                }

                const response = await moduleApprovalReportService.apiCallModuleApprovalReport(params);

                if (E.isRight(response)) {

                    setModuleApprovalReportList(response.right.Data);

                    setPagination({
                        currentPage: page,
                        totalPages: response.right.TotalNumberOfRecord,
                        totalRecords: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
                    });

                } else {
                    addToast({ type: 'error', title: response.left.message });
                    return response;
                }
            },
            undefined,
            (error: any) => addToast({ type: 'error', title: error.message }),
            undefined,
            "Loading Module Approval Report"
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            Approval
        </div>
    )
}
export default ModuleApprovalReport;
