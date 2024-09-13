import {Tabs} from "@radix-ui/react-tabs";
import {TabsList, TabsTrigger} from "@/components/ui/tabs";

interface IProps {
  scale: string;
  setScale: (scale: string) => void;
}

export const ScaleSelector = ({ scale, setScale }: IProps) => {
  return <Tabs value={scale} onValueChange={setScale}>
    <TabsList>
      <TabsTrigger value="linear">Linear</TabsTrigger>
      <TabsTrigger value="log">Log</TabsTrigger>
    </TabsList>
  </Tabs>
}