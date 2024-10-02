import {LoaderCircleIcon} from "lucide-react";

export default function Loading() {
  return <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <LoaderCircleIcon size={100} className="animate-spin text-dodger-blue"/>
  </div>
}