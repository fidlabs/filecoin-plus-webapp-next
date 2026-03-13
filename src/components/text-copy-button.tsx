"use client";

import { useCallback } from "react";
import { Button, ButtonProps } from "./ui/button";
import { toast } from "sonner";

export interface TextCopyButtonProps extends ButtonProps {
  copiedText: string;
  successMessage?: string;
}

type ClickHandler = NonNullable<TextCopyButtonProps["onClick"]>;

export function TextCopyButton({
  children,
  copiedText,
  successMessage = "Copied",
  onClick,
  ...rest
}: TextCopyButtonProps) {
  const handleClick = useCallback<ClickHandler>(
    (event) => {
      onClick?.(event);

      navigator.clipboard.writeText(copiedText).then(() => {
        toast.success(successMessage);
      });
    },
    [copiedText, onClick, successMessage]
  );

  return (
    <Button onClick={handleClick} {...rest}>
      {children}
    </Button>
  );
}
