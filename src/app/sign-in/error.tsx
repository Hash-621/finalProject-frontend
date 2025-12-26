"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-green-600 ">...OOPS!</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Something went wrong
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          An unexpected error occurred. Please try again by clicking the button
          below.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            onClick={() => reset()}
            className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 hover:text-green-500"
          >
            Go to main page <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
