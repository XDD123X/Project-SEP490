import { Link } from "react-router-dom";
import {Facebook } from "lucide-react";

const FACEBOOK_URL = import.meta.env.VITE_SUPPORT_FACEBOOK;
const ZALO_URL = import.meta.env.VITE_SUPPORT_ZALO;
const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-8 py-8 md:flex-row md:py-12">
        <div className="flex-1 space-y-4">
          <h2 className="font-bold">{GLOBAL_NAME}</h2>
          <p className="text-sm text-muted-foreground">IELTS & SAT Teaching Center.</p>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-12 sm:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contacts</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/ai-analytics" className="text-muted-foreground transition-colors hover:text-primary">
                  Facebook
                </Link>
              </li>
              <li>
                <Link to="/cloud-services" className="text-muted-foreground transition-colors hover:text-primary">
                  Zalo
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Center</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/policies" className="text-muted-foreground transition-colors hover:text-primary">
                  Policies
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Connect</h3>
            <div className="flex space-x-4">
              <a href={FACEBOOK_URL} className="text-muted-foreground transition-colors hover:text-primary" target="_blank">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href={ZALO_URL} className="text-muted-foreground transition-colors hover:text-primary" target="_blank">
                <img src="/zalo.svg" alt="Zalo" className="h-5 w-5" />

                <span className="sr-only">Zalo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="container border-t py-6">
        <p className="text-center text-sm text-muted-foreground">© 2025 {GLOBAL_NAME}, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
