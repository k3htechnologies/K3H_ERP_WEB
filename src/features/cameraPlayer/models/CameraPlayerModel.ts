import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationCameraPlayerRequest {
    ProjectId?: number
}

export interface CameraPlayerData {
    CameraId: number | 0
    ProjectId: number | 0
    CameraName: string | null
    CameraIP: string | null
    Port: number | 0
    UserName: string | null
    Password: string | null
    ChannelNo: string | null
    Location: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
}

export type CameraPlayerListResponse = ApiResponse<CameraPlayerData[]>;