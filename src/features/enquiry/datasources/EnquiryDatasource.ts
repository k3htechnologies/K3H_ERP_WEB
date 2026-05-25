import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { EnquiryApi } from "../api/EnquiryApi";
import type {
    FilterWithPaginationEnquiryRequest,
    AddUpdateEnquiryRequest,
    DeleteEnquiryRequest,
    EnquiryListResponse,
    EnquirySaveResponse,
    EnquiryDeleteResponse
} from '@/features/enquiry/models/EnquiryModel'

export abstract class EnquiryDatasource {

    abstract pullEnquiry(params: FilterWithPaginationEnquiryRequest, signal?: AbortSignal): Promise<EnquiryListResponse>;
    abstract addUpadateEnquiry(data: AddUpdateEnquiryRequest): Promise<EnquirySaveResponse>;
    abstract deleteEnquiry(params: DeleteEnquiryRequest): Promise<EnquiryDeleteResponse>;
}

export class EnquiryDatasourceImpl implements EnquiryDatasource {
    private get k3hHttpclient() {
        return baseClient
    }

    async pullEnquiry(params: FilterWithPaginationEnquiryRequest, signal?: AbortSignal): Promise<EnquiryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: String(params.PageSize),
                PageNumber: String(params.PageNumber),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            });

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());

            if (params.EnquiryId) queryParams.append('EnquiryId', params.EnquiryId.toString());
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.Name?.trim()) queryParams.append('Name', params.Name.trim());
            if (params.MobileNumberCountryCode) queryParams.append('MobileNumberCountryCode', params.MobileNumberCountryCode);
            if (params.MobileNumber) queryParams.append('MobileNumber', params.MobileNumber);
            if (params.Budget?.trim()) queryParams.append('Budget', params.Budget.trim());
            if (params.RequirementType) queryParams.append('RequirementType', params.RequirementType);
            if (params.Source) queryParams.append('Source', params.Source);
            if (params.SubSource) queryParams.append('SubSource', params.SubSource);
            if (params.SubSubSource) queryParams.append('SubSubSource', params.SubSubSource);
            if (params.ChannelPartnerMobileNumber?.trim()) queryParams.append('ChannelPartnerMobileNumber', params.ChannelPartnerMobileNumber.trim());

            if (params.Nationality?.trim()) queryParams.append('Nationality', params.Nationality.trim());
            if (params.CurrentLocation?.trim()) queryParams.append('CurrentLocation', params.CurrentLocation.trim());
            if (params.CustomerClassification?.trim()) queryParams.append('CustomerClassification', params.CustomerClassification.trim());
            if (params.Ethnicity?.trim()) queryParams.append('Ethnicity', params.Ethnicity.trim());

            if (params.SalesAdvisor?.trim()) queryParams.append('SalesAdvisor', params.SalesAdvisor.trim());
            if (params.SourcingManager?.trim()) queryParams.append('SourcingManager', params.SourcingManager.trim());

            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);

            if (params.Accommodation?.trim()) queryParams.append('Accommodation', params.Accommodation.trim());

            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.Stage) queryParams.append('Stage', params.Stage);
            if (params.TimeDimension) queryParams.append('TimeDimension', params.TimeDimension);
            if (params.EnquiryFollowUpDays) queryParams.append('EnquiryFollowUpDays', params.EnquiryFollowUpDays);
            if (params.FinalStage?.trim()) queryParams.append('FinalStage', params.FinalStage.trim());
            if (params.NotCheckFinalStage?.trim()) queryParams.append('NotCheckFinalStage', params.NotCheckFinalStage.trim());

            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpclient.getRequestWithAuthentication(
                `${EnquiryApi.PULL}?${queryParams.toString()}`, { signal }
            )

            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ENQUIRY :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullEnquiry(params);
            }
            throw error
        }
    }
    async addUpadateEnquiry(params: AddUpdateEnquiryRequest): Promise<EnquirySaveResponse> {
        try {
            const response = await this.k3hHttpclient.postRequestWithAuthentication(
                EnquiryApi.ADD_UPDATE,
                params
            )
            return response
        } catch (error) {
            console.error('ERROR:ADD UPDATE ENQUIRY:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpadateEnquiry(params);
            }
            throw error
        }
    }

    async deleteEnquiry(params: DeleteEnquiryRequest): Promise<EnquiryDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EnquiryId: (params.EnquiryId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),

            })

            const response = await this.k3hHttpclient.deleteRequestWithAuthentication(
                `${EnquiryApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE ENQUIRY :', error);
            
            if (error instanceof TokenExpiredException) {

                return await this.deleteEnquiry(params);

            }

            throw error
        }
    }
}

