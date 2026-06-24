import * as E from 'fp-ts/Either';
import { noticeSectionMasterService } from '@/features/noticeSectionMaster/services/NoticeSectionMasterService';

// 1. Fetching Unique Government Compliances
export const fetchGovernmentComplianceDropdown = async (pageNumber: number, params?: { value?: string }) => {
    try {
        const responseEither = await noticeSectionMasterService.apiCallPullNoticeSectionMaster({
            PageSize: 20,
            PageNumber: pageNumber,
            GovernmentCompliance: params?.value || ""
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
        }

        const apiResponse = responseEither.right;

        const uniqueGovernmentCompliance = Array.from(
            new Map(
                (apiResponse?.Data || []).map((d: any) => [
                    d.GovernmentCompliance,
                    {
                        label: d.GovernmentCompliance,
                        value: d.GovernmentCompliance,
                    },
                ])
            ).values()
        );

        return {
            totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? uniqueGovernmentCompliance.length,
            itemList: uniqueGovernmentCompliance
        };

    } catch (err) {
        console.error('FETCH GOVERNMENT COMPLIANCE DROPDOWN ERROR', err);
        return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string }[] };
    }
};

// 2. Fetching Notice Sections filtered by selected Government Compliance
export const fetchNoticeSectionDropdown = async (pageNumber: number, governmentCompliance: string) => {
    if (!governmentCompliance) return { totalNumberOfRecord: 0, itemList: [] };

    try {
        const responseEither = await noticeSectionMasterService.apiCallPullNoticeSectionMaster({
            PageSize: 50, // Higher page size to bring options matching the filter
            PageNumber: pageNumber,
            GovernmentCompliance: governmentCompliance // Filters master list by selection (e.g. "Income Tax")
        });

        if (E.isLeft(responseEither)) {
            return { totalNumberOfRecord: 0, itemList: [] as { label: string; value: string; noticeSectionMasterId: number }[] };
        }

        const apiResponse = responseEither.right;

        // Map matching rows into section options
        const itemList = (apiResponse?.Data || [])
            .filter((d: any) => d.GovernmentCompliance === governmentCompliance)
            .map((d: any) => ({
                label: d.NoticeSection,
                value: d.NoticeSection, // Dropdown text matching value
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