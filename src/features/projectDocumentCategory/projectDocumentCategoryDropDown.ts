import * as E from 'fp-ts/Either';
import { projectDocumentCategoryMasterService } from '@/features/projectDocumentCategory/services/ProjectDocumentCategoryMasterService';

export const fetchProjectDocumentCategoryDropdown = async (pageNumber: number,projectId:number, params?: { value?: string }) => {
    try {
        const responseEither = await projectDocumentCategoryMasterService.apiCallPullProjectDocumentCategoryMaster({
            PageSize: 500,
            PageNumber: pageNumber,
            ProjectDocumentCategory: params?.value || "",
            IsCheckPermission: false,
            ProjectId:projectId
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.ProjectDocumentCategoryName,
            value: String(d.ProjectDocumentCategoryId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH PROJECT DOCUMENT CATEGORY DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
