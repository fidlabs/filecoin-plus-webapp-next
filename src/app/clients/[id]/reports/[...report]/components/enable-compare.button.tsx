import { Button } from "@/components/ui/button";
import { useReportsDetails } from "../providers/reports-details.provider";

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
