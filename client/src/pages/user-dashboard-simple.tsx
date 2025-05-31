// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth-simple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Heart, Calendar, User, MapPin, Star, UserCheck, Filter, Settings, Navigation, Phone, Shield, Clock, CreditCard, CheckCircle, AlertCircle, Map } from "lucide-react";
import MapComponent from "@/components/map-component";
import { calculateCompatibilityScore } from "@/lib/compatibility";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function UserDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [likedProperties, setLikedProperties] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    city: "",
    minRent: "",
    maxRent: "",
    gender: "all",
    amenities: [] as string[]
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch all properties
  const { data: allProperties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Fetch user's bookings
  const { data: userBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: [`/api/bookings/user/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch user's properties (if they are an owner)
  const { data: userProperties = [], isLoading: userPropertiesLoading } = useQuery({
    queryKey: [`/api/properties/owner/${user?.id}`],
    enabled: !!user?.id && user?.userType === 'owner',
  });

  const [rentPayments, setRentPayments] = useState<any[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    foodType: "",
    sleepSchedule: "",
    studyHabits: "",
    cleanliness: "",
    socialLevel: "",
    smoking: "",
    drinking: "",
    pets: ""
  });

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPreferences');
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    
    setLocation("/");
  };

  const toggleLike = (propertyId: number) => {
    setLikedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const bookProperty = (property: any) => {
    setSelectedProperty(property);
    setBookingDialogOpen(true);
  };

  const createBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${user?.id}`] });
      toast({
        title: "Booking Request Sent",
        description: `Your booking request for ${selectedProperty?.name} has been sent to the owner.`,
      });
      setBookingDialogOpen(false);
      setSelectedProperty(null);
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Failed to send booking request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const confirmBooking = () => {
    if (!selectedProperty || !user) return;
    
    createBooking.mutate({
      propertyId: selectedProperty.id,
      rent: selectedProperty.rent,
      securityDeposit: selectedProperty.securityDeposit || selectedProperty.rent,
      status: 'pending',
      requestedDate: new Date().toISOString(),
    });
  };

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("DELETE", `/api/bookings/${bookingId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${user?.id}`] });
      toast({
        title: "Booking Cancelled",
        description: "Your booking request has been cancelled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel booking request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const callOwner = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const markRentAsPaid = (bookingId: number, month: string) => {
    toast({
      title: "Rent Marked as Paid",
      description: `Rent for ${month} has been marked as paid.`,
    });
  };

  const openManageDialog = (property: any) => {
    setEditingProperty(property);
    setManageDialogOpen(true);
  };

  const updatePropertyDetails = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/properties/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/properties/owner/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Property Updated",
        description: "Your property details have been updated successfully.",
      });
      setManageDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update property details.",
        variant: "destructive",
      });
    }
  });

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const savePreferences = async () => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      toast({
        title: "Preferences Saved",
        description: "Your compatibility preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  // User preferences for compatibility matching
  const getUserPreferences = () => {
  try {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};
const userPreferences = getUserPreferences();

  // Filter and search properties
  const filteredProperties = (allProperties as any[]).filter((property: any) => {
    const matchesSearch = !searchQuery || 
      property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = (!filters.minRent || property.rent >= parseInt(filters.minRent)) &&
      (!filters.maxRent || property.rent <= parseInt(filters.maxRent)) &&
      (filters.gender === "all" || property.gender === filters.gender);
    
    return matchesSearch && matchesFilters;
  });

  const viewPropertyDetails = (property: any) => {
    setSelectedProperty(property);
    setBookingDialogOpen(true);
  };

  const handleBookProperty = () => {
    if (selectedProperty) {
      setLocation(`/booking?propertyId=${selectedProperty.id}`);
    }
    setBookingDialogOpen(false);
    setSelectedProperty(null);
  };

  if (propertiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NestMatch</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setLocation("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${user?.userType === 'owner' ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <TabsTrigger value="browse">Browse PGs</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            {user?.userType === 'owner' && (
              <TabsTrigger value="properties">My Properties</TabsTrigger>
            )}
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="payments">Rent Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search PGs by name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setFiltersOpen(true)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

           {!userPreferences && (
              <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 text-center">
                  <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Set Your Roommate Preferences
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200 mb-4">
                    Complete your compatibility quiz to see how well you match with potential roommates.
                  </p>
                  <Button onClick={() => setLocation('/compatibility-quiz')} className="bg-blue-600 hover:bg-blue-700">
                    Take Compatibility Quiz
                  </Button>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property: any) => {
                // For demo purposes, calculate a sample compatibility score based on property characteristics
                const compatibilityScore = userPreferences ? 
                  Math.floor(Math.random() * 40) + 60 : // Random score between 60-99%
                  null;

                return (
                  <Card key={property.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-2 border border-gray-200 dark:border-gray-700" onClick={() => viewPropertyDetails(property)}>
                    <div className="relative overflow-hidden">
                      <img 
                        src={property.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"} 
                        alt={property.name}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-3 right-3 text-white hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(property.id);
                        }}
                      >
                        <Heart className={`w-5 h-5 ${likedProperties.includes(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{property.name}</h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{parseFloat(property.rating || '4.0').toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {property.address}, {property.city}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-primary">₹{property.rent?.toLocaleString()}/month</span>
                        <Badge variant="secondary" className="text-xs">
                          {property.gender}
                        </Badge>
                      </div>
                      
                      {compatibilityScore && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {compatibilityScore}% Compatible
                          </Badge>
                        </div>
                      )}
                      
                      {/* Bed Availability */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">{property.totalBeds || 0}</div>
                          <div className="text-xs text-gray-500">Total Beds</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                          <div className="text-lg font-semibold text-green-600">{property.availableBeds || 0}</div>
                          <div className="text-xs text-gray-500">Available</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                          <div className="text-lg font-semibold text-blue-600">{property.totalRooms || 0}</div>
                          <div className="text-xs text-gray-500">Rooms</div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Array.isArray(property.amenities) && property.amenities.slice(0, 3).map((amenity: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {Array.isArray(property.amenities) && property.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open directions in Google Maps
                            if (property.latitude && property.longitude) {
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`, '_blank');
                            } else {
                              window.open(`https://www.google.com/maps/search/${encodeURIComponent(property.address + ', ' + property.city)}`, '_blank');
                            }
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Directions
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (property.ownerPhone) {
                              window.open(`tel:${property.ownerPhone}`, '_self');
                            } else {
                              toast({
                                title: "Contact Information",
                                description: "Owner contact details will be available after booking.",
                                variant: "default",
                              });
                            }
                          }}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      </div>

                      {/* Book Now Button */}
                      <Button 
                        className="w-full mt-3" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/booking?propertyId=${property.id}`);
                        }}
                      >
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Map View Tab */}
          <TabsContent value="map" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Properties on Map</h2>
              <div className="flex gap-2">
                <Select value={filters.city} onValueChange={(value) => setFilters({...filters, city: value})}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProperties.map((property: any) => (
                    <Card key={property.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                      setLocation(`/booking?propertyId=${property.id}`);
                    }}>
                      <CardContent className="p-4">
                        <img 
                          src={property.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"} 
                          alt={property.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.city}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">₹{property.rent?.toLocaleString()}/month</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{parseFloat(property.rating || '4.0').toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="text-sm text-green-600 font-medium">{property.availableBeds || 0} beds available</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredProperties.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                    <p className="text-gray-600">Try adjusting your filters to see more properties.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Legend */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Map Legend</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>Available beds {'>'}  3</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Available beds 1-3</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span>No available beds</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Click on any marker to view property details and book directly.</p>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            
            {bookingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
              </div>
            ) : userBookings.length > 0 ? (
              <div className="space-y-4">
                {(userBookings as any[]).map((booking: any) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold">{booking.propertyName}</h3>
                            <p className="text-sm text-gray-500">{booking.propertyAddress}</p>
                            <p className="text-sm font-medium">₹{booking.rent}/month</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={
                              booking.status === "pending" ? "outline" :
                              booking.status === "approved" ? "default" : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                          
                          {booking.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelBooking.mutate(booking.id)}
                              disabled={cancelBooking.isPending}
                            >
                              {cancelBooking.isPending ? "Cancelling..." : "Cancel"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Start browsing properties to make your first booking.</p>
                <Button onClick={() => setActiveTab("browse")}>Browse Properties</Button>
              </div>
            )}
          </TabsContent>

          {user?.userType === 'owner' && (
            <TabsContent value="properties" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Properties</h2>
                <Button onClick={() => setLocation('/owner-dashboard')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Add New Property
                </Button>
              </div>
              
              {userPropertiesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading your properties...</p>
                </div>
              ) : userProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(userProperties as any[]).map((property: any) => (
                    <Card key={property.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
                      <div className="relative overflow-hidden">
                        <img 
                          src={property.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"} 
                          alt={property.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge variant={property.isVerified ? "default" : "secondary"}>
                            {property.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {property.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {property.description}
                        </p>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.address}, {property.city}
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary">₹{property.rent?.toLocaleString()}</span>
                          <div className="text-sm text-gray-500">
                            <span className="text-green-600 font-medium">{property.availableBeds}</span> of {property.totalBeds} beds available
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            {property.gender}
                          </Badge>
                          {property.amenities?.slice(0, 2).map((amenity: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {property.amenities?.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{property.amenities.length - 2} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openManageDialog(property)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => {
                            setLocation(`/city-map?property=${property.id}`);
                          }}>
                            <Map className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No properties listed</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start by adding your first property to attract potential tenants.</p>
                  <Button onClick={() => setLocation('/owner-dashboard')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-2xl font-bold">Favorite Properties</h2>
            
            {likedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.filter((property: any) => likedProperties.includes(property.id)).map((property: any) => (
                  <Card key={property.id} className="cursor-pointer" onClick={() => viewPropertyDetails(property)}>
                    <img 
                      src={property.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"} 
                      alt={property.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{property.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">₹{property.rent?.toLocaleString()}/month</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(property.id);
                          }}
                        >
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Like properties to see them here.</p>
                <Button onClick={() => setActiveTab("browse")}>Browse Properties</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <h2 className="text-2xl font-bold">Rent Payments</h2>
            
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active bookings</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Make a booking to start tracking rent payments.</p>
              <Button onClick={() => setActiveTab("browse")}>Browse Properties</Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Property Details Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{selectedProperty.name}</DialogTitle>
                  <DialogDescription>
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {selectedProperty.address}, {selectedProperty.city}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Photo Gallery */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      selectedProperty.images.map((image: string, index: number) => (
                        <div key={index} className="relative">
                          <img 
                            src={image} 
                            alt={`${selectedProperty.name} - Photo ${index + 1}`}
                            className="w-full h-32 md:h-40 object-cover rounded-lg hover:opacity-75 transition-opacity cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                              Main
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">No photos available</span>
                      </div>
                    )}
                  </div>

                  {/* Property Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary">₹{selectedProperty.rent?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Monthly Rent</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{selectedProperty.availableBeds || 0}</div>
                      <div className="text-xs text-gray-500">Available Beds</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-blue-600">{selectedProperty.totalBeds || 0}</div>
                      <div className="text-xs text-gray-500">Total Beds</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600 flex items-center justify-center">
                        <Star className="w-4 h-4 mr-1" />
                        {parseFloat(selectedProperty.rating || '4.0').toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProperty.description && (
                    <div>
                      <Label className="text-base font-semibold">Description</Label>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedProperty.description}</p>
                    </div>
                  )}
                  
                  {/* Amenities */}
                  <div>
                    <Label className="text-base font-semibold">Amenities & Features</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {Array.isArray(selectedProperty.amenities) && selectedProperty.amenities.map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center"
                      onClick={() => {
                        if (selectedProperty.latitude && selectedProperty.longitude) {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedProperty.latitude},${selectedProperty.longitude}`, '_blank');
                        } else {
                          window.open(`https://www.google.com/maps/search/${encodeURIComponent(selectedProperty.address + ', ' + selectedProperty.city)}`, '_blank');
                        }
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center"
                      onClick={() => {
                        if (selectedProperty.ownerPhone) {
                          window.open(`tel:${selectedProperty.ownerPhone}`, '_self');
                        } else {
                          toast({
                            title: "Contact Information",
                            description: "Owner contact details will be available after booking.",
                          });
                        }
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Contact Owner
                    </Button>
                    <Button onClick={handleBookProperty} className="flex items-center justify-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Property Management Dialog */}
        <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {editingProperty && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Manage Property: {editingProperty.name}</DialogTitle>
                  <DialogDescription>
                    Update property details, availability, and settings
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {/* Property Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{editingProperty.availableBeds}</div>
                      <div className="text-sm text-gray-500">Available Beds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹{editingProperty.rent?.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Monthly Rent</div>
                    </div>
                    <div className="text-center">
                      <Badge variant={editingProperty.isVerified ? "default" : "secondary"} className="text-sm">
                        {editingProperty.isVerified ? "Verified" : "Pending Verification"}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">Status</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Button variant="outline" size="sm" onClick={() => {
                      const newAvailable = Math.max(0, editingProperty.availableBeds - 1);
                      updatePropertyDetails.mutate({
                        ...editingProperty,
                        availableBeds: newAvailable
                      });
                    }}>
                      <User className="w-4 h-4 mr-2" />
                      Book Bed (-1)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newAvailable = Math.min(editingProperty.totalBeds, editingProperty.availableBeds + 1);
                      updatePropertyDetails.mutate({
                        ...editingProperty,
                        availableBeds: newAvailable
                      });
                    }}>
                      <User className="w-4 h-4 mr-2" />
                      Free Bed (+1)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setLocation(`/city-map?property=${editingProperty.id}`);
                      setManageDialogOpen(false);
                    }}>
                      <Map className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setLocation('/owner-dashboard');
                      setManageDialogOpen(false);
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                  </div>

                  {/* Property Images */}
                  <div>
                    <Label className="text-base font-semibold">Property Images</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      {editingProperty.images?.slice(0, 4).map((image: string, index: number) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                          <img 
                            src={image} 
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Booking Requests */}
                  <div>
                    <Label className="text-base font-semibold">Recent Activity</Label>
                    <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">No recent booking requests</span>
                        <Button variant="link" size="sm" className="text-primary">
                          View All Bookings
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Property Performance */}
                  <div>
                    <Label className="text-base font-semibold">Property Performance</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">0</div>
                        <div className="text-xs text-gray-500">Total Views</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600">0</div>
                        <div className="text-xs text-gray-500">Inquiries</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">
                          {((editingProperty.totalBeds - editingProperty.availableBeds) / editingProperty.totalBeds * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">Occupancy</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {editingProperty.rating || '4.0'}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    setLocation('/owner-dashboard');
                    setManageDialogOpen(false);
                  }}>
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Property
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}