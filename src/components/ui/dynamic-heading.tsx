import { CSSProperties, PropsWithChildren } from "react";

interface IDynamicHeadingProps {
  className?: string;
  style?: CSSProperties;
  isHeader: boolean;
}

const DynamicHeading = ({
  children,
  className,
  style,
  isHeader,
}: PropsWithChildren<IDynamicHeadingProps>) => {
  const Comp = isHeader ? "h1" : "h2";
  return (
    <Comp className={className} style={style}>
      {children}
    </Comp>
  );
};

export { DynamicHeading };
