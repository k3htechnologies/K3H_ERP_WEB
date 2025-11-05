import type { ApiResponse } from '../../../core/api/ApiResponse'
import baseClient from '../../../core/config/baseClient'
import { AuthenticationApi } from '../api/AuthenticationApi'
import type { AuthenticationResponse } from '../models/AuthenticationModel'

export abstract class AuthenticationDatasource {

    abstract isValidMobileNumber(mobileNumber: string): Promise<ApiResponse<string>>;
    abstract isValidOTP(mobileNumber: string, otp: string): Promise<AuthenticationResponse>;
}

export class AuthenticationDatasourceImpl implements AuthenticationDatasource {
    private get k3hHttpClient() {
        return baseClient
    }

    async isValidMobileNumber(mobileNumber: string): Promise<ApiResponse<string>> {
        try {

            const queryParams = new URLSearchParams({ MobileNumber: mobileNumber.trim() ?? '' })

            const response = await this.k3hHttpClient.getRequestWithoutAuthentication(
                `${AuthenticationApi.ValidateMobileNumber}?${queryParams.toString()}`
            );

            return response as ApiResponse<string>;

        } catch (error) {

            throw error
        }
    }

    async isValidOTP(mobileNumber: string, otp: string): Promise<AuthenticationResponse> {
        try {
            const queryParams = new URLSearchParams({
                MobileNumber: mobileNumber.trim() ?? '',
                OTP: otp.trim() ?? ''
            })

            const response = await this.k3hHttpClient.getRequestWithoutAuthentication(
                `${AuthenticationApi.ValidateOTP}?${queryParams.toString()}`
            );

            return response;
        } catch (error) {

            throw error
        }
    }

}
