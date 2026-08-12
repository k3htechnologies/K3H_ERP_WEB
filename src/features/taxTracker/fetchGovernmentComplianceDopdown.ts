import * as E from 'fp-ts/Either';
import { noticeSectionMasterService } from '@/features/noticeSectionMaster/services/NoticeSectionMasterService';

export const fetchNoticeSectionDropdown = async (pageNumber: number, governmentCompliance: string) => {
    if (!governmentCompliance) return { totalNumberOfRecord: 0, itemList: [] };

    try {
        const responseEither = await noticeSectionMasterService.apiCallPullNoticeSectionMaster({
            PageSize: 50,
            PageNumber: pageNumber,
            GovernmentCompliance: governmentCompliance
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string; noticeSectionMasterId: number }[] };
        }

        const apiResponse = responseEither.right;

        const itemList = (apiResponse?.Data || [])
            .filter((d: any) => d.GovernmentCompliance === governmentCompliance)
            .map((d: any) => ({
                label: d.NoticeSection,
                value: d.NoticeSection,
                noticeSectionMasterId: d.NoticeSectionMasterId
            }));

        return {
            totalNumberOfRecord: itemList.length,
            itemList
        };

    } catch (err) {
        console.error('FETCH NOTICE SECTION DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string; noticeSectionMasterId: number }[] };
    }
};