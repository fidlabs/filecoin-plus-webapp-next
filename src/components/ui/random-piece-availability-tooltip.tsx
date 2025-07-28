import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const RandomPieceAvailabilityTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help whitespace-nowrap">RPA</div>
        </TooltipTrigger>
        <TooltipContent side="top">
          RPA - Random Piece Availability
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { RandomPieceAvailabilityTooltip };
