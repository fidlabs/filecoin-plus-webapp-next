import { Thing, WithContext } from "schema-dts";
import { PropsWithChildren, FC } from "react";

interface JsonLdProps {
  data: WithContext<Thing> | WithContext<Thing>[];
}

export const JsonLd: FC<PropsWithChildren<JsonLdProps>> = ({
  data,
  children,
}) => {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </>
  );
};
