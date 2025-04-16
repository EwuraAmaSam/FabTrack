"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, AlertTriangle, Users, Laptop, Clock, Package, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL_API;

export default function Dashboard() {
  const { user, isLoading: authLoading, isUsingMockData } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRequests, setExpandedRequests] = useState({});
  const [requestItems, setRequestItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const secureFetch = async (url) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      router.push("/login");
      throw new Error("Session expired. Please log in again.");
    }

    return response;
  };

  const fetchRequestItems = async (requestId) => {
    setLoadingItems(prev => ({ ...prev, [requestId]: true }));
    
    try {
      const response = await secureFetch(`${BASE_URL_API}/api/borrow/${requestId}/items`);
      if (!response.ok) throw new Error("Failed to fetch request items");
      
      const data = await response.json();
      setRequestItems(prev => ({ ...prev, [requestId]: data.items || [] }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error fetching request items",
      });
    } finally {
      setLoadingItems(prev => ({ ...prev, [requestId]: false }));
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

  const fetchRequests = async () => {
    try {
      setIsLoading(true);

      const [allRequestsResponse, pendingRequestsResponse] = await Promise.all([
        secureFetch(`${BASE_URL_API}/api/borrow/all-requests`),
        secureFetch(`${BASE_URL_API}/api/borrow/pending-requests`)
      ]);

      if (!allRequestsResponse.ok) throw new Error("Failed to fetch all requests");
      if (!pendingRequestsResponse.ok) throw new Error("Failed to fetch pending requests");

      const [allRequestsData, pendingRequestsData] = await Promise.all([
        allRequestsResponse.json(),
        pendingRequestsResponse.json()
      ]);

      setRequests(allRequestsData.requests || []);
      setPendingRequests(pendingRequestsData.requests || []);
      
      // Filter approved requests (status not pending)
      const approved = allRequestsData.requests?.filter(request => 
        request.Status && request.Status.toLowerCase() !== "pending"
      ) || [];
      setApprovedRequests(approved);

    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message.includes("401")
          ? "Session expired. Please log in again."
          : error.message || "Failed to load requests",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    totalRequests: requests.length,
    pendingRequests: pendingRequests.length,
    approvedRequests: approvedRequests.length,
  };

  return (
    <div className="container mx-auto py-8">
      {isUsingMockData && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-600">Demo Mode Active</AlertTitle>
          <AlertDescription>
            You are currently using demo data. The backend service could not be reached.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        {user.role === "Student" && (
          <Link href="/borrow">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Request Equipment
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> Total Requests
            </CardTitle>
            <CardDescription>All equipment requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Pending
            </CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5" /> Approved
            </CardTitle>
            <CardDescription>Completed requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.approvedRequests}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {requests.map((request) => (
                <Card key={request.RequestID}>
                  <CardHeader>
                    <CardTitle>Request ID: {request.RequestID}</CardTitle>
                    <CardDescription>
                      Status: <Badge variant={request.Status === 'Pending' ? 'warning' : 'success'}>
                        {request.Status}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Requested by: {request.User?.Name || "Unknown User"}</p>
                    <p>Borrow Date: {new Date(request.BorrowDate).toLocaleDateString()}</p>
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
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Equipment</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Quantity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {requestItems[request.RequestID].map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">{item.Equipment?.Name || 'N/A'}</td>
                                  <td className="px-4 py-2">
                                    {item.Equipment?.Description || item.Description || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">{item.Quantity || 1}</td>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No requests found</p>
              {user.role === "Student" && (
                <Link href="/borrow">
                  <Button variant="outline" className="mt-4">
                    Request Equipment
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {pendingRequests.map((request) => (
                <Card key={request.RequestID}>
                  <CardHeader>
                    <CardTitle>Request ID: {request.RequestID}</CardTitle>
                    <CardDescription>
                      Status: <Badge variant="warning">Pending</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Requested by: {request.User?.Name || "Unknown User"}</p>
                    <p>Request Date: {new Date(request.BorrowDate).toLocaleDateString()}</p>
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
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Equipment</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Quantity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {requestItems[request.RequestID].map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">{item.Equipment?.Name || 'N/A'}</td>
                                  <td className="px-4 py-2">
                                    {item.Equipment?.Description || item.Description || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">{item.Quantity || 1}</td>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending requests</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : approvedRequests.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {approvedRequests.map((request) => (
                <Card key={request.RequestID}>
                  <CardHeader>
                    <CardTitle>Request ID: {request.RequestID}</CardTitle>
                    <CardDescription>
                      Status: <Badge variant="success">{request.Status}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Requested by: {request.User?.Name || "Unknown User"}</p>
                    <p>Borrow Date: {new Date(request.BorrowDate).toLocaleDateString()}</p>
                    <p>Return Date: {request.ReturnDate ? new Date(request.ReturnDate).toLocaleDateString() : 'Not specified'}</p>
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
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Equipment</th>
                                <th className="px-4 py-2 text-left">Description</th>
                                <th className="px-4 py-2 text-left">Quantity</th>
                                <th className="px-4 py-2 text-left">Serial Number</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {requestItems[request.RequestID].map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2">{item.Equipment?.Name || 'N/A'}</td>
                                  <td className="px-4 py-2">
                                    {item.Equipment?.Description || item.Description || 'N/A'}
                                  </td>
                                  <td className="px-4 py-2">{item.Quantity || 1}</td>
                                  <td className="px-4 py-2">{item.SerialNumber || 'Not specified'}</td>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No approved requests</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}