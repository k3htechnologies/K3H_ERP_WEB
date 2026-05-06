import { ChannelPartnerService } from '@/features/ChannelPartner/services/ChannelPartnerService';
import * as E from 'fp-ts/Either';

export const fetchChannelPartnerDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ChannelPartnerService.apiCallPullChannelPartner({
            PageSize: 10,
            PageNumber: pageNumber,
            IsCheckPermission:false,
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

export const fetchChannelPartnerCompanyDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ChannelPartnerService.apiCallPullChannelPartnerCompany({
            PageSize: 10,
            PageNumber: pageNumber,
            CompanyName: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: `${d.CompanyName}`,
            value: String(d.ChannelPartnerId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH CHANNEL PARTNER COMPANY MASTER DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

export const fetchChannelPartnerTeamMemberDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await ChannelPartnerService.apiCallPullChannelPartner({
            PageSize: 10,
            PageNumber: pageNumber,
            IsCheckPermission:false,
            CompanyName: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || []).map((d: any) => ({
            label: `${d.Name}`,
            value: String(d.ChannelPartnerId)
        }));


        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH CHANNEL PARTNER TEAM MEMBER MASTER DROPDOWN ERROR', err);
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

export const fetchChannelPartnerById = async (channelPartnerId: number, projectId: number) => {

    const responseEither = await ChannelPartnerService.apiCallPullChannelPartner({
        PageSize: 1,
        PageNumber: 1,
        IsCheckPermission: false,
        ChannelPartnerId: Number(channelPartnerId),
        ProjectId: Number(projectId)
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};

export const fetchChannelPartnerByCompanyName = async (CompanyName: string) => {

    const responseEither = await ChannelPartnerService.apiCallPullChannelPartner({
        PageSize: 1,
        PageNumber: 1,
        IsCheckPermission: false,
        CompanyName: CompanyName
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};