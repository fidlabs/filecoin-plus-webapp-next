import { type HTMLAttributes } from "react";

type DivProps = HTMLAttributes<HTMLDivElement>;

interface HeaderProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
}

const PageHeader = ({ leftContent, rightContent }: HeaderProps) => {
  return (
    <header className="grid grid-cols-2 gap-6 justify-between items-end bg-header px-4 md:px-12 py-10">
      <div className="flex flex-col gap-6">{leftContent}</div>
      <div className="flex justify-center h-full">{rightContent}</div>
    </header>
  );
};

const PageTitle = ({ children }: DivProps) => {
  return <h1 className="text-3xl font-semibold text-white">{children}</h1>;
};

const PageSubTitle = ({ children }: DivProps) => {
  return <p className="text-sm leading-none text-white">{children}</p>;
};

export { PageTitle, PageHeader, PageSubTitle };
