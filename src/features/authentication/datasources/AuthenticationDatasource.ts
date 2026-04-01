import type { ApiResponse } from '@/core/api/ApiResponse'
import baseClient from '@/core/config/baseClient'
import { AuthenticationApi } from '@/features/authentication/api/AuthenticationApi'
import type { AuthenticationResponse } from '@/features/authentication/models/AuthenticationModel'

export abstract class AuthenticationDatasource {

    abstract isValidMobileNumber(mobileNumber: string): Promise<ApiResponse<string>>;
    abstract isValidOTP(mobileNumber: string, otp: string, type: string): Promise<AuthenticationResponse>;
    abstract sendOTPMobileNumberAndModule(mobileNumber: string, moduleName: string): Promise<ApiResponse<string>>;
    abstract getEmployeeWithMenu(): Promise<AuthenticationResponse>;
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

    async isValidOTP(mobileNumber: string, otp: string, type: string): Promise<AuthenticationResponse> {
        try {
            const queryParams = new URLSearchParams({

                MobileNumber: mobileNumber.trim() ?? '',
                OTP: otp.trim() ?? '',
                Type: type.trim() ?? ''

            })

            return await this.k3hHttpClient.getRequestWithoutAuthentication(`${AuthenticationApi.ValidateOTP}?${queryParams.toString()}`);

        } catch (error) {

            throw error
        }
    }

    async sendOTPMobileNumberAndModule(mobileNumber: string, module: string): Promise<ApiResponse<string>> {

        try {

            const queryParams = new URLSearchParams({ MobileNumber: mobileNumber.trim() ?? '', Module: module.trim() ?? '' })

            const response = await this.k3hHttpClient.getRequestWithoutAuthentication(`${AuthenticationApi.SEND_OTP}?${queryParams.toString()}`);

            return response as ApiResponse<string>;

        } catch (error) {

            throw error
        }
    }

    async getEmployeeWithMenu(): Promise<AuthenticationResponse> {
        try {

            return await this.k3hHttpClient.getRequestWithAuthentication(`${AuthenticationApi.EMPLOYEE_WITH_MENU}`);

        } catch (error) {

            throw error
        }
    }

}
