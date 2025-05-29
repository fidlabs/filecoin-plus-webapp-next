import {
  IAllowanceArray,
  IApiListCountable,
  IApiListResponse,
} from "@/lib/interfaces/dmob/dmob.interface";
import { IClient } from "@/lib/interfaces/dmob/client.interface";

export interface IAllocatorsResponse extends IApiListResponse<IAllocator> {
  count: number;
}

export interface IAllocatorResponse
  extends IApiListResponse<IClient>,
    IApiListCountable {
  name: string | null | undefined;
  remainingDatacap: string;
  addressId: string;
  address: string;
}

export interface IAllocator {
  id: number;
  addressId: string;
  address: string;
  auditTrail: string;
  retries: number;
  name?: string;
  orgName?: string;
  removed: boolean;
  initialAllowance: string;
  allowance: string;
  inffered: boolean;
  isMultisig: boolean;
  createdAtHeight: number;
  issueCreateTimestamp?: number;
  createMessageTimestamp: number;
  verifiedClientsCount: number;
  receivedDatacapChange: string;
  allowanceArray: IAllowanceArray[];
  auditStatus?: string;
  remainingDatacap: string;
  application_json_url: string | null;
}
