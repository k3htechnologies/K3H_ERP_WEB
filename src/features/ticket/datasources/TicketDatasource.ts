import baseClient from "@/core/config/baseClient";
import type { DeleteTicketModelRequest, FilterWithPaginationPullActiveTicket, FilterWithPaginationTicket, TicketAssignSaveResponse, TicketDeleteResponse, TicketListResponse, TicketPullActiveTicketListResponse, TicketSaveResponse } from "@/features/ticket/models/TicketModel";
import { TicketApi } from "@/features/ticket/api/TicketApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class TicketDatasource {
    abstract pullTicket(params: FilterWithPaginationTicket, signal?: AbortSignal): Promise<TicketListResponse>;
    abstract pullAssignedActiveTickets(params: FilterWithPaginationPullActiveTicket, signal?: AbortSignal): Promise<TicketPullActiveTicketListResponse>;
    abstract addUpdateTicket(formData: FormData): Promise<TicketSaveResponse>;
    abstract addUpdateAssignedTickets(formData: FormData): Promise<TicketAssignSaveResponse>;
    abstract deleteTicket(params: DeleteTicketModelRequest): Promise<TicketDeleteResponse>;
}

export class TicketDatasourceImpl implements TicketDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async pullTicket(params: FilterWithPaginationTicket, signal?: AbortSignal): Promise<TicketListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })
            if (params.SystemGeneratedCode?.trim()) queryParams.append('SystemGeneratedCode', params.SystemGeneratedCode.trim());
            if (params.Platform?.trim()) queryParams.append('Platform', params.Platform.trim());
            if (params.Module?.trim()) queryParams.append('Module', params.Module.trim());
            if (params.Priority?.trim()) queryParams.append('Priority', params.Priority.trim());
            if (params.DepartmentName?.trim()) queryParams.append('DepartmentName', params.DepartmentName.trim());
            if (params.TicketStatus?.trim()) queryParams.append('TicketStatus', params.TicketStatus.trim());
            if (params.TicketId) queryParams.append('TicketId', params.TicketId.toString());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());
            if (params.ExportType) queryParams.append('ExportType', params.ExportType);


            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TicketApi.PULL}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL TICKET DATA :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullTicket(params);
            }

            throw error
        }
    }

    async pullAssignedActiveTickets(params: FilterWithPaginationPullActiveTicket, signal?: AbortSignal): Promise<TicketPullActiveTicketListResponse> {
        try {
            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
            })
            if (params.EmployeeId) queryParams.append('EmployeeId', params.EmployeeId.toString());
            if (params.EmployeeName?.trim()) queryParams.append('EmployeeName', params.EmployeeName.trim());
            if (params.SortBy?.trim()) queryParams.append('SortBy', params.SortBy.trim());

            const response = await this.k3hHttpClient.getRequestWithAuthentication(
                `${TicketApi.PULL_ACTIVE_TICKETS}?${queryParams.toString()}`, { signal }
            )
            return response;
        } catch (error: any) {

            console.error('ERROR: PULL ASSIGNED TICKETS DATA :', error);

            if (error instanceof TokenExpiredException) {

                return await this.pullAssignedActiveTickets(params);
            }

            throw error
        }
    }

    async addUpdateTicket(formData: FormData): Promise<TicketSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TicketApi.ADD_UPDATE,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE TICKET :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTicket(formData);
            }
            throw error
        }
    }

    async addUpdateAssignedTickets(formData: FormData): Promise<TicketAssignSaveResponse> {
        try {

            const response = await this.k3hHttpClient.multipartRequestWithAuthentication(
                TicketApi.ASSIGN_TICKETS,
                formData
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE ASSIGNED TICKET :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateAssignedTickets(formData);
            }
            throw error
        }
    }

    async deleteTicket(params: DeleteTicketModelRequest): Promise<TicketDeleteResponse> {
        try {
            const queryParams = new URLSearchParams({
                TicketId: (params.TicketId ?? 0).toString(),
                Uniquekey: params.Uniquekey ?? '',
            })

            const response = await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${TicketApi.DELETE}?${queryParams.toString()}`
            )

            return response

        } catch (error) {

            console.error('ERROR: DELETE TICKET ', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteTicket(params);

            }

            throw error
        }
    }

}