import {Metadata} from "next";
import {AllocatorsList} from "@/app/allocators/components/allocators-list";
import {Suspense} from "react";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Allocators",
  description: "Fil+ Dashboard | Allocators",
}

const AllocatorsPage = () => {
  return <Suspense>
    <AllocatorsList/>
  </Suspense>
};

export default AllocatorsPage;