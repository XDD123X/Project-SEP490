import React from "react";
import { Toaster } from "@/components/ui/sonner";

const Layout = ({ children }) => {
  return (
    <div>
      <main>{children}</main>
      <Toaster richColors position="top-right" expand={false} theme="light"/>
    </div>
  );
};

export default Layout;
