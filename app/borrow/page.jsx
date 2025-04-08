"use client"

import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL_API;

const sampleEquipment = [
  {
    id: 1,
    // equipmentID: 1,
    name: "Arduino Kit",
    category: "Electronics",
    available: true
  },
  {
    id: 2,
    // equipmentID: 2,
    name: "3D Printer",
    category: "Fabrication",
    available: true
  }
];

export default function BorrowPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [description, setDescription] = useState("");
  const [collectionDateTime, setCollectionDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "Student") return;
    setEquipment(sampleEquipment);
  }, [user]);

  const handleSelectItem = (item) => {
    if (!item.available) {
      toast({
        title: "Unavailable",
        description: `${item.name} is currently unavailable`,
        variant: "destructive"
      });
      return;
    }

    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[item.id];
        return newQuantities;
      });
    } else {
      setSelectedItems([...selectedItems, item]);
      setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item",
        variant: "destructive"
      });
      return;
    }

    if (!collectionDateTime) {
      toast({
        title: "Collection time required",
        description: "Please select when you'll collect the equipment",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        items: selectedItems.map(item => ({
          equipmentID: item.id,
          quantity: quantities[item.id] || 1,
          description: description
        })),
        collectionDateTime: new Date(collectionDateTime).toISOString()
      };

      const response = await fetch(`${BASE_URL_API}/api/borrow/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request");
      }
      
      toast({
        title: "Success!",
        description: "Borrow request submitted successfully"
      });

      // Reset form
      setSelectedItems([]);
      setQuantities({});
      setDescription("");
      setCollectionDateTime("");

      // Redirect to dashboard after successful submission
      router.push("/dashboard");

    } catch (error) {
      console.error("Borrow request error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });

      // Handle unauthorized error
      if (error.message.includes("Unauthorized")) {
        localStorage.removeItem('authToken');
        router.push("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="flex justify-center p-8">
      <Loader2 className="animate-spin" />
    </div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-primary hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-4">Borrow Equipment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Equipment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipment.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-center p-4 border rounded-md ${
                    item.available 
                      ? "hover:bg-gray-50 cursor-pointer" 
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  onClick={() => handleSelectItem(item)}
                >
                  <Checkbox
                    checked={selectedItems.some(selected => selected.id === item.id)}
                    disabled={!item.available}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <Badge variant={item.available ? "default" : "destructive"}>
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Request Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selected Items */}
                <div>
                  <Label>Selected Items ({selectedItems.length})</Label>
                  {selectedItems.length > 0 ? (
                    <div className="mt-2 space-y-3">
                      {selectedItems.map(item => (
                        <div key={item.id} className="border p-3 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-gray-500">ID: {item.equipmentID}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectItem(item)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-2 flex items-center">
                            <Label htmlFor={`qty-${item.id}`} className="mr-2">Qty:</Label>
                            <Input
                              id={`qty-${item.id}`}
                              type="number"
                              min="1"
                              max="10"
                              value={quantities[item.id] || 1}
                              onChange={(e) => 
                                setQuantities(prev => ({
                                  ...prev,
                                  [item.id]: parseInt(e.target.value) || 1
                                }))
                              }
                              className="w-20"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No items selected</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the exact component"
                  />
                </div>

                {/* Collection Date */}
                <div>
                  <Label htmlFor="collectionDate">Collection Date/Time *</Label>
                  <Input
                    id="collectionDate"
                    type="datetime-local"
                    value={collectionDateTime}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCollectionDateTime(e.target.value);
                      }
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || selectedItems.length === 0}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : null}
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}