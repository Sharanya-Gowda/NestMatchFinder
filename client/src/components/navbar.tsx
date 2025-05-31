import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, LogIn, UserPlus, Settings } from "lucide-react";
import Logo from "@/components/logo";

export default function Navbar() {
  const [location] = useLocation();
  const user = null;
  const logout = () => {};

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 cursor-pointer">
                <Logo size="md" showText={true} />
              </div>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-1">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className={`${
                      isActive("/") 
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                {user && (
                  <Link href={user.userType === 'owner' ? '/dashboard/owner' : '/dashboard/user'}>
                    <Button
                      variant="ghost"
                      className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/about">
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    About
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    Contact
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName} {user.lastName}
                </span>
                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
