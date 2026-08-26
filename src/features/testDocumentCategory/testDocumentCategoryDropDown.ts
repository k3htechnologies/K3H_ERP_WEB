import * as E from 'fp-ts/Either';
import { testDocumentCategoryMasterService } from '@/features/testDocumentCategory/services/TestDocumentCategoryMasterService';

export const fetchTestDocumentCategoryDropdown = async (pageNumber: number,projectId:number, params?: { value?: string }) => {
    try {
        const responseEither = await testDocumentCategoryMasterService.apiCallPullTestDocumentCategoryMaster({
            PageSize: 500,
            PageNumber: pageNumber,
            TestDocumentCategory: params?.value || "",
            IsCheckPermission: false,
            ProjectId:projectId
        });

        if (E.isLeft(responseEither)) {
            
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.TestDocumentCategoryName,
            value: String(d.TestDocumentCategoryId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH TEST DOCUMENT CATEGORY DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
