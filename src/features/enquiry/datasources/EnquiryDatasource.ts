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
            });

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.Budget?.trim()) queryParams.append('Budget', params.Budget.trim());
            if (params.RequirementType) queryParams.append('RequirementType', params.RequirementType);
            if (params.Source) queryParams.append('Source', params.Source);
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.MobileNumber) queryParams.append('MobileNumber', params.MobileNumber);
            if (params.Name?.trim()) queryParams.append('Name', params.Name.trim());
            if (params.Accommodation?.trim()) queryParams.append('Accommodation', params.Accommodation.trim());
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.Stage) queryParams.append('Stage', params.Stage);
            if (params.TimeDimension) queryParams.append('TimeDimension', params.TimeDimension);
            if (params.EnquiryFollowUpDays) queryParams.append('EnquiryFollowUpDays', params.EnquiryFollowUpDays);
            if (params.FinalStage?.trim()) queryParams.append('FinalStage', params.FinalStage.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpclient.getRequestWithAuthentication(
                `${EnquiryApi.PULL}?${queryParams.toString()}`, { signal }
            )

            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ENQUIRY :', error);


            if (error === TokenExpiredException) {
                await this.pullEnquiry(params);
            }
            throw error
        }
    }
    async addUpadateEnquiry(params: AddUpdateEnquiryRequest): Promise<EnquirySaveResponse> {
        try {
            const payLoad: AddUpdateEnquiryRequest = {
                EnquiryId: params.EnquiryId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: params.ProjectId ?? 0,
                EmployeeId: params.EmployeeId ?? 0,
                Name: params.Name,
                EmailId: params.EmailId,
                MobileNumber: params.MobileNumber,
                OccupationType: params.OccupationType ?? null,
                Accommodation: params.Accommodation ?? null,
                Budget: params.Budget ?? null,
                ChannelPartnerId: params.ChannelPartnerId ?? 0,
                ProjectName: params.ProjectName ?? '',
                SalesAdvisorId: params.SalesAdvisorId ?? 0,
                SourcingManagerId: params.SourcingManagerId ?? 0,
                PresalesExecutiveId: params.PresalesExecutiveId ?? 0,
                Nationality: params.Nationality ?? '',
                DesiredFloorBand: params.DesiredFloorBand ?? '',
                NeighborhoodPlacesInterestedIn: params.NeighborhoodPlacesInterestedIn ?? '',
                CustomerClassification: params.CustomerClassification ?? '',
                SourceOfFunding: params.SourceOfFunding ?? '',
                Ethnicity: params.Ethnicity ?? '',
                EnquiryTimeIn: params.EnquiryTimeIn ?? '',
                EnquiryTimeOut: params.EnquiryTimeOut ?? '',
                IsHomeLoan: params.IsHomeLoan,
                Age: params.Age ?? '',
                ChannelPartnerName: params.ChannelPartnerName ?? '',
                ChannelPartnerMobileNumber: params.ChannelPartnerMobileNumber,
                Requirement: params.Requirement ?? '',
                RequirementType: params.RequirementType ?? '',
                AreaPreferred: params.AreaPreferred ?? 0,
                PossessionType: params.PossessionType ?? null,
                Source: params.Source ?? null,
                SubSource: params.SubSource ?? null,
                FinalStage: params.FinalStage ?? null,
                FinalStageDetail: params.FinalStageDetail ?? null,
                NextFollowUpDate: params.NextFollowUpDate ?? null,
                EnquiryDate: params.EnquiryDate ?? null,
                Remark: params.Remark?.trim() ?? ''
            }
            
            const response = await this.k3hHttpclient.postRequestWithAuthentication(
                EnquiryApi.ADD_UPDATE,
                payLoad
            )
            return response
        } catch (error) {
            console.log('ERROR:ADD UPDATE ENQUIRY:', error)

            if (error == TokenExpiredException) {
                await this.addUpadateEnquiry(params);
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
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE ENQUIRY :', error);

                await this.deleteEnquiry(params);

            }

            throw error
        }
    }
}

