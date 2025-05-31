import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  latitude?: string;
  longitude?: string;
  properties?: Array<{
    id: number;
    name: string;
    latitude?: string;
    longitude?: string;
    rent?: number;
    images?: string[];
    address?: string;
  }>;
  height?: string;
}

export default function MapComponent({ 
  latitude = "12.9716", 
  longitude = "77.5946", 
  properties = [], 
  height = "400px" 
}: MapComponentProps) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS and JS for OpenStreetMap
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Add Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Add Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setMapLoaded(true);
        };
        document.head.appendChild(script);
      } else if (window.L) {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.L) {
      // Initialize the map
      const map = window.L.map(mapRef.current).setView([parseFloat(latitude), parseFloat(longitude)], 13);

      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add property markers
      console.log('Adding markers for properties:', properties);
      properties.forEach((property, index) => {
        console.log(`Property ${index}:`, {
          name: property.name,
          latitude: property.latitude,
          longitude: property.longitude,
          type: typeof property.latitude,
          parsed: parseFloat(property.latitude || '0')
        });
        
        const lat = property.latitude ? parseFloat(property.latitude) : parseFloat(latitude) + (Math.random() - 0.5) * 0.01;
        const lng = property.longitude ? parseFloat(property.longitude) : parseFloat(longitude) + (Math.random() - 0.5) * 0.01;
        
        console.log(`Creating marker at [${lat}, ${lng}] for ${property.name}`);
        const marker = window.L.marker([lat, lng]).addTo(map);
        
        const popupContent = `
          <div style="min-width: 200px;">
            <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&h=120&fit=crop'}" 
                 style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">${property.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${property.address || 'Address not available'}</p>
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #059669;">₹${property.rent || '8000'}/month</p>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
          setSelectedProperty(property);
        });
      });

      // Cleanup function
      return () => {
        map.remove();
      };
    }
  }, [mapLoaded, latitude, longitude, properties]);

  if (!mapLoaded) {
    return (
      <div 
        className="w-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 rounded-lg relative overflow-hidden border flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full rounded-lg relative overflow-hidden border"
      style={{ height }}
    >
      <div ref={mapRef} className="w-full h-full" />

      {/* Property popup for selected property */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 animate-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-3">
            <img
              src={selectedProperty.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=80&h=80&fit=crop"}
              alt={selectedProperty.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedProperty.name}</h3>
              <p className="text-sm text-gray-500">{selectedProperty.address}</p>
              <p className="text-lg font-bold text-primary">₹{selectedProperty.rent}/month</p>
              <div className="flex items-center mt-1">
                <MapPin className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Interactive OpenStreetMap</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedProperty(null)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Map info overlay */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{properties.length} Properties</p>
          <p className="text-xs text-gray-500">OpenStreetMap</p>
        </div>
      </div>

      {/* Location info */}
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {parseFloat(latitude).toFixed(3)}, {parseFloat(longitude).toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
