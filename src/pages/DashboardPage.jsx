import { useState, useEffect, useNavigate } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralTab } from "@/components/GeneralTab";
import { ProductListTab } from "@/components/ProductListTab";
import { ChatTab } from "@/components/ChatTab";
import { AddProductTab } from "@/components/AddProductTab";
import { SettingsTab } from "@/components/SettingTab";

export default function Dashboard() {
  const navigate = useNavigate();
  const [vndRate, setVndRate] = useState(3500); // Default VND to USD rate

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar />

      <main className="flex-1 container mx-auto p-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="products">Item List</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="add">Add</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab vndRate={vndRate} />
          </TabsContent>

          <TabsContent value="products">
            <ProductListTab />
          </TabsContent>

          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>

          <TabsContent value="add">
            <AddProductTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab vndRate={vndRate} setVndRate={setVndRate} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
