import { cn, divideBigint } from "@/lib/utils";
import { filesize } from "filesize";
import { HTMLAttributes } from "react";

type Bytes = bigint | string | number;
type DivProps = Omit<HTMLAttributes<HTMLDivElement>, "children">;

export interface ProviderSpaceInfoBarProps extends DivProps {
  availableBytes: Bytes;
  committedBytes: Bytes;
  pendingBytes: Bytes;
}

interface BarSegmmentProps extends DivProps {
  color: string;
}

interface TextSegmentProps extends DivProps {
  label: string;
  value: Bytes;
}

export function ProviderSpaceInfoBar({
  availableBytes,
  committedBytes,
  pendingBytes,
  ...rest
}: ProviderSpaceInfoBarProps) {
  const availableBytesBigInt = BigInt(availableBytes);
  const committedBytesBigInt = BigInt(committedBytes);
  const pendingBytesBigInt = BigInt(pendingBytes);
  const remainingBytesBigInt =
    availableBytesBigInt - committedBytesBigInt - pendingBytesBigInt;
  const committedBytesSegmentWidth =
    divideBigint(committedBytesBigInt, availableBytesBigInt, 4) * 100 + "%";
  const pendingBytesSegmentWidth =
    divideBigint(pendingBytesBigInt, availableBytesBigInt, 4) * 100 + "%";

  return (
    <div {...rest}>
      <div className="flex flex-wrap justify-between gap-1 text-sm mb-1">
        <p>Storage Space Breakdown</p>
        <p>{filesize(availableBytesBigInt, { standard: "iec" })} Total Space</p>
      </div>
      <div className="flex mb-1">
        {committedBytesBigInt > 0n && (
          <BarSegment
            color="#ff0029"
            style={{
              width: committedBytesSegmentWidth,
              zIndex: 2,
            }}
          />
        )}

        {pendingBytesBigInt > 0n && (
          <BarSegment
            color="#cf8c00"
            style={{
              width: pendingBytesSegmentWidth,
              zIndex: 1,
            }}
          />
        )}

        {remainingBytesBigInt > 0n && <BarSegment color="#66a61e" />}
      </div>
      <div className="flex">
        <TextSegment
          label="Committed"
          value={committedBytes}
          style={{
            width: committedBytesSegmentWidth,
          }}
        />

        <TextSegment
          label="Pending"
          value={pendingBytes}
          style={{
            width: pendingBytesSegmentWidth,
          }}
        />

        <TextSegment label="Remaining" value={remainingBytesBigInt} />
      </div>
    </div>
  );
}

function BarSegment({ className, color, style, ...rest }: BarSegmmentProps) {
  return (
    <div
      {...rest}
      className={cn(
        "h-4 last:flex-1 min-w-4 first:rounded-l-full rounded-r-full -ml-2 first:ml-0",
        className
      )}
      style={{
        backgroundColor: color,
        ...style,
      }}
    />
  );
}

function TextSegment({ className, label, value, ...rest }: TextSegmentProps) {
  return (
    <div
      {...rest}
      className={cn(
        "last:flex-1 min-w-fit flex flex-wrap justify-center last:justify-end first:justify-start px-2 first:pl-0 last:pr-0 text-xs",
        className
      )}
    >
      <p className="overflow-hidden text-ellipsis">
        {label}:{" "}
        <strong className="font-semibold whitespace-nowrap">
          {filesize(value, { standard: "iec" })}
        </strong>
      </p>
    </div>
  );
}
