import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

interface HeaderProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
}

const PageHeader = ({
  leftContent,
  rightContent,
  className,
  ...props
}: HeaderProps) => {
  return (
    <header
      className={cn(
        "grid grid-cols-2 gap-6 justify-between items-end bg-header px-4 md:px-12 py-10",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-6">{leftContent}</div>
      <div className="flex flex-col gap-6">{rightContent}</div>
    </header>
  );
};

const PageTitle = ({ children }: DivProps) => {
  return (
    <h1 className="text-3xl leading-relaxed font-semibold text-white">
      {children}
    </h1>
  );
};

const PageSubTitle = ({ children }: DivProps) => {
  return <p className="text-sm leading-none text-white">{children}</p>;
};

export { PageTitle, PageHeader, PageSubTitle };
