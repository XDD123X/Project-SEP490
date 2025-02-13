import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2">Seems You Made Some Mistakes.</p>
      <Link to="/" className="mt-4 px-4 py-2  text-white rounded-lg">
        <Button variant='outline'>Back To Home</Button>
      </Link>
    </div>
  );
}
