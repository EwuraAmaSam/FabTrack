import Link from "next/link"
import { Calendar, Clock, Info, PenToolIcon as Tool, Truck, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function ComponentDetail({ params }) {
  // In a real app, you would fetch the component data based on the ID
  const component = components.find((c) => c.id === params.id) || components[0]

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="mb-4">
            <Link href="/" className="text-primary hover:underline mb-4 inline-block">
              &larr; Back to components
            </Link>
          </div>

          <div className="bg-muted rounded-lg overflow-hidden mb-6">
            <img
              src={component.image || "/placeholder.svg"}
              alt={component.name}
              className="w-full h-[300px] object-cover"
            />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{component.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={component.availability === "in-stock" ? "success" : "destructive"}>
                {component.availability === "in-stock" ? "In Stock" : "Low Stock"}
              </Badge>
              <span className="text-muted-foreground">ID: {component.id}</span>
            </div>
            <p className="text-lg">{component.description}</p>
          </div>

          <Tabs defaultValue="specifications">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="usage">Usage Guidelines</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            <TabsContent value="specifications" className="p-4 border rounded-md mt-2">
              <h3 className="font-semibold mb-2">Technical Specifications</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Power Rating: 2.5 kW</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Operating Temperature: -10°C to 60°C</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Dimensions: 450mm × 320mm × 180mm</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Weight: 12.5 kg</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Certification: ISO 9001, CE</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="usage" className="p-4 border rounded-md mt-2">
              <h3 className="font-semibold mb-2">Usage Guidelines</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Tool className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Requires 3-phase power supply</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tool className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Not suitable for outdoor use without proper enclosure</span>
                </li>
                <li className="flex items-start gap-2">
                  <Tool className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Requires calibration before first use</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="maintenance" className="p-4 border rounded-md mt-2">
              <h3 className="font-semibold mb-2">Maintenance Requirements</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Regular inspection of connectors and cables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Clean cooling vents monthly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>Calibration recommended every 6 months</span>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:w-1/3">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-4">
                ${component.price}
                <span className="text-base font-normal text-muted-foreground">/day</span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Minimum rental: 1 day</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span>Delivery available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>Available from tomorrow</span>
                </div>
              </div>

              <Separator className="my-4" />

              <Link href={`/booking/${component.id}`}>
                <Button className="w-full mb-3">Book Now</Button>
              </Link>
              <Button variant="outline" className="w-full">
                Add to Wishlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Sample data
const components = [
  {
    id: "comp-001",
    name: "Industrial Servo Motor",
    description: "High-torque servo motor for precision control applications. Includes encoder and control interface.",
    price: 75,
    image: "/placeholder.svg?height=300&width=600",
    availability: "in-stock",
  },
  {
    id: "comp-002",
    name: "Hydraulic Cylinder Assembly",
    description: "Heavy-duty hydraulic cylinder with mounting brackets. Suitable for high-pressure applications.",
    price: 120,
    image: "/placeholder.svg?height=300&width=600",
    availability: "in-stock",
  },
  {
    id: "comp-003",
    name: "Precision CNC Tooling Kit",
    description: "Complete set of precision tooling for CNC machines. Includes various end mills and tool holders.",
    price: 95,
    image: "/placeholder.svg?height=300&width=600",
    availability: "limited",
  },
]

