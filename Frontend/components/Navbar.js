"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "./theme-btn";
import LoadingBar from "react-top-loading-bar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Navbar = ({ footerRef }) => {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setProgress(20);
    setTimeout(() => setProgress(40), 100);
    setTimeout(() => setProgress(100), 400);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setProgress(0), 50);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "Admin") return "/admin";
    if (user.role === "Municipal") return "/municipal";
    return "/citizen";
  };

  return (
    <nav className="p-4 bg-background/50 sticky top-0 backdrop-blur border-b z-10">
      <LoadingBar color="#933ce6" progress={progress} onLoaderFinished={() => setProgress(0)} />
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-green-600 dark:text-green-400">
          <img src="/images/Logoooo.png" alt="WALL.E" className="w-10 h-10" />
        </Link>
        <div className="hidden md:flex space-x-4 items-center">
          <Link href="/" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
            Home
          </Link>
          <Link href="/about" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
            About
          </Link>
          <Link href="/contact" className="hover:scale-105 hover:font-semibold transition-transform duration-300">
            Contact
          </Link>
          {user && (
            <Link href={getDashboardLink()} className="hover:scale-105 hover:font-semibold transition-transform duration-300">
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2"> 
            <ModeToggle />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
          </div> 
        </div>
        <div className="md:hidden flex items-center gap-2">
          <Sheet className="mr-4">  
            <SheetTrigger>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="font-bold my-4 text-green-600 dark:text-green-400">WALL.E</SheetTitle>
                <SheetDescription>
                  <div className="flex flex-col gap-6">
                    <Link href="/">Home</Link>
                    <Link href="/about">About</Link>
                    <Link href="/contact">Contact</Link>
                    {user && (
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    )}
                    <div className="flex flex-col gap-2">
                      {user ? (
                        <>
                          <div className="text-sm font-medium mb-2">
                            {user.name} ({user.role})
                          </div>
                          <Button onClick={handleLogout} variant="outline" size="sm">
                            Logout
                          </Button>
                        </>
                      ) : (
                        <Link href="/login">
                          <Button variant="outline" size="sm" className="w-full">Login</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <ModeToggle />  
        </div>
      </div>
    </nav>
  );
};

export default Navbar;