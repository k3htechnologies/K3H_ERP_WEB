import * as E from 'fp-ts/Either';
import { assetMasterService } from './services/AssetMasterService';

export const fetchAssetMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await assetMasterService.apiCallPullAssetMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            AssetName: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.AssetName,
            value: String(d.AssetMasterId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH ASSET MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
