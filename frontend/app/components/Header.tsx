import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, LogOut, HelpCircle, ChevronDown } from "lucide-react";

const Header = () => {
  const user = {
    firstName: "John",
    image: "/api/placeholder/32/32",
  };

  return (
    <Card className="rounded-lg border-t-0 border-x-0">
      <CardContent className="p-0">
        <div className="w-full mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">LifeFlow</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Card className="border-0 shadow-none hover:bg-gray-50">
                <CardContent className="p-2">
                  <a
                    href="/dashboard"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Dashboard
                  </a>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none hover:bg-gray-50">
                <CardContent className="p-2">
                  <a
                    href="/appointments"
                    className="text-gray-600 hover:text-red-600"
                  >
                    Appointments
                  </a>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-none hover:bg-gray-50">
                <CardContent className="p-2">
                  <a
                    href="/donations"
                    className="text-gray-600 hover:text-red-600"
                  >
                    My Donations
                  </a>
                </CardContent>
              </Card>
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Card className="border-0 shadow-none hover:bg-gray-50 cursor-pointer">
                  <CardContent className="flex items-center space-x-2 p-2">
                    <img
                      src={user.image}
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.firstName}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </CardContent>
                </Card>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </CardContent>
                </Card>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Header;
