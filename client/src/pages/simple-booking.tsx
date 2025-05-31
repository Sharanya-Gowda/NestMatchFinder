import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Star, Phone } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-simple";
import type { Property } from "@shared/schema";

export default function SimpleBooking() {
  const [, setLocation] = useLocation();
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get property ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    moveInDate: '',
    moveOutDate: '',
    message: ''
  });

  // Fetch property data
  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: ['/api/properties', propertyId],
    enabled: !!propertyId,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been sent to the property owner. You'll receive a response soon.",
      });
      setBookingDialogOpen(false);
      setBookingForm({ moveInDate: '', moveOutDate: '', message: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to make a booking request.",
        variant: "destructive",
      });
      setLocation('/login');
      return;
    }

    if (!property) return;

    if (!bookingForm.moveInDate || !bookingForm.moveOutDate) {
      toast({
        title: "Missing Information",
        description: "Please select move-in and move-out dates.",
        variant: "destructive",
      });
      return;
    }

    const bookingData = {
      propertyId: property.id,
      userId: user.id,
      rent: property.rent,
      securityDeposit: property.securityDeposit,
      moveInDate: new Date(bookingForm.moveInDate),
      moveOutDate: new Date(bookingForm.moveOutDate),
      status: 'pending',
      requestedDate: new Date(),
    };

    createBookingMutation.mutate(bookingData);
  };

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Contact Owner
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                  {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500">No images available</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{property.name}</CardTitle>
                    <div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.address}, {property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">New</span>
                      <span className="text-gray-500 ml-1">(0 reviews)</span>
                    </div>
                  </div>
                  <Badge variant={property.gender === 'male' ? 'default' : 'secondary'}>
                    {property.gender} only
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {property.description || "No description available"}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">₹{property.rent}</div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{property.availableBeds}</div>
                    <div className="text-sm text-gray-500">beds available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">₹{property.securityDeposit || 0}</div>
                    <div className="text-sm text-gray-500">security deposit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{property.totalBeds}</div>
                    <div className="text-sm text-gray-500">total beds</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book This Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{property.rent}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setBookingDialogOpen(true)}
                  disabled={property.availableBeds === 0}
                >
                  {property.availableBeds === 0 ? 'No Beds Available' : 'Book Now'}
                </Button>
                
                <div className="text-center text-sm text-gray-500">
                  {property.availableBeds} bed{property.availableBeds !== 1 ? 's' : ''} available
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {property.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="moveInDate">Move-in Date</Label>
              <Input
                id="moveInDate"
                type="date"
                value={bookingForm.moveInDate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, moveInDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
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
                <span className="font-medium">₹{property.rent}</span>
              </div>
              {property.securityDeposit && (
                <div className="flex justify-between items-center mb-2">
                  <span>Security Deposit:</span>
                  <span className="font-medium">₹{property.securityDeposit}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setBookingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleBooking}
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}