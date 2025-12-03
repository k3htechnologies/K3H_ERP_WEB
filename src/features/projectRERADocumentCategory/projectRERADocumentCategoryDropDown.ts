import * as E from 'fp-ts/Either';
import { projectRERADocumentCategoryMasterService } from '@/features/projectRERADocumentCategory/services/ProjectRERADocumentCategoryMasterService';

export const fetchProjectRERADocumentCategoryDropdown = async (pageNumber: number,projectId:number, params?: { value?: string }) => {
    try {
        const responseEither = await projectRERADocumentCategoryMasterService.apiCallPullProjectRERADocumentCategoryMaster({
            PageSize: 500,
            PageNumber: pageNumber,
            ProjectRERADocumentCategory: params?.value || "",
            IsCheckPermission: false,
            ProjectId:projectId
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ProjectRERADocumentCategoryName,
            value: String(d.ProjectRERADocumentCategoryId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PROJECT RERA DOCUMENT CATEGORY DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
