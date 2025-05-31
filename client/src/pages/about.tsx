import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, MapPin, Heart, Award, Clock } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">About NestMatch</h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto">
              Revolutionizing the way people find their perfect living spaces through smart matching and verified accommodations.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              To make finding the perfect PG accommodation as simple as finding your ideal roommate - 
              through technology, trust, and community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Our AI-powered algorithm matches you with compatible roommates based on lifestyle preferences, habits, and interests.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <CardTitle>Verified Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Every property and owner is thoroughly verified to ensure safety, authenticity, and quality for our users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MapPin className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <CardTitle>Location Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Find accommodations near your workplace, college, or preferred areas with our advanced location-based search.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                NestMatch was born from the frustration of finding suitable PG accommodations in India's bustling metro cities. 
                Our founders experienced firsthand the challenges of lengthy searches, compatibility issues with roommates, 
                and concerns about property authenticity.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We realized that technology could solve these problems by creating a platform that not only lists properties 
                but also ensures compatibility between residents and maintains high standards of verification.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Today, NestMatch serves thousands of users across major Indian cities, helping them find not just a place to stay, 
                but a place to call home.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">10,000+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <MapPin className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cities Covered</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Heart className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">24/7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Trust</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Building trust through transparency and verified information
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-100 dark:bg-teal-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Creating connections that last beyond accommodation
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-cyan-100 dark:bg-cyan-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Continuously improving our platform and services
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-emerald-100 dark:bg-emerald-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Care</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Putting user needs and safety at the center of everything we do
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}