// @ts-nocheck
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Filter, ArrowLeft, Star, Phone, Navigation, User, Clock, Shield } from "lucide-react";
import MapComponent from "@/components/map-component";
import type { Property } from "@shared/schema";

export default function CityMap() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
  // Get city from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const cityName = urlParams.get('city') || 'Bangalore';
  
  // City coordinates mapping
  const cityCoordinates = {
    'Mumbai': { lat: '19.0760', lng: '72.8777' },
    'Bangalore': { lat: '12.9716', lng: '77.5946' },
    'Delhi': { lat: '28.7041', lng: '77.1025' },
    'Pune': { lat: '18.5204', lng: '73.8567' },
    'Hyderabad': { lat: '17.3850', lng: '78.4867' },
    'Chennai': { lat: '13.0827', lng: '80.2707' },
    'Kolkata': { lat: '22.5726', lng: '88.3639' },
    'Gurgaon': { lat: '28.4595', lng: '77.0266' },
    'Noida': { lat: '28.5355', lng: '77.3910' }
  };
  
  const currentCityCoords = cityCoordinates[cityName as keyof typeof cityCoordinates] || cityCoordinates['Bangalore'];

  // Fetch real properties from the database
  const { data: allProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter properties by the selected city
  const cityProperties = allProperties.filter(property => 
    property.city.toLowerCase() === cityName.toLowerCase()
  );

  const filteredProperties = cityProperties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirections = (property: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;
    window.open(url, '_blank');
  };

  const callOwner = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  PGs in {cityName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredProperties.length} properties found
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="lg:col-span-1">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {cityName} Map View
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-0">
                <MapComponent
                  latitude={currentCityCoords.lat}
                  longitude={currentCityCoords.lng}
                  properties={filteredProperties}
                  height="500px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Properties List */}
          <div className="lg:col-span-1">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredProperties.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
                    <p className="text-sm">No properties available in {cityName} yet.</p>
                  </div>
                </Card>
              ) : (
                filteredProperties.map((property) => (
                  <Card 
                    key={property.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProperty?.id === property.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setLocation('/login')}
                  >
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop'}
                          alt={property.name}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {property.name}
                          </h3>
                          <Badge variant={property.gender === 'male' ? 'default' : 'secondary'}>
                            {property.gender}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.address}
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm font-medium">{property.rating || 'No rating'}</span>
                            <span className="text-sm text-gray-500 ml-1">({property.reviewCount || 0} reviews)</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            ₹{property.rent.toLocaleString()}/month
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span>{property.availableBeds || 0} beds available</span>
                          <span className="mx-2">•</span>
                          <span>{property.amenities?.slice(0, 3).join(', ') || 'Basic amenities'}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}