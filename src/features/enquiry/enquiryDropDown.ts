import { EnquiryService } from '@/features/enquiry/services/EnquiryServices';
import * as E from 'fp-ts/Either';

export const fetchEnquiryBySystemGeneratedCode = async (systemGeneratedCode: string,projectId:number) => {

    const responseEither = await EnquiryService.apiCallPullEnquiry({
        PageSize: 1,
        PageNumber: 1,
        ProjectId:projectId,
        SystemGeneratedCode: systemGeneratedCode.trim()
    });

    if (E.isLeft(responseEither)) return null;

    return responseEither.right.Data?.[0] || null;

};
