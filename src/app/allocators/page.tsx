import {Metadata} from "next";
import {AllocatorsList} from "@/app/allocators/components/allocators-list";
import {Suspense} from "react";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Allocators",
  description: "Fil+ Dashboard | Allocators",
}

const AllocatorsPage = () => {
  return <main className="main-content ">
    <Suspense>
      <AllocatorsList/>
    </Suspense>
  </main>
};

export default AllocatorsPage;