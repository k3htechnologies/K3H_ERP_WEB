import * as E from 'fp-ts/Either';
import { technicalService } from './services/TechnicalService';

export const fetchVillageDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await technicalService.apiCallPullVillage({
            PageSize: 500,
            PageNumber: pageNumber,
            VillageName: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: (d.VillageName),
            value: String(d.VillageMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH VILLAGE DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

