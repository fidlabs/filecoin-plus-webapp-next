import {IApiListResponse} from "@/lib/interfaces/dmob/dmob.interface";
import {IAllocator} from "@/lib/interfaces/dmob/allocator.interface";

export interface IGoogleSheetResponse {
  range: string
  majorDimension: string
  values: string[][]
}

export interface IAllocatorWithSheetInfo extends IAllocator {
  auditStatuses: string[]
  isActive: boolean
  isAudited?: boolean
  lastValidAudit: number
}

export interface IAllocatorsWithSheetInfo  extends IApiListResponse<IAllocatorWithSheetInfo> {
  audits: number
}
