import baseClient from "@/core/config/baseClient";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";
import { EnquiryMasterApi } from "../api/EnquiryMasterApi";
import type {
    FilterWithPaginationEnquiryMasterRequest,
    AddUpdateEnquiryMasterRequest,
    DeleteEnquiryMasterRequest,
    EnquiryMasterListResponse,
    EnquiryMasterSaveResponse,
    EnquiryMasterDeleteResponse
} from '@/features/EnquiryMaster/models/EnquiryMasterModel'

export abstract class EnquiryMasterDatasource {

    abstract pullEnquiryMaster(params: FilterWithPaginationEnquiryMasterRequest, signal?: AbortSignal): Promise<EnquiryMasterListResponse>;
    abstract addUpadateEnquiryMaster(data: AddUpdateEnquiryMasterRequest): Promise<EnquiryMasterSaveResponse>;
    abstract deleteEnquiryMaster(params: DeleteEnquiryMasterRequest): Promise<EnquiryMasterDeleteResponse>;
}

export class EnquiryMasterDatasourceImpl implements EnquiryMasterDatasource {
    private get k3hHttpclient() {
        return baseClient
    }

    async pullEnquiryMaster(params: FilterWithPaginationEnquiryMasterRequest, signal?: AbortSignal): Promise<EnquiryMasterListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: String(params.PageSize),
                PageNumber: String(params.PageNumber),
            });

            if (params.ProjectId !== undefined) queryParams.append('ProjectId', String(params.ProjectId));
            if (params.Budget) queryParams.append('Budget', params.Budget);
            if (params.RequirementType) queryParams.append('RequirementType', params.RequirementType);
            if (params.Source) queryParams.append('Source', params.Source);
            if (params.FromDate) queryParams.append('FromDate', params.FromDate);
            if (params.ToDate) queryParams.append('ToDate', params.ToDate);
            if (params.MobileNumber) queryParams.append('MobileNumber', params.MobileNumber);
            if (params.Name) queryParams.append('Name', params.Name);
            if (params.Accommodation) queryParams.append('Accommodation', params.Accommodation);
            if (params.EmployeeId !== undefined) queryParams.append('EmployeeId', String(params.EmployeeId));
            if (params.Stage) queryParams.append('Stage', params.Stage);
            if (params.TimeDimension) queryParams.append('TimeDimension', params.TimeDimension);
            if (params.EnquiryFollowUpDays) queryParams.append('EnquiryFollowUpDays', params.EnquiryFollowUpDays);
            if (params.FinalStage) queryParams.append('FinalStage', params.FinalStage);
            if (params.SortBy) queryParams.append('SortBy', params.SortBy);
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);

            const response = await this.k3hHttpclient.getRequestWithAuthentication(
                `${EnquiryMasterApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {
            console.error('ERROR: PULL ENQUIRY MASTER :', error);

            if (error === TokenExpiredException) {
                await this.pullEnquiryMaster(params);
            }
            throw error
        }
    }
    async addUpadateEnquiryMaster(params: AddUpdateEnquiryMasterRequest): Promise<EnquiryMasterSaveResponse> {
        try {
            const payLoad: AddUpdateEnquiryMasterRequest = {
                EnquiryId: params.EnquiryId ?? 0,
                Uniquekey: params.Uniquekey ?? '',
                ProjectId: params.ProjectId,
                Name: params.Name,
                EmailId: params.EmailId,
                MobileNumber: params.MobileNumber,
                OccupationType: params.OccupationType ?? null,
                Accommodation: params.Accommodation ?? null,
                Budget: params.Budget ?? null,
                IsHomeLoan: params.IsHomeLoan,
                Requirement: params.Requirement ?? null,
                RequirementType: params.RequirementType ?? null,
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

                EnquiryMasterApi.ADD_UPDATE,
                payLoad
            )
            return response
        } catch (error) {
            console.log('ERROR:ADD UPDATE ENQUIRY MASTER:', error)

            if (error == TokenExpiredException) {
                await this.addUpadateEnquiryMaster(params);
            }
            throw error
        }
    }

    async deleteEnquiryMaster(params: DeleteEnquiryMasterRequest): Promise<EnquiryMasterDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                EnquiryId: (params.EnquiryId ?? 0).toString(),
                UniqueKey: params.Uniquekey ?? '',
                ProjectId: (params.ProjectId ?? 0).toString(),

            })

            const response = await this.k3hHttpclient.deleteRequestWithAuthentication(
                `${EnquiryMasterApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {
            if (error === TokenExpiredException) {

                console.error('ERROR: DELETE ENQUIRY MASTER :', error);

                await this.deleteEnquiryMaster(params);

            }

            throw error
        }
    }
}

