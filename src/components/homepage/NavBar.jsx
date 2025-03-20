import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@/services/StoreContext";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Separator } from "@radix-ui/react-dropdown-menu";

const FACEBOOK_URL = import.meta.env.VITE_SUPPORT_FACEBOOK;
const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function Navbar() {
  const { state } = useStore();
  const { user, role } = state;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="mr-6 flex items-center">
          <span className="font-bold text-lg">{GLOBAL_NAME}</span>
          <span className="ml-0 font-bold text-lg">.</span>
        </Link>

        <div className="flex flex-1 justify-end items-center space-x-4">
          <Link to={FACEBOOK_URL} target="_blank">
            <Button variant="ghost" size="sm">
              Contact
            </Button>
          </Link>
          {!user ? (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          ) : (
            <Link to={`/${role}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">Welcome, {user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Welcome {user.name},</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Link to={`/${role}`}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to={`/profile`}>My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to={`/logout`}>Log out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
