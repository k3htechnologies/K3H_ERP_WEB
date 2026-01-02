import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { EnquiryFollowUpApi } from "@/features/enquiry/api/EnquiryFollowUpApi";
import type {
    FilterWithPaginationEnquiryFollowUpRequest,
    AddUpdateEnquiryFollowUpRequest,
    DeleteEnquiryFollowUpRequest,
    EnquiryFollowUpListResponse,
    EnquiryFollowUpSaveResponse,
    EnquiryFollowUpDeleteResponse
} from '@/features/enquiry/models/EnquiryFollowUpModel'

export abstract class EnquiryFollowUpDatasource {

    abstract pullEnquiryFollowUp(params: FilterWithPaginationEnquiryFollowUpRequest, signal?: AbortSignal): Promise<EnquiryFollowUpListResponse>;
    abstract addUpadateEnquiryFollowUp(data: AddUpdateEnquiryFollowUpRequest): Promise<EnquiryFollowUpSaveResponse>;
    abstract deleteEnquiryFollowUp(params: DeleteEnquiryFollowUpRequest): Promise<EnquiryFollowUpDeleteResponse>;
}

export class EnquiryFollowUpDatasourceImpl implements EnquiryFollowUpDatasource {
    private get k3hHttpclient() {
        return baseClient
    }

    async pullEnquiryFollowUp(params: FilterWithPaginationEnquiryFollowUpRequest, signal?: AbortSignal): Promise<EnquiryFollowUpListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: String(params.PageSize),
                PageNumber: String(params.PageNumber),
            });

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.EnquiryFollowUpId) queryParams.append('EnquiryFollowUpId', params.EnquiryFollowUpId.toString());
            if (params.EnquiryId) queryParams.append('EnquiryId', params.EnquiryId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpclient.getRequestWithAuthentication(
                `${EnquiryFollowUpApi.PULL}?${queryParams.toString()}`, { signal }
            )

            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ENQUIRY :', error);

            if (error === TokenExpiredException) {
                await this.pullEnquiryFollowUp(params);
            }
            throw error
        }
    }
    async addUpadateEnquiryFollowUp(params: AddUpdateEnquiryFollowUpRequest): Promise<EnquiryFollowUpSaveResponse> {
        try {
            const response = await this.k3hHttpclient.postRequestWithAuthentication(
                EnquiryFollowUpApi.ADD_UPDATE,
                params
            )
            return response
        } catch (error) {
            console.log('ERROR:ADD UPDATE ENQUIRY FOLLOW UP:', error)

            if (error == TokenExpiredException) {
                await this.addUpadateEnquiryFollowUp(params);
            }
            throw error
        }
    }

    async deleteEnquiryFollowUp(params: DeleteEnquiryFollowUpRequest): Promise<EnquiryFollowUpDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EnquiryFollowUpId: (params.EnquiryFollowUpId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),
                EnquiryId: (params.EnquiryId ?? 0).toString(),

            })

            const response = await this.k3hHttpclient.deleteRequestWithAuthentication(
                `${EnquiryFollowUpApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE ENQUIRY FOLLOW UP :', error);

                await this.deleteEnquiryFollowUp(params);

            }

            throw error
        }
    }
}

