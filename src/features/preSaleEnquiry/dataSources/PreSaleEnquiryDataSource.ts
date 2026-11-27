import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { PreSaleEnquiryApi } from "@/features/preSaleEnquiry/api/PreSaleEnquiryApi";
import type { AddUpdatePreSaleEnquiryRequest, DeletePreSaleEnquiryRequest, FilterWithPaginationPreSaleEnquiryRequest, PreSaleEnquiryDeleteResponse, PreSaleEnquiryListResponse, PreSaleEnquirySaveResponse } from "@/features/preSaleEnquiry/models/PreSaleEnquiryModel";

export abstract class PreSaleEnquiryDataSource {
    abstract pullPreSaleEnquiry(params: FilterWithPaginationPreSaleEnquiryRequest, signal?: AbortSignal): Promise<PreSaleEnquiryListResponse>;
    abstract addUpdatePreSaleEnquiry(data: AddUpdatePreSaleEnquiryRequest): Promise<PreSaleEnquirySaveResponse>;
    abstract deletePreSaleEnquiry(params: DeletePreSaleEnquiryRequest): Promise<PreSaleEnquiryDeleteResponse>;
}

export class PreSaleEnquiryDataSourceImpl implements PreSaleEnquiryDataSource {
    private get k3hHttpClient() {
        return baseClient;
    }

    async pullPreSaleEnquiry(params: FilterWithPaginationPreSaleEnquiryRequest, signal?: AbortSignal): Promise<PreSaleEnquiryListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: String(params.PageSize ?? 10),
                PageNumber: String(params.PageNumber ?? 1),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString(),
            })

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString());
            if (params.PreSaleEnquiryId) queryParams.append('PreSaleEnquiryId', params.PreSaleEnquiryId.toString());
            if (params.Name?.trim()) queryParams.append('Name', params.Name.trim());
            if (params.ProjectName?.trim()) queryParams.append('ProjectName', params.ProjectName.trim());
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
            if (params.FinalStage?.trim()) queryParams.append('FinalStage', params.FinalStage.trim());
            if (params.NotCheckFinalStage?.trim()) queryParams.append('NotCheckFinalStage', params.NotCheckFinalStage.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${PreSaleEnquiryApi.PULL}?${queryParams}`, { signal }
            )

            return response
        } catch (error: any) {

            console.error("ERROR: PULL PRE SALE ENQUIRY :", error);

            if (error instanceof TokenExpiredException) {

                return await this.pullPreSaleEnquiry(params)
            }
            throw error
        }
    }

    async addUpdatePreSaleEnquiry(data: AddUpdatePreSaleEnquiryRequest): Promise<PreSaleEnquirySaveResponse> {
        try {
            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                PreSaleEnquiryApi.ADD_UPDATE,
                data
            )

            return response

        } catch (errro: any) {

            console.error("ERROR: ADD UPATE PRE SALE ENQUIRY:", errro);

            if (errro instanceof TokenExpiredException) {

                return await this.addUpdatePreSaleEnquiry(data);
            }

            throw errro
        }
    }

    async deletePreSaleEnquiry(params: DeletePreSaleEnquiryRequest): Promise<PreSaleEnquiryDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                PreSaleEnquiryId: (params.PreSaleEnquiryId ?? 0).toString(),
                ProjectId: (params.ProjectId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? ""
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${PreSaleEnquiryApi.DELETE}?${queryParams}`,
            )

            return response

        } catch (error: any) {

            console.error("ERROR: DELETE PRE SALE ENQUIRY :", error);

            if (error instanceof TokenExpiredException) {

                return await this.deletePreSaleEnquiry(params);
            }
            throw error
        }
    }
}