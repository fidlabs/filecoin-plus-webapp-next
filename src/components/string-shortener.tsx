import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

export interface StringShortenerProps {
  maxLength: number;
  value: string;
}

export function StringShortener({ maxLength, value }: StringShortenerProps) {
  if (value.length > maxLength) {
    return (
      <HoverCard openDelay={100} closeDelay={50}>
        <HoverCardTrigger asChild>
          <span>{value.slice(0, maxLength)}...</span>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">{value}</HoverCardContent>
      </HoverCard>
    );
  }

  return value;
}
