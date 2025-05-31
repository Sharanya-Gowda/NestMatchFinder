import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-simple";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function BookingSimple() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get property ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('propertyId');
  
  const [moveInDate, setMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login first');
      setLocation('/login');
      return;
    }

    if (!propertyId) {
      alert('Property ID missing');
      return;
    }

    if (!moveInDate || !moveOutDate) {
      alert('Please select both dates');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        propertyId: parseInt(propertyId),
        userId: user.id,
        rent: 10500,
        securityDeposit: 5000,
        moveInDate: new Date(moveInDate),
        moveOutDate: new Date(moveOutDate),
        status: 'pending',
        requestedDate: new Date(),
      };

      console.log("Creating booking:", bookingData);

      const response = await apiRequest('POST', '/api/bookings', bookingData);
      
      if (response.ok) {
        // Invalidate queries to refresh the bookings list
        queryClient.invalidateQueries({ queryKey: [`/api/bookings/user/${user.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
        
        alert('Booking request sent successfully!');
        setLocation('/dashboard/user');
      } else {
        const error = await response.json();
        console.error('Booking failed:', error);
        alert('Booking failed: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        
        <button 
          onClick={() => setLocation('/dashboard/user')}
          className="mb-6 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Book Property
          </h1>
          
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            Property ID: {propertyId}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Move-in Date *
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Move-out Date *
              </label>
              <input
                type="date"
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                min={moveInDate || new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message to Owner (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the owner about yourself..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Monthly Rent:</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹10,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Security Deposit:</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹5,000</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}