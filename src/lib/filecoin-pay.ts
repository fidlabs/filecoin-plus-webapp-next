const baseUrl = "https://pay.filecoin.cloud";

export interface FilecoinPayRailUrlOptions {
  railId: string | number | bigint;
  testnet?: boolean;
}

export function createFilecoinPayRailUrl({
  railId,
  testnet,
}: FilecoinPayRailUrlOptions) {
  return [
    baseUrl,
    testnet ? "calibration" : "mainnet",
    "rails",
    railId.toString(),
  ].join("/");
}
