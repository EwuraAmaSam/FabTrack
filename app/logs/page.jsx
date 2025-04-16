"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Download } from "lucide-react";

export default function LogsPage() {
  const [rawData, setRawData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/logs`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        setRawData(data);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(rawData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderData = (data) => {
    if (data === null || data === undefined) return "No data";
    
    if (Array.isArray(data)) {
      return (
        <div className="space-y-4">
          {data.map((item, index) => (
            <pre key={index} className="p-4 bg-gray-50 rounded-md overflow-x-auto">
              {JSON.stringify(item, null, 2)}
            </pre>
          ))}
        </div>
      );
    }

    if (typeof data === "object") {
      return (
        <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }

    return <div>{String(data)}</div>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={handleDownload} 
          className="flex items-center"
          disabled={!rawData}
        >
          <Download className="mr-2 h-4 w-4" /> Export Raw Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            renderData(rawData)
          )}
        </CardContent>
      </Card>
    </div>
  );
}