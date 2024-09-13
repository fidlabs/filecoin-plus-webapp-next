import {Metadata} from "next";
import {AllocatorsList} from "@/app/allocators/components/allocators-list";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Allocators",
  description: "Fil+ Dashboard | Allocators",
}

const AllocatorsPage = () => {
  return <AllocatorsList/>
};

export default AllocatorsPage;