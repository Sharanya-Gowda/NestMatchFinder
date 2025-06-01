// @ts-nocheck
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, signupSchema, insertBookingSchema, insertPropertySchema, insertReviewSchema, insertFavoriteSchema
} from "@shared/schema";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nestmatch_secret_key";

// Extend Express Request interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    userType: string;
  };
}

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("Signup request body:", req.body);
      const validatedData = signupSchema.parse(req.body);
      console.log("Validation successful:", validatedData);
      const { confirmPassword, ...userData } = validatedData;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        console.log("Signup failed: User already exists", { email: userData.email, userType: userData.userType });
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser({
        ...userData,
        password: userData.password,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: "User created successfully",
        user: { ...user, password: undefined },
        token,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle Zod validation errors specifically
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid input data",
          details: error.errors,
          fieldErrors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      return res.status(400).json({ 
        message: error.message || "Registration failed",
        details: error.errors || null
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login attempt:", req.body);
      const { email, password, userType } = req.body;
      
      if (!email || !password || !userType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await storage.getUserByEmail(email);
      console.log("User found:", user ? { id: user.id, email: user.email, userType: user.userType } : "No user found");
      
      if (!user || user.userType !== userType) {
        console.log("Login failed: User not found or wrong userType", { 
          email, 
          requestedUserType: userType, 
          userExists: !!user, 
          actualUserType: user?.userType 
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = password === user.password;
      if (!isValidPassword) {
        console.log("Login failed: Invalid password for user:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.userType },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`User authenticated: ID ${user.id}, Email: ${user.email}, Type: ${user.userType}`);
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const { city, minRent, maxRent, gender } = req.query;
      
      if (city || minRent || maxRent || gender) {
        const properties = await storage.searchProperties({
          city: city as string,
          minRent: minRent ? parseInt(minRent as string) : undefined,
          maxRent: maxRent ? parseInt(maxRent as string) : undefined,
          gender: gender as string,
        });
        res.json(properties);
      } else {
        const properties = await storage.getAllProperties();
        console.log(`All properties in system:`, properties.length);
        res.json(properties);
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(parseInt(req.params.id));
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/properties", authenticateToken, async (req: any, res: any) => {
    try {
      if (req.user.userType !== 'owner') {
        return res.status(403).json({ message: "Only owners can create properties" });
      }

      console.log("Creating property with data:", req.body);
      
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        ownerId: req.user.id,
        isActive: true,
        isVerified: true, // Auto-approve for now
      });

      const property = await storage.createProperty(propertyData);
      console.log("Property created successfully:", property.id);
      res.status(201).json(property);
    } catch (error) {
      console.error("Property creation error:", error);
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/properties/owner/:ownerId", authenticateToken, async (req: any, res: any) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      console.log(`Requested owner ID: ${ownerId}, User ID: ${req.user.id}, User email: ${req.user.email}`);
      
      if (req.user.id !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const properties = await storage.getPropertiesByOwner(ownerId);
      console.log(`Fetching properties for owner ${ownerId}:`, properties.length, properties.map(p => p.name));
      res.json(properties);
    } catch (error) {
      console.error("Error fetching owner properties:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/properties/city/:city", async (req, res) => {
    try {
      const properties = await storage.getPropertiesByCity(req.params.city);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update property route
  app.put("/api/properties/:id", authenticateToken, async (req: any, res: any) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Filter out fields that shouldn't be updated and problematic timestamp fields
      const { id, ownerId, createdAt, isActive, isVerified, ...updateData } = req.body;
      
      const updatedProperty = await storage.updateProperty(propertyId, updateData);
      if (!updatedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(updatedProperty);
    } catch (error) {
      console.error("Property update error:", error);
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  // Delete property route
  app.delete("/api/properties/:id", authenticateToken, async (req: any, res: any) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if there are any active bookings for this property
      const bookings = await storage.getBookingsByProperty(propertyId);
      const activeBookings = bookings.filter(b => b.status === 'approved' || b.status === 'pending');
      
      if (activeBookings.length > 0) {
        return res.status(400).json({ 
          message: "Cannot delete property with active bookings. Please cancel all bookings first." 
        });
      }

      const success = await storage.deleteProperty(propertyId);
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Property deletion error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Booking routes
  app.post("/api/bookings", authenticateToken, async (req: any, res: any) => {
    try {
      console.log("Booking creation attempt:", {
        user: req.user,
        body: req.body
      });
      
      if (req.user.userType !== 'user') {
        return res.status(403).json({ message: "Only users can create bookings" });
      }

      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      console.log("Parsed booking data:", bookingData);
      
      // Get the property to check availability and update beds
      const property = await storage.getProperty(bookingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      if (property.availableBeds <= 0) {
        return res.status(400).json({ message: "No beds available" });
      }
      
      // Create the booking
      const booking = await storage.createBooking(bookingData);
      console.log("Created booking:", booking);
      
      // Decrease available beds when booking is created (pending status)
      await storage.updateProperty(property.id, {
        availableBeds: property.availableBeds - 1
      });
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.get("/api/bookings/user/:userId", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = parseInt(req.params.userId);
      console.log("Getting bookings for user:", userId, "authenticated user:", req.user.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getBookingsByUser(userId);
      console.log("Found bookings for user:", bookings);
      res.json(bookings);
    } catch (error) {
      console.error("Error getting user bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/bookings/owner/:ownerId", authenticateToken, async (req: any, res: any) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      console.log("Getting bookings for owner:", ownerId, "authenticated user:", req.user.id);
      
      if (req.user.id !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getBookingsByOwner(ownerId);
      console.log("Found bookings for owner:", bookings);
      res.json(bookings);
    } catch (error) {
      console.error("Error getting owner bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, async (req: any, res: any) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user is owner of the property
      const property = await storage.getProperty(booking.propertyId);
      if (!property || property.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // If booking is being approved, decrease available beds
      if (req.body.status === 'approved' && booking.status !== 'approved') {
        if (property.availableBeds > 0) {
          await storage.updateProperty(property.id, {
            availableBeds: property.availableBeds - 1
          });
        } else {
          return res.status(400).json({ message: "No available beds remaining" });
        }
      }

      // If booking is being rejected after being approved, increase available beds
      if (req.body.status === 'rejected' && booking.status === 'approved') {
        await storage.updateProperty(property.id, {
          availableBeds: property.availableBeds + 1
        });
      }

      const updatedBooking = await storage.updateBooking(bookingId, {
        ...req.body,
        approvedDate: req.body.status === 'approved' ? new Date() : booking.approvedDate,
      });

      res.json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/bookings/:id", authenticateToken, async (req: any, res: any) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user is the one who made the booking or owner of the property
      const property = await storage.getProperty(booking.propertyId);
      if (booking.userId !== req.user.id && (!property || property.ownerId !== req.user.id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Increase available beds only if the booking was approved (since we decrease them when booking is approved)
      if (property && booking.status === 'approved') {
        await storage.updateProperty(property.id, {
          availableBeds: property.availableBeds + 1
        });
      }

      const deleted = await storage.deleteBooking(bookingId);
      if (deleted) {
        res.json({ message: "Booking cancelled successfully" });
      } else {
        res.status(500).json({ message: "Failed to cancel booking" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Rating routes
  app.post("/api/ratings", authenticateToken, async (req: any, res: any) => {
    try {
      if (req.user.userType !== 'user') {
        return res.status(403).json({ message: "Only users can rate properties" });
      }

      const { propertyId, rating } = req.body;
      
      if (!propertyId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Valid property ID and rating (1-5) required" });
      }

      // Check if property exists
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Create or update rating
      const ratingData = {
        userId: req.user.id,
        propertyId: parseInt(propertyId),
        rating: parseInt(rating),
      };

      const createdRating = await storage.createReview(ratingData);
      
      // Update property's average rating
      const allRatings = await storage.getReviewsByProperty(propertyId);
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      
      await storage.updateProperty(propertyId, {
        rating: (Math.round(avgRating * 10) / 10).toString(), // Convert to string for decimal field
        reviewCount: allRatings.length
      });

      res.json({ rating: createdRating.rating, message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Rating creation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/user/:userId", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = parseInt(req.params.userId);
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: any, res: any) => {
    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const favorite = await storage.createFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.delete("/api/favorites/:propertyId", authenticateToken, async (req: any, res: any) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const deleted = await storage.deleteFavorite(req.user.id, propertyId);
      
      if (deleted) {
        res.json({ message: "Favorite removed" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/property/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Ratings endpoint (simplified review for star ratings)
  app.post("/api/ratings", authenticateToken, async (req: any, res: any) => {
    try {
      const { propertyId, rating } = req.body;
      
      if (!propertyId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Invalid rating data" });
      }

      const reviewData = {
        propertyId: parseInt(propertyId),
        userId: req.user.id,
        rating: parseInt(rating),
        comment: null
      };

      const review = await storage.createReview(reviewData);
      res.status(201).json({ rating: review.rating, propertyId: review.propertyId });
    } catch (error) {
      console.error("Rating creation error:", error);
      res.status(400).json({ message: "Failed to submit rating" });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req: any, res: any) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  // User profile update route
  app.put("/api/users/:id", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Favorites routes
  app.get("/api/favorites/:userId", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const favorites = await storage.getFavoritesByUser(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req: any, res: any) => {
    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const favorite = await storage.createFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/favorites/:userId/:propertyId", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = parseInt(req.params.userId);
      const propertyId = parseInt(req.params.propertyId);
      
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteFavorite(userId, propertyId);
      if (deleted) {
        res.json({ message: "Favorite removed successfully" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Rent payment tracking routes (simple confirmation system)
  app.get("/api/rent-payments/user/:userId", authenticateToken, async (req: any, res: any) => {
    try {
      const userId = parseInt(req.params.userId);
      const payments = await storage.getRentPaymentsByUser(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/rent-payments/owner/:ownerId", authenticateToken, async (req: any, res: any) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      const payments = await storage.getRentPaymentsByOwner(ownerId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/rent-payments", authenticateToken, async (req: any, res: any) => {
    try {
      const { bookingId, amount, paymentMonth, paymentMethod, notes } = req.body;
      
      // Get booking details to get property and owner info
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const property = await storage.getProperty(booking.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const payment = await storage.createRentPayment({
        userId: booking.userId,
        propertyId: booking.propertyId,
        bookingId,
        amount,
        paymentMonth,
        paymentDate: new Date(),
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        status: 'pending' // pending, confirmed_by_user, confirmed_by_owner, completed
      });

      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });

  app.patch("/api/rent-payments/:id/status", authenticateToken, async (req: any, res: any) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['confirmed_by_user', 'confirmed_by_owner', 'completed'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const payment = await storage.updateRentPaymentStatus(paymentId, status);
      if (payment) {
        res.json(payment);
      } else {
        res.status(404).json({ message: "Payment not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}