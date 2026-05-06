import baseClient from "@/core/config/baseClient";
import type { AddUpdateRefundAmountData, AddUpdateRefundAmountResponse } from "@/features/crmPayTrack/models/InitialRefundAmountModel";
import { InitialRefundAmountApi } from "@/features/crmPayTrack/api/InitialRefundAmountApi";
import { TokenExpiredException } from "@/core/config/baseClientexceptions";

export abstract class InitialRefundAmountDatasource {
    abstract addUpdateRefundAmount(data: AddUpdateRefundAmountData): Promise<AddUpdateRefundAmountResponse>;
}

export class InitialRefundAmountDatasourceImpl implements InitialRefundAmountDatasource {

    private get k3hHttpClient() {
        return baseClient;
    }

    async addUpdateRefundAmount(params: AddUpdateRefundAmountData): Promise<AddUpdateRefundAmountResponse> {
        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                InitialRefundAmountApi.ADD_UPDATE,
                params
            )

            return response
        } catch (error) {

            console.error('ERROR: ADD UPDATE REFUND AMOUNT :', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateRefundAmount(params);
            }
            throw error
        }
    }

} 