"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  AlertTriangle,
  Users,
  Laptop,
  Clock,
  Pencil,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  X,
  Delete,
  RotateCcw,
  FileText, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [isApprovedRequestsLoading, setIsApprovedRequestsLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [approvedRequestsList, setApprovedRequestsList] = useState([]);
  const [expandedRequests, setExpandedRequests] = useState({});
  const [expandedApprovedRequests, setExpandedApprovedRequests] = useState({});
  const [requestItems, setRequestItems] = useState({});
  const [approvedRequestItems, setApprovedRequestItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [loadingApprovedItems, setLoadingApprovedItems] = useState({});
  const [serialNumbers, setSerialNumbers] = useState({});
  const [returnDates, setReturnDates] = useState({});
  const [itemApprovals, setItemApprovals] = useState({});
  const [approvingRequests, setApprovingRequests] = useState({});
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editName, setEditName] = useState("");

  const stats = {
    totalUsers: approvedRequestsList.length,
    totalEquipment: equipmentList.length,
    pendingRequests: requestsList.length,
    // overdueItems: 0,
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No authentication token found. Please log in.",
        });
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/equipment`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch equipment");
        }

        const data = await res.json();
        setEquipmentList(data.equipmentList || []);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error fetching equipment.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRequests = async () => {
      setIsRequestsLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No authentication token found. Please log in.",
        });
        setIsRequestsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/pending-requests`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch requests");
        }

        const data = await res.json();
        setRequestsList(data.requests || []);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error fetching requests.",
        });
      } finally {
        setIsRequestsLoading(false);
      }
    };

    const fetchAllRequests = async () => {
      setIsApprovedRequestsLoading(true);

      const token = localStorage.getItem("authToken");

      if (!token) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No authentication token found. Please log in.",
        });
        setIsApprovedRequestsLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/all-requests`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch all requests");
        }

        const data = await res.json();
        const allRequests = data.requests || [];
        
        // Filter for approved requests (status is not "Pending")
        const approved = allRequests.filter(request => 
          request.Status && request.Status.toLowerCase() !== "pending"
        );
        
        setApprovedRequestsList(approved);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "Error fetching all requests.",
        });
      } finally {
        setIsApprovedRequestsLoading(false);
      }
    };

    fetchEquipment();
    fetchRequests();
    fetchAllRequests();
  }, []);

  const fetchRequestItems = async (requestId) => {
    setLoadingItems(prev => ({ ...prev, [requestId]: true }));
    
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No authentication token found. Please log in.",
      });
      setLoadingItems(prev => ({ ...prev, [requestId]: false }));
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/${requestId}/items`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch request items");
      }

      const data = await res.json();
      
      // Initialize the item approvals when we fetch items
      const items = data.items || [];
      const initialApprovals = {};
      
      items.forEach(item => {
        const borrowedItemId = item.BorrowedItemID || item.EquipmentID;
        initialApprovals[borrowedItemId] = {
          borrowedItemID: borrowedItemId,
          allow: true, // Default to approved
          serialNumber: "",
          description: item.Description || item.description || ""
        };
      });
      
      setItemApprovals(prev => ({
        ...prev,
        [requestId]: initialApprovals
      }));
      
      setRequestItems(prev => ({ 
        ...prev, 
        [requestId]: items 
      }));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error fetching request items.",
      });
    } finally {
      setLoadingItems(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const fetchApprovedRequestItems = async (requestId) => {
    setLoadingApprovedItems(prev => ({ ...prev, [requestId]: true }));
    
    const token = localStorage.getItem("authToken");

    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No authentication token found. Please log in.",
      });
      setLoadingApprovedItems(prev => ({ ...prev, [requestId]: false }));
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/${requestId}/items`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch request items");
      }

      const data = await res.json();
      
      setApprovedRequestItems(prev => ({ 
        ...prev, 
        [requestId]: data.items || [] 
      }));
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error fetching request items.",
      });
    } finally {
      setLoadingApprovedItems(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const toggleRequestDetails = (requestId) => {
    setExpandedRequests(prev => {
      const newState = { ...prev, [requestId]: !prev[requestId] };
      
      if (newState[requestId] && !requestItems[requestId]) {
        fetchRequestItems(requestId);
      }
      
      return newState;
    });
  };

  const toggleApprovedRequestDetails = (requestId) => {
    setExpandedApprovedRequests(prev => {
      const newState = { ...prev, [requestId]: !prev[requestId] };
      
      if (newState[requestId] && !approvedRequestItems[requestId]) {
        fetchApprovedRequestItems(requestId);
      }
      
      return newState;
    });
  };

  const handleSerialNumberChange = (requestId, equipmentId, value) => {
    setSerialNumbers(prev => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        [equipmentId]: value
      }
    }));
    
    // Also update the serial number in the item approvals
    setItemApprovals(prev => {
      if (!prev[requestId] || !prev[requestId][equipmentId]) return prev;
      
      return {
        ...prev,
        [requestId]: {
          ...prev[requestId],
          [equipmentId]: {
            ...prev[requestId][equipmentId],
            serialNumber: value
          }
        }
      };
    });
  };

  // Update return date for a request
  const handleReturnDateChange = (requestId, date) => {
    setReturnDates(prev => ({
      ...prev,
      [requestId]: date
    }));
  };

  // Toggle approval status for an item
  const handleItemApprovalToggle = (requestId, borrowedItemId, isApproved) => {
    setItemApprovals(prev => {
      // Get the current state for this item
      const currentItem = prev[requestId]?.[borrowedItemId] || {
        borrowedItemID: borrowedItemId,
        serialNumber: serialNumbers[requestId]?.[borrowedItemId] || "",
        description: ""
      };
      
      return {
        ...prev,
        [requestId]: {
          ...prev[requestId],
          [borrowedItemId]: {
            ...currentItem,
            allow: isApproved
          }
        }
      };
    });
    
    // Visual feedback for the user
    toast({
      title: isApproved ? "Item Approved" : "Item Rejected",
      description: isApproved ? 
        "Item marked for approval" : 
        "Item marked for rejection"
    });
  };

  // Validate request approval
  const validateApproval = (requestId) => {
    const items = requestItems[requestId] || [];
    const approvals = itemApprovals[requestId] || {};
    
    // Check if at least one item is approved
    const hasApprovedItems = items.some(item => {
      const itemId = item.BorrowedItemID || item.EquipmentID;
      return approvals[itemId]?.allow !== false;
    });
    
    if (!hasApprovedItems) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one item must be approved",
      });
      return false;
    }
    
    return true;
  };

  // Handle marking a request as returned
  const handleMarkAsReturned = async (requestId) => {
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/return/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to mark request as returned");
      }

      // Update the UI - update the request status or remove it from the list
      setApprovedRequestsList(prev => 
        prev.map(request => 
          request.RequestID === requestId 
            ? { ...request, Status: "Returned" } 
            : request
        )
      );

      toast({
        title: "Success",
        description: "Equipment marked as returned successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error marking equipment as returned.",
      });
    }
  };

  // Handle the final request approval
  const handleApproveRequest = async (requestId) => {
    if (!validateApproval(requestId)) return;

    const token = localStorage.getItem("authToken");
    const returnDate = returnDates[requestId];

    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No authentication token found. Please log in.",
      });
      return;
    }

    if (!returnDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a return date.",
      });
      return;
    }

    setApprovingRequests(prev => ({...prev, [requestId]: true}));

    try {
      // Get the items from the request and map them to the expected format
      const itemsForRequest = Object.values(itemApprovals[requestId] || {});
      
      // Update serial numbers for items if needed
      itemsForRequest.forEach(item => {
        if (serialNumbers[requestId]?.[item.borrowedItemID]) {
          item.serialNumber = serialNumbers[requestId][item.borrowedItemID];
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/approve/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            returnDate: returnDate,
            items: itemsForRequest
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to approve request");
      }

      // Update the UI - remove the approved request from the list
      setRequestsList((prevRequests) =>
        prevRequests.filter((request) => request.RequestID !== requestId)
      );

      // Refresh the approved requests list
      fetchAllRequests();

      toast({
        title: "Success",
        description: "Request approved successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error approving request.",
      });
    } finally {
      setApprovingRequests(prev => ({...prev, [requestId]: false}));
    }
  };

  // Bulk approve all items in a request
  const approveAllItems = (requestId) => {
    setItemApprovals(prev => {
      const newApprovals = {...prev};
      const items = requestItems[requestId] || [];
      
      items.forEach(item => {
        const itemId = item.BorrowedItemID || item.EquipmentID;
        if (!newApprovals[requestId]) newApprovals[requestId] = {};
        newApprovals[requestId][itemId] = {
          ...(newApprovals[requestId][itemId] || {}),
          allow: true
        };
      });
      
      return newApprovals;
    });

    toast({
      title: "All Items Approved",
      description: "All items in this request have been marked for approval",
    });
  };

  // Bulk reject all items in a request
  const rejectAllItems = (requestId) => {
    setItemApprovals(prev => {
      const newApprovals = {...prev};
      const items = requestItems[requestId] || [];
      
      items.forEach(item => {
        const itemId = item.BorrowedItemID || item.EquipmentID;
        if (!newApprovals[requestId]) newApprovals[requestId] = {};
        newApprovals[requestId][itemId] = {
          ...(newApprovals[requestId][itemId] || {}),
          allow: false
        };
      });
      
      return newApprovals;
    });

    toast({
      title: "All Items Rejected",
      description: "All items in this request have been marked for rejection",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleSendReminders = async () => {
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/send-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to send reminders");
      }
  
      const data = await res.json();
      
      toast({
        title: "Success",
        description: data.message || "Reminders sent successfully.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error sending reminders.",
      });
    }
  };

  const handleEditEquipment = async (equipmentId) => {
    const newName = prompt("Enter new equipment name:");
    if (!newName) return;
  
    const token = localStorage.getItem("authToken");
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/equipment/${equipmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to update equipment");
      }
  
      const data = await res.json();
      toast({
        title: "Success",
        description: data.message || "Equipment updated successfully",
      });
  
      // Refresh equipment list
      fetchEquipment();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error updating equipment",
      });
    }
  };
  
  const handleDeleteEquipment = async (equipmentId) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
  
    const token = localStorage.getItem("authToken");
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/equipment/${equipmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to delete equipment");
      }
  
      const data = await res.json();
      toast({
        title: "Success",
        description: data.message || "Equipment deleted successfully",
      });
  
      // Refresh equipment list
      fetchEquipment();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error deleting equipment",
      });
    }
  };

  const handleEditClick = (equipment) => {
    setEditingEquipment(equipment.id);
    setEditName(equipment.name);
  };
  
  const handleSaveEdit = async (equipmentId) => {
    const token = localStorage.getItem("authToken");
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/equipment/${equipmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name: editName }),
        }
      );
  
      if (!res.ok) throw new Error("Failed to update equipment");
  
      const data = await res.json();
      toast({
        title: "Success",
        description: data.message || "Equipment updated successfully",
      });
  
      setEditingEquipment(null);
      fetchEquipment();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Error updating equipment",
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingEquipment(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, Admin</p>
        </div>
        <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={handleSendReminders}
          className="flex items-center"
        >
          <Clock className="mr-2 h-4 w-4" /> Send Reminders
        </Button>
          <Button asChild variant="outline">
            <Link href="/addequipment">
              <Plus className="mr-2 h-4 w-4" /> Add Equipment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-[#AC3333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> Approved Requests
            </CardTitle>
            <CardDescription>Total approved requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#373839]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Laptop className="h-5 w-5" /> Equipment
            </CardTitle>
            <CardDescription>Total inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEquipment}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-[#AC3333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Pending
            </CardTitle>
            <CardDescription>Requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card 
  className="border-l-4 border-[#AC3333] hover:bg-gray-50 transition-colors cursor-pointer"
  onClick={() => router.push('/logs')} 
>
  <CardHeader className="pb-2">
    <CardTitle className="text-lg flex items-center gap-2">
      <FileText className="h-5 w-5" /> View Logs
    </CardTitle>
    <CardDescription>Click to view system logs</CardDescription>
  </CardHeader>
  <CardContent className="flex justify-center items-center h-16">
    <Button variant="ghost" className="text-[#AC3333] hover:text-[#8A2828]">
      View Logs <ChevronRight className="ml-2 h-4 w-4" />
    </Button>
  </CardContent>
</Card>


      </div>

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved Requests</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {isRequestsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requestsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No pending requests found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {requestsList.map((request, index) => (
                <Card key={request.RequestID || index}>
                  <CardHeader>
                    <CardTitle>Request ID: {request.RequestID}</CardTitle>
                    <CardDescription>
                      Requested by: {request.User?.Name || "Unknown User"} | 
                      Email: {request.User?.Email || "Unknown"} | 
                      Borrow Date: {formatDate(request.BorrowDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Status:</strong> {request.Status}</p>
                        <p><strong>Collection Date:</strong> {formatDate(request.CollectionDateTime)}</p>
                      </div>
                      <div className="flex items-end justify-end gap-2">
                        <input
                          type="datetime-local"
                          className="border rounded-md p-2 text-sm"
                          onChange={(e) => handleReturnDateChange(request.RequestID, e.target.value)}
                          required
                        />
                        <Button
                          onClick={() => handleApproveRequest(request.RequestID)}
                          className="w-full md:w-auto"
                          disabled={approvingRequests[request.RequestID]}
                        >
                          {approvingRequests[request.RequestID] ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleRequestDetails(request.RequestID)}
                      className="flex items-center"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Request Items
                      {expandedRequests[request.RequestID] ? 
                        <ChevronUp className="h-4 w-4 ml-2" /> : 
                        <ChevronDown className="h-4 w-4 ml-2" />
                      }
                    </Button>
                  </CardFooter>
                  
                  {expandedRequests[request.RequestID] && (
                    <div className="px-6 pb-4">
                      {loadingItems[request.RequestID] ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : requestItems[request.RequestID]?.length > 0 ? (
                        <>
                          <div className="flex gap-2 mb-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => approveAllItems(request.RequestID)}
                            >
                              <Check className="h-3 w-3 mr-2" /> Approve All
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rejectAllItems(request.RequestID)}
                            >
                              <X className="h-3 w-3 mr-2" /> Reject All
                            </Button>
                          </div>
                          <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left">Equipment</th>
                                  <th className="px-4 py-2 text-left">Description</th>
                                  <th className="px-4 py-2 text-left">Quantity</th>
                                  <th className="px-4 py-2 text-left">Serial Number</th>
                                  {/* <th className="px-4 py-2 text-left">Status</th> */}
                                  <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {requestItems[request.RequestID].map((item, idx) => {
                                  const itemId = item.BorrowedItemID || item.EquipmentID;
                                  const isApproved = itemApprovals[request.RequestID]?.[itemId]?.allow !== false;
                                  const isRejected = itemApprovals[request.RequestID]?.[itemId]?.allow === false;
                                  
                                  return (
                                    <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-4 py-2">{item.Equipment?.Name || 'N/A'}</td>
                                      <td className="px-4 py-2">
                                        {item.Equipment?.Description || item.Description || item.description || 'N/A'}
                                      </td>
                                      <td className="px-4 py-2">{item.Quantity || 1}</td>
                                      <td className="px-4 py-2">
                                        <input
                                          type="text"
                                          className="border rounded-md p-1 text-sm w-full"
                                          placeholder="Enter serial number"
                                          value={serialNumbers[request.RequestID]?.[itemId] || ''}
                                          onChange={(e) => handleSerialNumberChange(
                                            request.RequestID, 
                                            itemId, 
                                            e.target.value
                                          )}
                                        />
                                      </td>
                                      {/* <td className="px-4 py-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          isApproved ? 'bg-green-100 text-green-800' : 
                                          isRejected ? 'bg-red-100 text-red-800' : 
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                                        </span>
                                      </td> */}
                                      <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 px-2 ${
                                              isApproved && !isRejected
                                                ? "bg-green-50 text-green-600 border-green-300"
                                                : "text-green-600 border-green-300 hover:bg-green-50"
                                            }`}
                                            onClick={() => handleItemApprovalToggle(request.RequestID, itemId, true)}
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={`h-8 px-2 ${
                                              isRejected
                                                ? "bg-red-50 text-red-600 border-red-300"
                                                : "text-red-600 border-red-300 hover:bg-red-50"
                                            }`}
                                            onClick={() => handleItemApprovalToggle(request.RequestID, itemId, false)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <p className="text-center py-2 text-gray-500">No items found for this request</p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {isApprovedRequestsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : approvedRequestsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No approved requests found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {approvedRequestsList.map((request, index) => (
                <Card key={request.RequestID || index}>
                  <CardHeader>
                    <CardTitle>Request ID: {request.RequestID}</CardTitle>
                    <CardDescription>
                      Requested by: {request.User?.Name || "Unknown User"} | 
                      Email: {request.User?.Email || "Unknown"} | 
                      Borrow Date: {formatDate(request.BorrowDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Status:</strong> {request.Status}</p>
                        <p><strong>Collection Date:</strong> {formatDate(request.CollectionDateTime)}</p>
                        <p><strong>Return Date:</strong> {formatDate(request.ReturnDate)}</p>
                      </div>
                      <div className="flex items-end justify-end">
                        {request.Status && request.Status.toLowerCase() !== "returned" && (
                          <Button
                            onClick={() => handleMarkAsReturned(request.RequestID)}
                            className="w-full md:w-auto bg-[#AC3333] hover:bg-[#8A2828]"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Mark as Returned
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center border-t pt-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => toggleApprovedRequestDetails(request.RequestID)}
                      className="flex items-center"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Request Items
                      {expandedApprovedRequests[request.RequestID] ? 
                        <ChevronUp className="h-4 w-4 ml-2" /> : 
                        <ChevronDown className="h-4 w-4 ml-2" />
                      }
                    </Button>
                  </CardFooter>
                  
                  {expandedApprovedRequests[request.RequestID] && (
                    <div className="px-6 pb-4">
                      {loadingApprovedItems[request.RequestID] ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : approvedRequestItems[request.RequestID]?.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Equipment</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Quantity</th>
                                <th className="px-4 py-2 text-left">Serial Number</th>
                                <th className="px-4 py-2 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {approvedRequestItems[request.RequestID].map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">{item.Equipment?.Name || 'N/A'}</td>
                                  <td className="px-4 py-2">
                                    {item.Equipment?.Description || item.Description || item.description || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">{item.Quantity || 1}</td>
                                  <td className="px-4 py-2">{item.SerialNumber || 'Not assigned'}</td>
                                  <td className="px-4 py-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.Status === 'Returned' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {item.Status || (request.Status === 'Returned' ? 'Returned' : 'Borrowed')}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-center py-2 text-gray-500">No items found for this request</p>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : equipmentList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No equipment found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {equipmentList.map((equipment, index) => (
                <Card key={equipment.EquipmentID || index}>
                  <CardHeader>
                    <CardTitle>{equipment.Name || equipment.name}</CardTitle>
                  </CardHeader>
                  {/* <CardContent>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/equipment/${equipment.EquipmentID || equipment.equipmentId || equipment.id || equipment._id}/edit`)
                      }
                      className="w-full"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                        <br/>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/admin/equipment/${equipment.EquipmentID || equipment.equipmentId || equipment.id || equipment._id}/edit`)
                      }
                      className="w-full"
                    >
                      <Delete className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent> */}

                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {/* <Button
                        variant="outline"
                        onClick={() => router.push(`/admin/equipment/${equipment.EquipmentID || equipment.equipmentId || equipment.id || equipment._id}/edit`)}
                        className="w-full"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button> */}
                      <Button
                        variant="outline"
                        onClick={() => handleEditEquipment(equipment.EquipmentID || equipment.equipmentId || equipment.id || equipment._id)}
                        className="w-full"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Quick Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteEquipment(equipment.EquipmentID || equipment.equipmentId || equipment.id || equipment._id)}
                        className="w-full text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      >
                        <Delete className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>

                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}