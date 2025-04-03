import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Clock, PenToolIcon as Tool } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">FabTrack</h1>
              <p className="text-xl md:text-2xl mb-6">Ashesi University's Engineering Component Borrowing Platform</p>
              <p className="text-lg mb-8">
                Easily request, track, and return engineering components for your projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Engineering equipment"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How FabTrack Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Equipment</h3>
              <p className="text-gray-600">
                Browse available engineering components and submit requests for the items you need for your projects.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Status</h3>
              <p className="text-gray-600">
                Monitor the status of your requests in real-time and receive notifications when they're approved.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-tertiary rounded-full flex items-center justify-center mb-4">
                <Tool className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Return Items</h3>
              <p className="text-gray-600">
                Return borrowed equipment on time and maintain a good borrowing record for future requests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-tertiary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join FabTrack today and gain access to Ashesi University's engineering equipment inventory.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-8">
              Create an Account <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">FabTrack</h2>
              <p className="text-gray-400">Ashesi University</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8">
              {/* <Link href="/about" className="text-gray-300 hover:text-white">
                About
              </Link> */}
              {/* <Link href="/contact" className="text-gray-300 hover:text-white">
                Contact
              </Link>
              <Link href="/help" className="text-gray-300 hover:text-white">
                Help Center
              </Link> */}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} FabTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

