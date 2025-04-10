import { useState } from "react";
import { Search, Copy, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockChats } from "@/lib/mock-data";
import { toast } from "sonner";

export function ChatTab() {
  const [chats, setChats] = useState(mockChats);
  const [filteredChats, setFilteredChats] = useState(mockChats);
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = chats.filter((chat) => chat.title.toLowerCase().includes(query.toLowerCase()));
    setFilteredChats(filtered);
  };

  const handleSort = (key) => {
    let direction = "ascending";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });

    if (direction === null) {
      setFilteredChats([...mockChats]);
      return;
    }

    const sortedChats = [...filteredChats].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredChats(sortedChats);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast('The text has been copied to your clipboard.');
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Chat List</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-8" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                    Title <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                    Date <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChats.map((chat) => (
                  <TableRow key={chat.id} className={`cursor-pointer ${selectedChat.id === chat.id ? "bg-muted" : ""}`} onClick={() => setSelectedChat(chat)}>
                    <TableCell>{chat.title}</TableCell>
                    <TableCell>{chat.date}</TableCell>
                  </TableRow>
                ))}
                {filteredChats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      No chats found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Chat Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedChat ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedChat.title}</h3>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(selectedChat.title)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">{selectedChat.date}</div>

              <div className="border rounded-md p-4 bg-muted/30">
                <div className="flex justify-between">
                  <div className="whitespace-pre-wrap">{selectedChat.content}</div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(selectedChat.content)} className="self-start ml-2">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-4">Select a chat to view details</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
