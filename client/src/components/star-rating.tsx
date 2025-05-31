import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-simple";

interface StarRatingProps {
  propertyId: number;
  currentRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ 
  propertyId, 
  currentRating = 0, 
  onRatingChange,
  readonly = false,
  size = "md" 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const starSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  const createRatingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const response = await apiRequest('POST', '/api/reviews', {
        propertyId,
        rating,
        comment: ""
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedRating(data.rating);
      toast({
        title: "Rating Submitted",
        description: `You rated this property ${data.rating} star${data.rating !== 1 ? 's' : ''}`,
      });
      // Invalidate property queries to refresh ratings
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      if (onRatingChange) {
        onRatingChange(data.rating);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Rating Failed",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleStarClick = (rating: number) => {
    if (readonly) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to rate properties",
        variant: "destructive",
      });
      return;
    }
    
    createRatingMutation.mutate(rating);
  };

  const handleStarHover = (rating: number) => {
    if (readonly) return;
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || selectedRating;

  return (
    <div className="flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`transition-colors duration-200 ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          disabled={readonly || createRatingMutation.isPending}
        >
          <Star
            className={`${starSize} ${
              star <= displayRating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            } transition-all duration-200`}
          />
        </button>
      ))}
      {!readonly && createRatingMutation.isPending && (
        <span className="text-xs text-gray-500 ml-2">Saving...</span>
      )}
    </div>
  );
}