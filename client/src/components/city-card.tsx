import { Card, CardContent } from "@/components/ui/card";
import { MapPin, IndianRupee } from "lucide-react";

interface CityCardProps {
  name: string;
  pgCount: number;
  startingRent: number;
  imageUrl: string;
  onClick: () => void;
}

export default function CityCard({ name, pgCount, startingRent, imageUrl, onClick }: CityCardProps) {
  return (
    <Card className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3 hover:rotate-1 border border-gray-200 dark:border-gray-700" onClick={onClick}>
      <div className="relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={`${name} skyline`} 
          className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-125 group-hover:brightness-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-blue-600 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          Popular
        </div>
      </div>
      <CardContent className="p-6 transform transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-indigo-50 dark:group-hover:from-blue-900/20 dark:group-hover:to-indigo-900/20">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:text-2xl">{name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-3 transition-all duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-200 group-hover:font-medium">
          <span className="inline-block transition-transform duration-300 group-hover:scale-110">{pgCount.toLocaleString()}</span> PGs available
        </p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 transition-all duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          <IndianRupee className="h-4 w-4 mr-1 transition-all duration-300 group-hover:scale-125 group-hover:text-emerald-500" />
          <span className="transition-all duration-300 group-hover:font-bold group-hover:text-base">Starting ₹{startingRent.toLocaleString()}/month</span>
        </div>
        
        {/* Animated bottom border */}
        <div className="mt-4 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </CardContent>
    </Card>
  );
}
