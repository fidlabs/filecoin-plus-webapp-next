import { Tabs } from "@radix-ui/react-tabs";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback } from "react";

type Scale = (typeof scales)[number];
interface ScaleSelectorProps {
  scale: string;
  setScale: (scale: Scale) => void;
}

const scales = ["linear", "log"] as const;

export function ScaleSelector({ scale, setScale }: ScaleSelectorProps) {
  const handleValueChange = useCallback(
    (scale: string) => {
      setScale(scale as Scale);
    },
    [setScale]
  );

  return (
    <Tabs value={scale} onValueChange={handleValueChange}>
      <TabsList>
        {scales.map((scale) => (
          <TabsTrigger key={scale} value={scale} className="capitalize">
            {scale}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
