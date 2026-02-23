import * as E from 'fp-ts/Either';
import { tncMasterService } from '@/features/tnc/services/TncMasterService';

export const fetchTncMasterDropdown = async (pageNumber: number, params?: { value?: string; moduleName?: string }) => {
    try {
        const responseEither = await tncMasterService.apiCallPullTncMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            ModuleName: params?.moduleName || "",
            Title: params?.value || "",
            IsCheckPermission: false,
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.Title,
            value: String(d.Description)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH TNC DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};


