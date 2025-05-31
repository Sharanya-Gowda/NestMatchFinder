import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import CityMap from "@/pages/city-map";
import PGDetails from "@/pages/pg-details";
import CompatibilityQuiz from "@/pages/compatibility-quiz";
import Settings from "@/pages/settings";
import LoginSimple from "@/pages/login-simple";
import Signup from "@/pages/signup";
import LoginWithOtp from "@/pages/login-with-otp";
import UserDashboard from "@/pages/user-dashboard-simple";
import OwnerDashboard from "@/pages/owner-dashboard-simple";
import BookingSimple from "@/pages/booking-simple";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/city-map" component={CityMap} />
      <Route path="/pg-details" component={PGDetails} />
      <Route path="/compatibility-quiz" component={CompatibilityQuiz} />
      <Route path="/settings" component={Settings} />
      <Route path="/login" component={LoginSimple} />
      <Route path="/login-otp" component={LoginWithOtp} />
      <Route path="/signup" component={Signup} />
      <Route path="/booking" component={BookingSimple} />
      <Route path="/dashboard/user" component={UserDashboard} />
      <Route path="/dashboard/owner" component={OwnerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen bg-background">
            <Navbar />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
