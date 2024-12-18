import {Metadata} from "next";
import {Suspense} from "react";
import {AllocatorsCompliance} from "@/app/allocators/(pages)/compliance/components/allocators-compliance";

export const metadata: Metadata = {
  title: "Fil+ Dashboard | Allocators complaince",
  description: "Fil+ Dashboard | Allocators complaince",
}

const AllocatorsPage = () => {
  return <main className="main-content ">
    <Suspense>
      <AllocatorsCompliance/>
    </Suspense>
  </main>
};

export default AllocatorsPage;