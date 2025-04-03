"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarIcon, CreditCard, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function BookingPage({ params }) {
  // In a real app, you would fetch the component data based on the ID
  const component = components.find((c) => c.id === params.id) || components[0]

  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [days, setDays] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleStartDateSelect = (date) => {
    setStartDate(date)
    // If end date is before start date, reset it
    if (date && endDate && date > endDate) {
      setEndDate(undefined)
    }
    calculateDays(date, endDate)
  }

  const handleEndDateSelect = (date) => {
    setEndDate(date)
    calculateDays(startDate, date)
  }

  const calculateDays = (start, end) => {
    if (start && end) {
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include both start and end days
      setDays(diffDays)
    } else {
      setDays(1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1500)
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                Your booking reference is:{" "}
                <span className="font-medium">
                  BK-
                  {Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}
                </span>
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Booking Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Component:</div>
                <div className="font-medium">{component.name}</div>

                <div>Booking Period:</div>
                <div className="font-medium">
                  {startDate ? format(startDate, "PPP") : "N/A"} - {endDate ? format(endDate, "PPP") : "N/A"}
                </div>

                <div>Duration:</div>
                <div className="font-medium">
                  {days} day{days !== 1 ? "s" : ""}
                </div>

                <div>Total Cost:</div>
                <div className="font-medium">${component.price * days}</div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>A confirmation email has been sent to your registered email address.</p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>You can manage your bookings from your account dashboard.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">Return to Components</Button>
            </Link>
            <Button>View My Bookings</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/components/${component.id}`} className="text-primary hover:underline">
          &larr; Back to component details
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Book {component.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Booking Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={handleStartDateSelect}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-muted-foreground",
                              )}
                              disabled={!startDate}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={handleEndDateSelect}
                              initialFocus
                              disabled={(date) => date < new Date() || (startDate ? date < startDate : false)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Enter your full name" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="Enter your email" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="Enter your phone number" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input id="company" placeholder="Enter your company name" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="card">Card Number</Label>
                        <div className="relative">
                          <Input id="card" placeholder="1234 5678 9012 3456" required />
                          <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={!startDate || !endDate || isSubmitting}>
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-muted rounded-md shrink-0 overflow-hidden">
                  <img
                    src={component.image || "/placeholder.svg"}
                    alt={component.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{component.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {component.id}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span>${component.price}/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>
                    {days} day{days !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span className="text-right">
                    {startDate ? format(startDate, "MMM d") : "..."} -{" "}
                    {endDate ? format(endDate, "MMM d, yyyy") : "..."}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${component.price * days}</span>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                <p className="flex items-center gap-1">
                  <Info className="h-4 w-4" />A security deposit may be required
                </p>
              </div>
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
    image: "/placeholder.svg?height=100&width=100",
    availability: "in-stock",
  },
  {
    id: "comp-002",
    name: "Hydraulic Cylinder Assembly",
    description: "Heavy-duty hydraulic cylinder with mounting brackets. Suitable for high-pressure applications.",
    price: 120,
    image: "/placeholder.svg?height=100&width=100",
    availability: "in-stock",
  },
  {
    id: "comp-003",
    name: "Precision CNC Tooling Kit",
    description: "Complete set of precision tooling for CNC machines. Includes various end mills and tool holders.",
    price: 95,
    image: "/placeholder.svg?height=100&width=100",
    availability: "limited",
  },
]

