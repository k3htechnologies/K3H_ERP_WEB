import * as E from 'fp-ts/Either';

import { baselineCostPlanDocumentCategoryMasterService } from './services/BaselineCostPlanDocumentCategoryMasterService';

export const fetchBaselineCostPlanDocumentCategoryDropdown = async (pageNumber: number,projectId:number, params?: { value?: string }) => {
    try {
        const responseEither = await baselineCostPlanDocumentCategoryMasterService.apiCallPullBaselineCostPlanDocumentCategoryMaster({
            PageSize: 500,
            PageNumber: pageNumber,
            BaselineCostPlanDocumentCategory: params?.value || "",
            IsCheckPermission: false,
            ProjectId:projectId
        });

        if (E.isLeft(responseEither)) {
            
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.BaselineCostPlanDocumentCategoryName,
            value: String(d.BaselineCostPlanDocumentCategoryId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH BASELINE COST PLAN DOCUMENT CATEGORY DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
