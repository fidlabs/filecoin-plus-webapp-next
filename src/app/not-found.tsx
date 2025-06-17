import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="main-content">
      <div className="bg-white rounded-lg shadow-f-card px-6 py-12 mt-[50px] max-w-[460px] mx-auto flex flex-col items-center">
        <h2 className="text-6xl text-center mb-4">404</h2>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Could not find requested resource
        </p>
        <Button asChild variant="link" className="text-center">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
