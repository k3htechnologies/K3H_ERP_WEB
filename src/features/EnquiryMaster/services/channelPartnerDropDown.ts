import { ChannelPartnerMasterService } from '@/features/ChannelPartnerMaster/services/ChannelPartnerMasterService';
import * as E from 'fp-ts/Either';

export const fetchChannelPartnerMasterDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ChannelPartnerMasterService.apiCallPullChannelPartnerMaster({
            PageSize: 10,
            PageNumber: pageNumber,
            Name: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: d.Name,
            value: String(d.ChannelPartnerId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH CHANNEL MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};
