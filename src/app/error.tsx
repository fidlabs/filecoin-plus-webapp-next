"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.warn(error);
  }, [error]);

  return (
    <div className="flex flex-col pt-48 px-6">
      <h2 className="text-center text-lg">An error occured.</h2>
      <p className="text-center text-sm">
        The page is unavailable at the moment. Please try again later.
      </p>
    </div>
  );
}
