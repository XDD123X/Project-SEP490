import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Search as SearchIcon } from "lucide-react";

export function Search(props) {
  return (
    <Button variant="outline" className="relative h-8 w-full flex-1 justify-start rounded-md bg-muted/25 text-sm font-normal text-muted-foreground shadow-none hover:bg-muted/50 sm:pr-12 md:w-40 md:flex-none lg:w-56 xl:w-64">
      <SearchIcon aria-hidden="true" className="absolute left-1.5 top-1/2 -translate-y-1/2" />
      <span className="ml-3">Search Anything...</span>
    </Button>
  );
}
