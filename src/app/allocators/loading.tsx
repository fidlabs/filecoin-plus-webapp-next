import { LoaderCircle } from "lucide-react";

export default function AllocatorsListLoading() {
  return (
    <div className="p-10 w-full flex flex-col items-center justify-center">
      <LoaderCircle className="animate-spin" />
    </div>
  );
}
