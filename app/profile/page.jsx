"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, X } from "lucide-react";
import * as jwt_decode from "jwt-decode";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decoded = jwt_decode.jwtDecode(token);
        setUser({
          email: decoded.email || decoded.Email,
          role: decoded.Role || decoded.role,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load user data",
        });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const handleClose = () => {
    router.back(); // Go back to previous page
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No user data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium mt-1">{user.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium mt-1 capitalize">{user.role.toLowerCase() || 'user'}</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}