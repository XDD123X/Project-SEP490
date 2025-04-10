import React from "react";
import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function AddProductTab() {
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [material, setMaterial] = useState("");
  const [images, setImages] = useState([]);
  const [links, setLinks] = useState([{ id: "link-1", url: "" }]);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result);
          if (newImages.length === files.length) {
            setImages([...images, ...newImages]);
          }
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const addLink = () => {
    setLinks([...links, { id: `link-${Date.now()}`, url: "" }]);
  };

  const removeLink = (id) => {
    if (links.length === 1) return;
    setLinks(links.filter((link) => link.id !== id));
  };

  const updateLink = (id, url) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, url } : link)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!code || !price || !material || images.length === 0) {
      toast("Please fill in all required fields and upload at least one image.");
      return;
    }

    // Here you would typically send the data to your backend
    toast("The product has been added successfully");

    // Reset form
    setCode("");
    setPrice("");
    setMaterial("");
    setImages([]);
    setLinks([{ id: "link-1", url: "" }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-images">Product Images</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img src={image || "/placeholder.svg"} alt={`Product ${index}`} className="h-32 w-full object-cover rounded-md" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="h-32 border-2 border-dashed rounded-md flex items-center justify-center">
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center p-4">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-sm text-center">Upload Images</span>
                    <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-code">Product Code</Label>
                <Input id="product-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter product code" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-price">Price</Label>
                <Textarea id="product-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="This price of product is..." rows={2} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-material">Material</Label>
              <Input id="product-material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="Enter material" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Product Links</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLink}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-2">
                {links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2">
                    <Input value={link.url} onChange={(e) => updateLink(link.id, e.target.value)} placeholder="Enter product link" className="flex-1" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(link.id)} disabled={links.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
