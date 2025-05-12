import { CopyIcon } from "lucide-react";
import { ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export interface CopyButtonProps {
  copyText: string;
  successText: string;
  tooltipText: ReactNode;
}

export function CopyButton({
  copyText,
  successText,
  tooltipText,
}: CopyButtonProps) {
  const handleClick = useCallback(() => {
    navigator.clipboard
      .writeText(copyText)
      .then(() => {
        console.log("COPIED");
        toast.success(successText);
      })
      .catch((error) => alert(error));
  }, [copyText, successText]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="icon" variant="ghost" onClick={handleClick}>
            <CopyIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
