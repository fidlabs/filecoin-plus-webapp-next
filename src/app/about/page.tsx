import {cn} from "@/lib/utils";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Metadata} from "next";
import {buttonVariants} from "@/components/ui/button";
import {PageTitle} from "@/components/ui/title";
import {BookIcon, CodeIcon, DatabaseIcon, ShieldCheckIcon} from "lucide-react";
import {StatsLink} from "@/components/ui/stats-link";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fil+ | About",
  description: "Learn more about Fil+, dashboards and how to get involved.",
}

const contentLink = {
  'filecoin_docs': <Link
    className={cn(buttonVariants({variant: "link"}), "text-base")}
    href="https://docs.filecoin.io/store/filecoin-plus/" target="_blank">Filecoin Plus
    section in the Filecoin Docs</Link>,
  neti: <Link className={cn(buttonVariants({variant: "link"}), "text-base")}
              href="https://neti-soft.com" target="_blank">Neti-Soft</Link>,
  dmob: <Link className={cn(buttonVariants({variant: "link"}), "text-base")}
              href="https://digitalmob.ro/" target="_blank">Digital M.O.B.</Link>,
  protocol_labs: <Link className={cn(buttonVariants({variant: "link"}), "text-base")}
              href="https://protocol.ai/" target="_blank">Protocol Labs</Link>,
  foundation: <Link className={cn(buttonVariants({variant: "link"}), "text-base")}
              href="https://www.fil.org/" target="_blank">Filecoin Foundation</Link>,
}

export default function AboutPage() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-start">
      <PageTitle>About</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-9">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-blue-100 rounded-full p-4">
              <ShieldCheckIcon className="text-dodger-blue w-7 h-7"/>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            Are you a Client hoping to get verified and receive DataCap?
          </CardContent>
          <CardFooter>
            <StatsLink href="https://plus.fil.org/">
              Get verified
            </StatsLink>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-blue-100 rounded-full p-4">
              <BookIcon className="text-dodger-blue w-7 h-7"/>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            Interested in learning more about Allocators or becoming one?
          </CardContent>
          <CardFooter>
            <StatsLink href="https://github.com/filecoin-project/allocator-governance" target="_blank">
              Learn more about allocators
            </StatsLink>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-blue-100 rounded-full p-4">
              <DatabaseIcon className="text-dodger-blue w-7 h-7"/>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            Need to query our APIs for specific data?
          </CardContent>
          <CardFooter>
            <StatsLink href="https://github.com/filecoin-project/filecoin-plus-client-onboarding/blob/main/miners.md"
                       target="_blank">
              Join the Fil+ SP registry
            </StatsLink>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <div className="bg-blue-100 rounded-full p-4">
              <CodeIcon className="text-dodger-blue w-7 h-7"/>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p>Are you a SP hoping to store verified data and increase your quality-adjusted power?</p>
          </CardContent>
          <CardFooter>
            <StatsLink href="https://documenter.getpostman.com/view/131998/Tzsim4NU#intro" target="_blank">
              Read the Documentation
            </StatsLink>
          </CardFooter>
        </Card>
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">
              Filecoin Plus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-[100ch] mb-4">
              Filecoin Plus is a layer of social trust on top of the Filecoin Network designed to incentivize the
              storage of real data. Root key-holders, allocators, clients, and storage providers interact through the
              allocation and spending of DataCap. For more details about the Fil+ program, visit the {contentLink.filecoin_docs}
            </p>
            <p className="max-w-[100ch] mb-4">
              Clients looking to utilize storage on the network apply to receive DataCap from Allocators, which can be
              used to incentivize storage providers to make storage deals. Allocators are community-elected trustees
              responsible for allocating DataCap to parties storing useful data on the network. Storage Providers that
              receive DataCap get a 10x boost to their quality-adjusted power for the storage space offered in that
              deal, increasing their block reward share in the network. This creates a mechanism that incentivizes all
              participants to make Filecoin more useful.
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-semibold text-lg">
              About State of Fil+ Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-[100ch] mb-4">
              The goal of this site is to provide metrics, insights, and audit accountability tools for the Filecoin
              Plus community. You can see health statistics of the overall program, along with tables of data to track
              interactions between stakeholders (Allocators, Clients, and Storage Providers).
            </p>
            <p className="max-w-[100ch] mb-4">
              This site was created by {contentLink.neti} in
              collaboration with {contentLink.dmob}, {contentLink.protocol_labs} and the {contentLink.foundation},
              which provided development grants.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
