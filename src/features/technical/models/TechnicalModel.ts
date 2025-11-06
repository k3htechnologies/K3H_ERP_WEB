import type { ApiResponse } from "@/core/api/ApiResponse";

export interface TechnicalData {
    APP_POOL_ID: string | ''
}

export type TechnicalListResponse = ApiResponse<TechnicalData[]>;