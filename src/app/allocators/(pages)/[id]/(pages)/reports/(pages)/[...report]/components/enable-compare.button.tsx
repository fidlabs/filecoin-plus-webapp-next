import { Button } from "@/components/ui/button";
import { useReportsDetails } from "@/app/allocators/(pages)/[id]/(pages)/reports/(pages)/[...report]/providers/reports-details.provider";

const EnableCompareButton = () => {
  const { compareMode, toggleCompareMode } = useReportsDetails();

  return (
    <Button
      variant={compareMode ? "default" : "outline"}
      onClick={toggleCompareMode}
    >
      {compareMode ? "Disable compare" : "Enable compare"}
    </Button>
  );
};

export { EnableCompareButton };
