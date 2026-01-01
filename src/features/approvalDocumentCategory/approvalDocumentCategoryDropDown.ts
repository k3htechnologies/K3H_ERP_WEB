import * as E from 'fp-ts/Either';
import { approvalDocumentCategoryMasterService } from '@/features/approvalDocumentCategory/services/ApprovalDocumentCategoryMasterService';

export const fetchApprovalDocumentCategoryDropdown = async (pageNumber: number,projectId:number, params?: { value?: string }) => {
    try {
        const responseEither = await approvalDocumentCategoryMasterService.apiCallPullApprovalDocumentCategoryMaster({
            PageSize: 500,
            PageNumber: pageNumber,
            ApprovalDocumentCategory: params?.value || "",
            IsCheckPermission: false,
            ProjectId:projectId
        });

        if (E.isLeft(responseEither)) {
            
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ApprovalDocumentCategoryName,
            value: String(d.ApprovalDocumentCategoryId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH APPROVAL DOCUMENT CATEGORY DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

