import { useState, useEffect } from "react";
import { Search, Copy, Edit, Save, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockProducts } from "@/lib/mock-data";
import { toast } from "sonner";

export function ProductListTab() {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(mockProducts[0]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  useEffect(() => {
    const filtered = products.filter((product) => product.code.toLowerCase().includes(searchQuery.toLowerCase()) || product.material.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

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
      setFilteredProducts([...mockProducts]);
      return;
    }

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProduct({ ...selectedProduct });
  };

  const handleSave = () => {
    setIsEditing(false);
    setSelectedProduct(editedProduct);
    setProducts(products.map((p) => (p.id === editedProduct.id ? editedProduct : p)));
    toast("The product has been updated successfully.");
  };

  const handleInputChange = (field, value) => {
    setEditedProduct({
      ...editedProduct,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("code")}>
                    Code <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                    Price <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("material")}>
                    Material <ArrowUpDown className="ml-1 h-4 w-4 inline" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className={`cursor-pointer ${selectedProduct.id === product.id ? "bg-muted" : ""}`} onClick={() => setSelectedProduct(product)}>
                    <TableCell>{product.code}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.material}</TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No products found
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
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img src={selectedProduct.image || "/placeholder.svg"} alt={selectedProduct.code} className="h-40 w-auto object-contain" />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Code:</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? <Input value={editedProduct.code} onChange={(e) => handleInputChange("code", e.target.value)} className="w-48" /> : <span>{selectedProduct.code}</span>}
                    {!isEditing && (
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(selectedProduct.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Price:</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? <Input value={editedProduct.price} onChange={(e) => handleInputChange("price", e.target.value)} className="w-48" /> : <span className="text-sm">{selectedProduct.price}</span>}
                    {!isEditing && (
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(selectedProduct.price)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Material:</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? <Input value={editedProduct.material} onChange={(e) => handleInputChange("material", e.target.value)} className="w-48" /> : <span>{selectedProduct.material}</span>}
                    {!isEditing && (
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(selectedProduct.material)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Link:</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? <Input value={editedProduct.link} onChange={(e) => handleInputChange("link", e.target.value)} className="w-48" /> : <span className="truncate max-w-[180px]">{selectedProduct.link}</span>}
                    {!isEditing && (
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(selectedProduct.link)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                {isEditing ? (
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                ) : (
                  <Button onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-4">Select a product to view details</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
