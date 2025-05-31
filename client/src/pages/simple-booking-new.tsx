import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-simple";

export default function SimpleBookingNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get property ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('propertyId');
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    moveInDate: '',
    moveOutDate: '',
    message: ''
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      console.log("Creating booking with data:", bookingData);
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Booking error:", errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Booking created successfully:", data);
      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been sent successfully.",
      });
      setLocation('/dashboard/user');
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${user.id}`] });
    },
    onError: (error: any) => {
      console.error("Booking creation failed:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking request.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to make a booking request.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    if (!propertyId) {
      toast({
        title: "Error",
        description: "Property ID is missing.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingForm.moveInDate || !bookingForm.moveOutDate) {
      toast({
        title: "Missing Information",
        description: "Please select both move-in and move-out dates.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      propertyId: parseInt(propertyId),
      userId: user.id,
      rent: 10500, // You can get this from property data
      securityDeposit: 5000,
      moveInDate: new Date(bookingForm.moveInDate),
      moveOutDate: new Date(bookingForm.moveOutDate),
      status: 'pending',
      requestedDate: new Date(),
    };

    createBookingMutation.mutate(bookingData);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Booking Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="moveInDate">Move-in Date</Label>
                <Input
                  id="moveInDate"
                  type="date"
                  value={bookingForm.moveInDate}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="moveOutDate">Move-out Date</Label>
                <Input
                  id="moveOutDate"
                  type="date"
                  value={bookingForm.moveOutDate}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, moveOutDate: e.target.value }))}
                  min={bookingForm.moveInDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message to Owner (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Tell the owner about yourself..."
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span>Monthly Rent:</span>
                  <span className="font-medium">₹10,500</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span>Security Deposit:</span>
                  <span className="font-medium">₹5,000</span>
                </div>
              </div>
              
              <Button 
                type="submit"
                className="w-full"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Sending Request...' : 'Send Booking Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}