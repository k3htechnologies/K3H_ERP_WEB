import { ChannelPartnerService } from '@/features/ChannelPartner/services/ChannelPartnerService';
import * as E from 'fp-ts/Either';

export const fetchChannelPartnerDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ChannelPartnerService.apiCallPullChannelPartner({
            PageSize: 10,
            PageNumber: pageNumber,
            ChannelPartnerName: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: `${d.Name} - ${d.MobileNumber}`,
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

export const fetchChannelPartnerByMobileNumber = async (mobileNumber: string) => {

    const responseEither = await ChannelPartnerService.apiCallPullChannelPartner({
        PageSize: 1,
        PageNumber: 1,
        IsCheckPermission: false,
        MobileNumber: mobileNumber.trim()
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};