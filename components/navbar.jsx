"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Check if we're running on the client side
const isClient = typeof window !== "undefined"

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Only run on client-side
    setIsMounted(true)
  }, [])

  // Don't render anything during SSR to prevent hydration errors
  if (!isMounted) {
    return (
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              FabTrack
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            FabTrack
          </Link>
          <nav className="ml-8 hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm ${
                pathname === "/" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"
              }`}
            >
              Home
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`text-sm ${
                  pathname === "/dashboard" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"
                }`}
              >
                Dashboard
              </Link>
            )}
            {user && user.role === "student" && (
              <Link
                href="/borrow"
                className={`text-sm ${
                  pathname === "/borrow" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"
                }`}
              >
                Borrow Equipment
              </Link>
            )}
            {/* <Link
              href="/about"
              className={`text-sm ${
                pathname === "/about" ? "text-primary font-medium" : "text-gray-600 hover:text-primary"
              }`}
            >
              About
            </Link> */}
          </nav>
        </div>

        <div className="flex items-center">
          {user ? (
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <Link
                  href="/"
                  className={`text-base ${pathname === "/" ? "text-primary font-medium" : "text-gray-600"}`}
                >
                  Home
                </Link>
                {user && (
                  <Link
                    href="/dashboard"
                    className={`text-base ${pathname === "/dashboard" ? "text-primary font-medium" : "text-gray-600"}`}
                  >
                    Dashboard
                  </Link>
                )}
                {user && user.role === "student" && (
                  <Link
                    href="/borrow"
                    className={`text-base ${pathname === "/borrow" ? "text-primary font-medium" : "text-gray-600"}`}
                  >
                    Borrow Equipment
                  </Link>
                )}
                <Link
                  href="/about"
                  className={`text-base ${pathname === "/about" ? "text-primary font-medium" : "text-gray-600"}`}
                >
                  About
                </Link>

                {user ? (
                  <>
                    <Link href="/profile" className="text-base text-gray-600">
                      Profile
                    </Link>
                    <button onClick={logout} className="text-base text-red-600 flex items-center">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-base text-gray-600">
                      Log in
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

