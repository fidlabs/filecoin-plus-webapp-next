import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import {
  createContext,
  forwardRef,
  MouseEventHandler,
  type ReactNode,
  useCallback,
  useContext,
  type HTMLAttributes,
} from "react";
import { Button } from "./ui/button";
import Link from "next/link";

interface TileSelectorContextShape {
  selectedValues: string[];
  onValueToggle(value: string): void;
}

const TileSelectorContext = createContext<TileSelectorContextShape>({
  selectedValues: [],
  onValueToggle() {},
});

export interface TileSelectorProps extends HTMLAttributes<HTMLDivElement> {
  value: string[];
  onValueChange?(value: string[]): void;
}

export const TileSelector = forwardRef<HTMLDivElement, TileSelectorProps>(
  ({ children, className, value, onValueChange, ...rest }, ref) => {
    const handleValueToggle = useCallback(
      (toggledValue: string) => {
        const foundIndex = value.findIndex((i) => i === toggledValue);
        const nextValue =
          foundIndex === -1
            ? [...value, toggledValue]
            : value.toSpliced(foundIndex, 1);
        onValueChange?.(nextValue);
      },
      [onValueChange, value]
    );

    return (
      <TileSelectorContext.Provider
        value={{
          selectedValues: value,
          onValueToggle: handleValueToggle,
        }}
      >
        <div
          {...rest}
          className={cn("flex flex-wrap gap-2", className)}
          ref={ref}
        >
          {children}
        </div>
      </TileSelectorContext.Provider>
    );
  }
);
TileSelector.displayName = "TileSelector";

export interface TileSelectorItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  action?: {
    label: ReactNode;
    url: string;
  };
  label: ReactNode;
  value: string;
}

export const TileSelectorItem = forwardRef<
  HTMLDivElement,
  TileSelectorItemProps
>(({ action, className, label, value, onClick, ...rest }, ref) => {
  const { selectedValues, onValueToggle } = useContext(TileSelectorContext);
  const active = selectedValues.includes(value);
  const handleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (event) => {
      onValueToggle(value);
      onClick?.(event);
    },
    [onClick, onValueToggle, value]
  );

  const handleActionClick = useCallback<MouseEventHandler>((event) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      {...rest}
      className={cn(
        "cursor-pointer flex items-center gap-x-4 border rounded-full pl-3 pr-6 py-1 bg-black/5 border-black/20 text-muted-foreground",
        active && "bg-dodger-blue/10 border-dodger-blue/50",
        className
      )}
      ref={ref}
      onClick={handleClick}
    >
      <CheckIcon className={cn(!active && "text-gray-300")} />
      <div>
        <p className={cn("text-sm font-medium", !active && "text-gray-400")}>
          {label}
        </p>

        {!!action && (
          <Button
            asChild
            className={cn("text-xs", !active && "text-gray-400")}
            variant="link"
            onClick={handleActionClick}
          >
            <Link href={action.url}>{action.label}</Link>
          </Button>
        )}
      </div>
    </div>
  );
});
TileSelectorItem.displayName = "TileSelectorItem";
