"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X } from "lucide-react";
import Link from "next/link";

const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL_API;

export default function BorrowPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [equipment, setEquipment] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [collectionDateTime, setCollectionDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No authentication token found. Please log in.",
        });
        return;
      }

      try {
        const res = await fetch(`${BASE_URL_API}/api/equipment`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch equipment");

        const data = await res.json();
        setEquipment(data.equipmentList || []);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error fetching equipment.",
        });
      }
    };

    if (user && user.role === "Student") {
      fetchEquipment();
    }
  }, [user, toast]);

  const handleSelectItem = (item) => {
    const isSelected = selectedItems.some(selected => selected.EquipmentID === item.EquipmentID);
    
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => i.EquipmentID !== item.EquipmentID));
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[item.EquipmentID];
        return newQuantities;
      });
      setDescriptions(prev => {
        const newDescriptions = { ...prev };
        delete newDescriptions[item.EquipmentID];
        return newDescriptions;
      });
    } else {
      setSelectedItems([...selectedItems, item]);
      setQuantities(prev => ({ ...prev, [item.EquipmentID]: 1 }));
      setDescriptions(prev => ({ ...prev, [item.EquipmentID]: "" }));
    }
  };

  const handleDescriptionChange = (equipmentID, value) => {
    setDescriptions(prev => ({
      ...prev,
      [equipmentID]: value
    }));
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
          equipmentID: item.EquipmentID,
          quantity: quantities[item.EquipmentID] || 1,
          description: descriptions[item.EquipmentID] || ""
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

      if (!response.ok) throw new Error(data.message || "Failed to submit request");
      
      toast({
        title: "Success!",
        description: "Borrow request submitted successfully"
      });

      setSelectedItems([]);
      setQuantities({});
      setDescriptions({});
      setCollectionDateTime("");

      router.push("/dashboard");

    } catch (error) {
      console.error("Borrow request error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit request",
        variant: "destructive"
      });

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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Equipment List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {equipment.map(item => (
                <div 
                  key={item.EquipmentID}
                  className="flex items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectItem(item)}
                >
                  <Checkbox
                    checked={selectedItems.some(selected => selected.EquipmentID === item.EquipmentID)}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.Name}</p>
                    {item.Category && <p className="text-sm text-gray-500">{item.Category}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Selected Items ({selectedItems.length})</Label>
                  {selectedItems.length > 0 ? (
                    <div className="mt-2 space-y-3">
                      {selectedItems.map(item => (
                        <div key={item.EquipmentID} className="border p-3 rounded-md space-y-2">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{item.Name}</p>
                              <p className="text-xs text-gray-500">ID: {item.EquipmentID}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectItem(item)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center">
                            <Label htmlFor={`qty-${item.EquipmentID}`} className="mr-2">Qty:</Label>
                            <Input
                              id={`qty-${item.EquipmentID}`}
                              type="number"
                              min="1"
                              max="10"
                              value={quantities[item.EquipmentID] || 1}
                              onChange={(e) => 
                                setQuantities(prev => ({
                                  ...prev,
                                  [item.EquipmentID]: parseInt(e.target.value) || 1
                                }))
                              }
                              className="w-20"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`desc-${item.EquipmentID}`}>Description:</Label>
                            <Textarea
                              id={`desc-${item.EquipmentID}`}
                              value={descriptions[item.EquipmentID] || ""}
                              onChange={(e) => handleDescriptionChange(item.EquipmentID, e.target.value)}
                              placeholder={`Describe which ${item.Name} you need`}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No items selected</p>
                  )}
                </div>

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