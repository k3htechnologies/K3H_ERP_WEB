import type { FilterRefreshTokenRequest } from '@/features/technical/models/TechnicalModel'
import { config, getApiUrl } from '../config/environment'
import { LocalStorageHelper } from '../utils/localStorageHelper'
import {
    BadRequestException,
    ApiNotRespondingException,
    UnauthorizedException,
    TokenExpiredException,
    MenuChangedException,
    UserDeletedException
} from './baseClientexceptions'
import { technicalService } from '@/features/technical/services/TechnicalService'
import * as E from 'fp-ts/Either';

export class BaseClient {
    private apiKey: string
    private token: string | null
    private userUniqueKey: string | null

    constructor({
        apiKey,
        token = null,
    }: {
        baseUrl?: string
        apiKey?: string
        token?: string | null
        userUniqueKey?: string | null
    } = {}) {

        this.apiKey = apiKey || config.apiKey

        this.token = token || LocalStorageHelper.getStoredTokenData();

        this.userUniqueKey = LocalStorageHelper.getStoredEmployeeData()?.UniqueKey ?? "";
    }

    //============================ [ GET REQUEST WITHOUT AUTHENTICATION ] ========================================================

    async getRequestWithoutAuthentication(url: string): Promise<any> {
        try {
            const response = await fetch(getApiUrl(url), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ApiKey': this.apiKey,
                },
            })

            return this.processResponse(response);

        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ POST REQUEST WITHOUT AUTHENTICATION ] ========================================================

    async postRequestWithoutAuthentication(url: string, payload: any): Promise<any> {
        try {
            const response = await fetch(getApiUrl(url), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ApiKey': this.apiKey,
                },
                body: JSON.stringify(payload),
            })

            return this.processResponse(response)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ GET REQUEST WITH AUTHENTICATION ] ========================================================

    async getRequestWithAuthentication(url: string): Promise<any> {
        try {
            const response = await fetch(getApiUrl(url), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ApiKey': this.apiKey,
                    // 'Authorization': `Bearer ${this.token}`,
                    'Authorization': `Bearer ${this.token}`,
                },
            })

            return this.processResponse(response)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ POST REQUEST WITH AUTHENTICATION ] ========================================================

    async postRequestWithAuthentication(url: string, payload: any): Promise<any> {
        try {
            const response = await fetch(getApiUrl(url), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ApiKey': this.apiKey,
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify(payload),
            })

            return this.processResponse(response)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ DELETE REQUEST WITH AUTHENTICATION ] ========================================================

    async deleteRequestWithAuthentication(url: string): Promise<any> {
        try {
            const response = await fetch(getApiUrl(url), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ApiKey': this.apiKey,
                    'Authorization': `Bearer ${this.token}`,
                },
            })

            return this.processResponse(response)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ MULTIPART REQUEST WITH AUTHENTICATION ] ========================================================

    async multipartRequestWithAuthentication(
        url: string,
        fileList: Array<{ key: string; value: string }>,
        payload: Record<string, string>
    ): Promise<any> {
        try {
            const formData = new FormData()

            // Add files to FormData
            for (const item of fileList) {
                // Note: In a real implementation, you'd need to handle file selection differently
                // This is a simplified version for the structure
                // File item processed (removed console.log for production)
            }

            // Add payload fields
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value)
            })

            const response = await fetch(getApiUrl(url), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'apiKey': this.apiKey,
                    'Authorization': `Bearer ${this.token}`,
                },
                body: formData,
            })

            return this.processResponse(response)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ MULTIPART REQUEST WITH AUTHENTICATION (BYTES) ] ========================================================

    async multipartRequestWithAuthenticationBytes(
        url: string,
        fileList: Array<{ key: string; value: Uint8Array; fileName: string }>,
        payload: Record<string, string>
    ): Promise<any> {
        try {
            const formData = new FormData()

            // Add files to FormData
            for (const item of fileList) {
                const fileName = item.fileName
                const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

                // Determine MIME type based on file extension
                let mimeType: string
                let mimeSubtype: string

                switch (fileExtension) {
                    case 'pdf':
                        mimeType = 'application'
                        mimeSubtype = 'pdf'
                        break
                    case 'png':
                    case 'jpg':
                    case 'jpeg':
                        mimeType = 'image'
                        mimeSubtype = fileExtension === 'png' ? 'png' : 'jpeg'
                        break
                    case 'xls':
                    case 'xlsx':
                        mimeType = 'application'
                        mimeSubtype = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        break
                    default:
                        mimeType = 'application'
                        mimeSubtype = 'octet-stream'
                        break
                }

                const blob = new Blob([item.value as unknown as ArrayBuffer], { type: `${mimeType}/${mimeSubtype}` })
                formData.append(item.key, blob, fileName)
            }

            // Add payload fields
            Object.entries(payload).forEach(([key, value]) => {
                formData.append(key, value)
            })

            const response = await fetch(getApiUrl(url), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'apiKey': this.apiKey,
                    'Authorization': `Bearer ${this.token}`,
                },
                body: formData,
            })

            return this.processResponse(response)
        } catch (error) {
            if (error instanceof TypeError) {
                throw new ApiNotRespondingException('PLEASE CHECK YOUR INTERNET CONNECTION')
            }
            throw error
        }
    }

    //============================ [ PROCESS RESPONSE ] ========================================================

    private async processResponse(response: Response): Promise<any> {

        const responseText = await response.text();

        switch (response.status) {
            case 200:
                return this.validateResponse(responseText);
            case 400:
                throw new BadRequestException('Bad request exception')
            case 401:
                throw new UnauthorizedException('Unauthorized user')
            case 402:
                throw new UserDeletedException('Your session has expired due to inactivity. Please log in again to continue.')
            case 403:
                await this.refreshToken()
                break
            case 404:
                throw new BadRequestException('Invalid request')
            case 412:
                throw new MenuChangedException('Menu Changed')
            default:
                throw new ApiNotRespondingException('Unexpected error occurred')
        }
    }

    private validateResponse(apiResponse: string): any {
        const jsonResponse = JSON.parse(apiResponse)

        if (jsonResponse.IsSuccess) {
            return jsonResponse;
        } else {
            if (!jsonResponse.ErrorMessage || jsonResponse.ErrorMessage.length === 0) {
                throw new BadRequestException(jsonResponse.WarningMessage?.[0] || 'Unknown error')
            } else {
                throw new BadRequestException(jsonResponse.ErrorMessage[0])
            }
        }
    }

    private async refreshToken(): Promise<any> {
        try {

            if (!this.userUniqueKey) {
                throw new TokenExpiredException('TOKEN EXPIRED')
            }

            const params: FilterRefreshTokenRequest = {
                Uniquekey: this.userUniqueKey,
            };

            const response = await technicalService.apiCallRefreshToken(params);

            if (E.isRight(response)) {

                const token = response.right.Data;

                LocalStorageHelper.storeToken(token);   
            }

        } catch (error) {

            console.error('ERROR: DELETE DEPARTMENT MASTER :', error);
            if (error === TokenExpiredException) {
                await this.refreshToken();
            }

            throw new TokenExpiredException("TOKEN EXPIRED");
        }
    }

    //============================ [ Setter for token ] ========================================================
    setToken(token: string | null): void {
        this.token = token
    }

    //============================ [ Getter for token ] ========================================================
    getToken(): string | null {
        return this.token
    }
}

// Create and export a default instance
export const baseClient = new BaseClient()

export default baseClient