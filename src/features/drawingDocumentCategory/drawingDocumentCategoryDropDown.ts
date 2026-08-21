import * as E from 'fp-ts/Either';
import { drawingDocumentCategoryMasterService } from '@/features/drawingDocumentCategory/services/DrawingDocumentCategoryMasterService';

export const fetchDrawingDocumentCategoryDropdown = async (pageNumber: number,projectId:number, params?: { value?: string }) => {
    try {
        const responseEither = await drawingDocumentCategoryMasterService.apiCallPullDrawingDocumentCategoryMaster({
            PageSize: 500,
            PageNumber: pageNumber,
            DrawingDocumentCategory: params?.value || "",
            IsCheckPermission: false,
            ProjectId:projectId
        });

        if (E.isLeft(responseEither)) {
            
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.DrawingDocumentCategoryName,
            value: String(d.DrawingDocumentCategoryId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH DRAWING DOCUMENT CATEGORY DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
