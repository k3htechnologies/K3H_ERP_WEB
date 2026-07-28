import * as E from 'fp-ts/Either';
import { assetMasterService } from './services/AssetMasterService';

export const fetchAssetMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await assetMasterService.apiCallPullAssetMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            AssetName: params?.value || "",
            Status: "Available",
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.AssetName,
            value: String(d.AssetMasterId),
            AssetCode: d.AssetCode,
            AssetName: d.AssetName,
            AssetType: d.AssetType,
            AssetModel: d.AssetModel,
            AssetBrand: d.AssetBrand,
            SerialNumber: d.SerialNumber,
            PurchaseDate: d.PurchaseDate,
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

export const fetchAssetById = async (assetId: number) => {

    const responseEither = await assetMasterService.apiCallPullAssetMaster({
        PageSize: 1,
        PageNumber: 1,
        AssetMasterId: assetId
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};

