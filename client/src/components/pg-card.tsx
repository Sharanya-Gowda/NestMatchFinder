import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Users, Bed } from "lucide-react";
import type { Property } from "@shared/schema";
import StarRating from "./star-rating";

interface PGCardProps {
  property: Property;
  onClick: () => void;
  compatibilityScore?: number;
}

export default function PGCard({ property, onClick, compatibilityScore }: PGCardProps) {
  const images = Array.isArray(property.images) ? property.images : [];
  const amenities = property.amenities as any;
  
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-2 border border-gray-200 dark:border-gray-700" onClick={onClick}>
      <div className="relative overflow-hidden">
        <img 
          src={images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"} 
          alt={property.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {property.isVerified && (
          <Badge variant="secondary" className="absolute top-3 right-3 text-xs bg-green-500/90 text-white backdrop-blur-sm">
            Verified
          </Badge>
        )}
        {compatibilityScore && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-green-600">
            {compatibilityScore}% Match
          </div>
        )}
      </div>
      <CardContent className="p-4 transform transition-all duration-300 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{property.name}</h3>
          <div className="flex items-center space-x-2">
            <StarRating 
              propertyId={property.id} 
              currentRating={typeof property.rating === 'string' ? parseFloat(property.rating) : (property.rating || 0)}
              size="sm"
            />
            {property.reviewCount && property.reviewCount > 0 && (
              <span className="text-xs text-gray-500">({property.reviewCount})</span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-300">
          <MapPin className="h-4 w-4 mr-1 transition-colors duration-300 group-hover:text-blue-500" />
          {property.address}, {property.city}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary transition-all duration-300 group-hover:text-2xl group-hover:text-emerald-600">₹{property.rent.toLocaleString()}/month</span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
            <Users className="h-4 w-4 mr-1 transition-colors duration-300 group-hover:text-green-500" />
            <span className="transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-300">
              {property.gender} only
            </span>
          </div>
          <div className="flex items-center transition-transform duration-300 group-hover:-translate-x-1">
            <Bed className="h-4 w-4 mr-1 transition-colors duration-300 group-hover:text-blue-500" />
            <span className="transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-300">{property.availableBeds} beds available</span>
          </div>
        </div>
        
        {/* Animated progress bar for availability */}
        <div className="mt-3 overflow-hidden">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Availability</span>
            <span>{Math.round((property.availableBeds / property.totalBeds) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-700 group-hover:from-emerald-500 group-hover:to-blue-500"
              style={{ width: `${(property.availableBeds / property.totalBeds) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
